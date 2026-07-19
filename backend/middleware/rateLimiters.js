/**
 * HTTP rate limiting — all buckets and their shared keying strategy.
 *
 * (Socket.io connection caps are separate: see `middleware/socketRateLimit.js`.)
 *
 * `configureTrustProxy` lives here rather than in `server.js` on purpose. Proxy trust
 * and rate limiting are not independent settings: getting `trust proxy` wrong silently
 * breaks every limiter in this file, in one of two directions.
 *   - Too low behind a proxy  → every request carries the proxy's address, so all
 *     IP-keyed traffic shares a single bucket and the first users through exhaust it.
 *   - Set to `true`           → the whole X-Forwarded-For chain is trusted, and any
 *     client can forge a header to get an unlimited supply of fresh buckets.
 * Keeping them in one file makes that coupling visible to whoever changes either.
 */

const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const API_MAX = Number(process.env.RATE_LIMIT_MAX) || 600;
const LIBRARY_MAX = Number(process.env.LIBRARY_RATE_LIMIT_MAX) || 30;
const AUTH_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 15;
const OTP_MAX = Number(process.env.OTP_RATE_LIMIT_MAX) || 5;

const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY_HOPS) || 0;

/**
 * Number of reverse proxies in front of this server. Default 0 = trust nothing, so
 * `req.ip` is the real socket address and X-Forwarded-For is ignored entirely.
 * Set TRUST_PROXY_HOPS=1 behind a single nginx / load balancer / PaaS router.
 * Never pass `true` — see the note at the top of this file.
 */
function configureTrustProxy(app) {
  app.set("trust proxy", TRUST_PROXY_HOPS);

  if (process.env.NODE_ENV === "production" && TRUST_PROXY_HOPS === 0) {
    console.warn(
      "RATE_LIMIT_WARNING: NODE_ENV=production but TRUST_PROXY_HOPS=0. " +
        "If this server sits behind a reverse proxy, req.ip will be the proxy's address " +
        "and IP-keyed rate limits will bucket all unauthenticated traffic together. " +
        "Set TRUST_PROXY_HOPS to the number of proxies in front of it."
    );
  }

  return TRUST_PROXY_HOPS;
}

/**
 * Key authenticated traffic by user id rather than IP.
 *
 * IP keying is wrong in both directions here: behind a proxy every request shares the
 * proxy's address, so one bucket would throttle the entire user base; and on shared
 * campus NAT/wifi, students would consume each other's quota.
 *
 * The JWT is already on the request, so decode it — deliberately without verifying.
 * `authMiddleware` still does the real signature check downstream, and a forged token
 * buys an attacker nothing here but a bucket of their own.
 *
 * Unauthenticated requests fall back to `ipKeyGenerator`, which normalises IPv6 into
 * subnets so a client cannot rotate through addresses within its own /64.
 */
function keyByUserOrIp(req, _res) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const decoded = jwt.decode(authHeader.slice(7).trim());
      if (decoded?.id) return `u:${decoded.id}`;
    } catch {
      // Malformed token — fall through to IP keying.
    }
  }

  return ipKeyGenerator(req.ip);
}

const baseOptions = {
  windowMs: WINDOW_MS,
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Auth endpoints (login, register). Deliberately IP-keyed: there is no authenticated
 * user yet, and this is the bucket that has to absorb credential stuffing.
 */
const authLimiter = rateLimit({
  ...baseOptions,
  max: AUTH_MAX,
  message: { message: "Too many requests, please try again later" },
});

/** General bucket, applied to every authenticated data route. */
const apiLimiter = rateLimit({
  ...baseOptions,
  max: API_MAX,
  keyGenerator: keyByUserOrIp,
  message: { message: "Too many requests, please try again later" },
});

/**
 * Outbound OpenLibrary proxy. Stacked on top of `apiLimiter` with a much smaller
 * allowance, because each call here costs us a third-party request.
 */
const libraryLimiter = rateLimit({
  ...baseOptions,
  max: LIBRARY_MAX,
  keyGenerator: keyByUserOrIp,
  message: { message: "Too many book searches, please slow down" },
});

/**
 * OTP send/verify. Keyed by the target email so an attacker cannot cycle IPs to brute
 * a single account, falling back to the normalised IP when no email was supplied.
 */
const otpLimiter = rateLimit({
  ...baseOptions,
  max: OTP_MAX,
  keyGenerator: (req, res) => {
    const email = req.body?.email;
    if (typeof email === "string" && email.trim()) return `e:${email.trim().toLowerCase()}`;
    return ipKeyGenerator(req.ip);
  },
  message: { message: "Too many OTP requests, please try again later" },
});

module.exports = {
  configureTrustProxy,
  keyByUserOrIp,
  authLimiter,
  apiLimiter,
  libraryLimiter,
  otpLimiter,
  limits: { WINDOW_MS, API_MAX, LIBRARY_MAX, AUTH_MAX, OTP_MAX, TRUST_PROXY_HOPS },
};
