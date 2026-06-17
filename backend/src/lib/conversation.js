import Conversation from "../models/Conversation.js";

export const sortedParticipants = (userIdA, userIdB) => {
  const a = userIdA.toString();
  const b = userIdB.toString();
  return a < b ? [userIdA, userIdB] : [userIdB, userIdA];
};

export const findConversation = async (userIdA, userIdB) => {
  const participants = sortedParticipants(userIdA, userIdB);
  return Conversation.findOne({ participants });
};

export const upsertConversation = async (userIdA, userIdB, data) => {
  const participants = sortedParticipants(userIdA, userIdB);
  return Conversation.findOneAndUpdate(
    { participants },
    { participants, ...data },
    { upsert: true, returnDocument: "after" }
  );
};
