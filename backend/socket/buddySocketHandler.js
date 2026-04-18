const jwt = require("jsonwebtoken");
const xss = require("xss");
const User = require("../models/adminModels/user");
const { getTokenFromSocket } = require("../middleware/socketAuth");
const {
  ipConnections,
  trackIpConnect,
  trackIpDisconnect,
  MAX_CONN_PER_USER,
  MAX_CONN_PER_IP,
} = require("../middleware/socketRateLimit");

const DEFAULT_MAX_MESSAGE_LENGTH = 400;

const formatMessage = (message) => ({
  id: String(message._id),
  text: message.text,
  createdAt: message.createdAt,
  sender: {
    id: message.sender?._id ? String(message.sender._id) : "",
    name: message.sender?.name || "Student",
    program: message.sender?.program || null,
    yearLevel: message.sender?.yearLevel ?? null,
    profile: message.sender?.profile || "defaultProfile.png",
  },
});

/**
 * Wire up a buddy chat namespace on the given Socket.io server.
 *
 * @param {import("socket.io").Server} io
 * @param {{
 *   namespace: string,
 *   Model: import("mongoose").Model,
 *   displayName: string,
 *   maxMessageLength?: number
 * }} options
 * @returns {import("socket.io").Namespace}
 */
const createBuddyNamespace = (io, { namespace, Model, displayName, maxMessageLength = DEFAULT_MAX_MESSAGE_LENGTH }) => {
  const ns = io.of(namespace);
  const onlineStudentConnections = new Map();
  const errorPrefix = displayName.toUpperCase().replace(/ /g, "_") + "_SEND_ERROR";

  const emitPresence = () => {
    ns.emit("presence:update", { onlineCount: onlineStudentConnections.size });
  };

  // Auth middleware
  ns.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "name role isActive program yearLevel profile"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      if (user.isActive === false) {
        return next(new Error("Account is disabled"));
      }

      if (user.role !== "student") {
        return next(new Error(`${displayName} is only available to students`));
      }

      socket.data.user = {
        id: String(user._id),
        name: user.name,
        program: user.program || null,
        yearLevel: user.yearLevel ?? null,
        profile: user.profile || "defaultProfile.png",
      };

      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  ns.on("connection", (socket) => {
    const currentUser = socket.data.user;
    const ip = socket.handshake.address;

    if ((onlineStudentConnections.get(currentUser.id) || 0) >= MAX_CONN_PER_USER) {
      socket.emit("error", { message: "Too many connections" });
      socket.disconnect(true);
      return;
    }
    if ((ipConnections.get(ip) || 0) >= MAX_CONN_PER_IP) {
      socket.emit("error", { message: "Too many connections from this address" });
      socket.disconnect(true);
      return;
    }

    onlineStudentConnections.set(
      currentUser.id,
      (onlineStudentConnections.get(currentUser.id) || 0) + 1
    );
    trackIpConnect(ip);
    emitPresence();

    socket.on("message:send", async (payload = {}, callback = () => {}) => {
      try {
        const rawText = typeof payload.text === "string" ? payload.text.trim() : "";
        const text = xss(rawText, { whiteList: {}, stripIgnoreTag: true });

        if (!text) {
          callback({ ok: false, error: "Message cannot be empty" });
          return;
        }

        if (text.length > maxMessageLength) {
          callback({
            ok: false,
            error: `Message must be ${maxMessageLength} characters or fewer`,
          });
          return;
        }

        let message = await Model.create({ sender: currentUser.id, text });
        message = await message.populate("sender", "name program yearLevel profile");

        ns.emit("message:new", formatMessage(message));
        callback({ ok: true });
      } catch (err) {
        console.error(`${errorPrefix}:`, err);
        callback({ ok: false, error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const remaining = (onlineStudentConnections.get(currentUser.id) || 1) - 1;

      if (remaining <= 0) {
        onlineStudentConnections.delete(currentUser.id);
      } else {
        onlineStudentConnections.set(currentUser.id, remaining);
      }

      trackIpDisconnect(ip);
      emitPresence();
    });
  });

  return ns;
};

module.exports = { createBuddyNamespace };
