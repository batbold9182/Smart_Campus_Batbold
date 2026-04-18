const LearningBuddyMessage = require("../models/studentModels/learningBuddyMessage");
const { createBuddyNamespace } = require("./buddySocketHandler");

module.exports = (io) =>
  createBuddyNamespace(io, {
    namespace: "/learning-buddy",
    Model: LearningBuddyMessage,
    displayName: "Learning Buddy",
  });
