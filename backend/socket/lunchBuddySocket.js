const jwt = require("jsonwebtoken");
const User = require("../models/user");
const LunchBuddyMessage = require("../models/lunchBuddyMessage");

const NAMESPACE = "/lunch-buddy";
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
        return next(new Error("Lunch Buddy is only available to students"));
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
    const activeConnections = onlineStudentConnections.get(currentUser.id) || 0;
    onlineStudentConnections.set(currentUser.id, activeConnections + 1);
    emitPresence(namespace);

    socket.on("message:send", async (payload = {}, callback = () => {}) => {
      try {
        const text = typeof payload.text === "string" ? payload.text.trim() : "";

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

        let message = await LunchBuddyMessage.create({
          sender: currentUser.id,
          text,
        });

        message = await message.populate("sender", "name program yearLevel profile");

        namespace.emit("message:new", formatMessage(message));
        callback({ ok: true });
      } catch (err) {
        console.error("LUNCH_BUDDY_SEND_ERROR:", err);
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

      emitPresence(namespace);
    });
  });

  return namespace;
};