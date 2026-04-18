const PartyBuddyMessage = require("../models/studentModels/partyBuddyMessage");
const { createBuddyNamespace } = require("./buddySocketHandler");

module.exports = (io) =>
  createBuddyNamespace(io, {
    namespace: "/party-buddy",
    Model: PartyBuddyMessage,
    displayName: "Party Buddy",
  });
