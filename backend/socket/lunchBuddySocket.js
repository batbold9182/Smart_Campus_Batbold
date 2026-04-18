const LunchBuddyMessage = require("../models/studentModels/lunchBuddyMessage");
const { createBuddyNamespace } = require("./buddySocketHandler");

module.exports = (io) =>
  createBuddyNamespace(io, {
    namespace: "/lunch-buddy",
    Model: LunchBuddyMessage,
    displayName: "Lunch Buddy",
  });
