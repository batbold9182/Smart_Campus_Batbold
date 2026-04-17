const jwt = require("jsonwebtoken");
const xss = require("xss");
const User = require("../models/adminModels/user");
const LearningBuddyMessage = require("../models/studentModels/learningBuddyMessage");
const { ipConnections, trackIpConnect, trackIpDisconnect, MAX_CONN_PER_USER, MAX_CONN_PER_IP } = require("../middleware/socketRateLimit");

const NAMESPACE = "/learning-buddy";
const MAX_MESSAGE_LENGTH = 400;
const onlineStudentConnections = new Map();

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

const getOnlineCount = () => onlineStudentConnections.size;

const emitPresence = (namespace) => {
  namespace.emit("presence:update", { onlineCount: getOnlineCount() });
};

module.exports = (io) => {
  const namespace = io.of(NAMESPACE);

  namespace.use(async (socket, next) => {
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
        return next(new Error("Learning Buddy is only available to students"));
      }

      socket.data.user = {
        id: String(user._id),
        name: user.name,
        program: user.program || null,
        yearLevel: user.yearLevel ?? null,
        profile: user.profile || "defaultProfile.png",
      };

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  namespace.on("connection", (socket) => {
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

    const activeConnections = onlineStudentConnections.get(currentUser.id) || 0;
    onlineStudentConnections.set(currentUser.id, activeConnections + 1);
    trackIpConnect(ip);
    emitPresence(namespace);

    socket.on("message:send", async (payload = {}, callback = () => {}) => {
      try {
        const rawText = typeof payload.text === "string" ? payload.text.trim() : "";
        const text = xss(rawText, { whiteList: {}, stripIgnoreTag: true });

        if (!text) {
          callback({ ok: false, error: "Message cannot be empty" });
          return;
        }

        if (text.length > MAX_MESSAGE_LENGTH) {
          callback({
            ok: false,
            error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
          });
          return;
        }

        let message = await LearningBuddyMessage.create({
          sender: currentUser.id,
          text,
        });

        message = await message.populate("sender", "name program yearLevel profile");

        namespace.emit("message:new", formatMessage(message));
        callback({ ok: true });
      } catch (err) {
        console.error("LEARNING_BUDDY_SEND_ERROR:", err);
        callback({ ok: false, error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const remainingConnections = (onlineStudentConnections.get(currentUser.id) || 1) - 1;

      if (remainingConnections <= 0) {
        onlineStudentConnections.delete(currentUser.id);
      } else {
        onlineStudentConnections.set(currentUser.id, remainingConnections);
      }

      trackIpDisconnect(ip);
      emitPresence(namespace);
    });
  });

  return namespace;
};