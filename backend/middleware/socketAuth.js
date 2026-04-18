/**
 * Extract a Bearer token from a Socket.io handshake.
 * Checks `socket.handshake.auth.token` first, then the Authorization header.
 *
 * @param {import("socket.io").Socket} socket
 * @returns {string|null}
 */
const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authorizationHeader = socket.handshake.headers?.authorization;
  if (
    typeof authorizationHeader === "string" &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    return authorizationHeader.slice(7).trim();
  }

  return null;
};

module.exports = { getTokenFromSocket };
