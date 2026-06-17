import cloudinary from '../lib/cloudinary.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { getReceiverSocketId, io } from "../lib/socket.js";
import { findConversation, upsertConversation } from "../lib/conversation.js";

const populatePinnedMessage = (messageId) =>
  Message.findById(messageId).populate("replyTo", "text image senderId audio");

export const getAllContacts = async (req, res) => {
  try {
    //get the id of the currently logged in user from the request object (set by the auth middleware)
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .populate("replyTo", "text image senderId audio")
      .sort({ createdAt: 1 });

    const conversation = await findConversation(myId, userToChatId);
    let pinnedMessage = null;

    if (conversation?.pinnedMessageId) {
      pinnedMessage = await populatePinnedMessage(conversation.pinnedMessageId);
    }

    res.status(200).json({ messages, pinnedMessage });
  } catch (error) {

    console.log("Error in getmessages controller:", error);
    res.status(500).json({ message: "Internal server error" });

  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;


    if (!text && !image && !audio) {
      return res.status(400).json({ message: "Text, image, or audio is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video",
        folder: "voice_notes",
      });
      audioUrl = uploadResponse.secure_url;
    }

      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
        audio: audioUrl,
        replyTo: replyTo || null,
      });

      await newMessage.save();
      await newMessage.populate("replyTo", "text image senderId");

       const receiverSocketId = getReceiverSocketId(receiverId);
       if (receiverSocketId) {//if the receive is online send the new message to them in real time using socket.io
         io.to(receiverSocketId).emit("newMessage", newMessage);
       }
      res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const chatPartners = await Message.aggregate([
      {// find all the messages where the logged in user is either the sender or the receiver
        $match: {
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId },
          ],
        },
      },
      {// get the other chatprtner's id
        $addFields: {
          chatPartner: {
            $cond: {
              if: { $eq: ["$senderId", loggedInUserId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },// sort the messages by createdAt in descending order so that the most recent message for each chat partner is at the top
      {
        $group: {
          _id: "$chatPartner",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {// get extra details of the chat partner from the users collection using id and store it in a field called user
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },//take the first item from the user array and turn it into a normal object so that we can access the user's details directly
      {
        $project: {
          _id: 1,
          lastMessage: {
            _id: "$lastMessage._id",
            text: "$lastMessage.text",
            image: "$lastMessage.image",
            audio: "$lastMessage.audio",
            senderId: "$lastMessage.senderId",
            createdAt: "$lastMessage.createdAt",
          },
          user: {
            _id: "$user._id",
            email: "$user.email",
            fullName: "$user.fullName",
            profilePic: "$user.profilePic",
            isVerified: "$user.isVerified",
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },// newes conversation appear at the top of the list
    ]);

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log("Error in getChatPartners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    const isParticipant =
      message.senderId.equals(userId) || message.receiverId.equals(userId);

    if (!isParticipant) {
      return res.status(403).json({ message: "Not allowed to pin this message." });
    }

    const partnerId = message.senderId.equals(userId)
      ? message.receiverId
      : message.senderId;

    await upsertConversation(userId, partnerId, { pinnedMessageId: messageId });

    const pinnedMessage = await populatePinnedMessage(messageId);

    const partnerSocketId = getReceiverSocketId(partnerId.toString());
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("messagePinned", { pinnedMessage });
    }

    res.status(200).json({ pinnedMessage });
  } catch (error) {
    console.log("Error in pinMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unpinMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { partnerId } = req.params;

    await upsertConversation(userId, partnerId, { pinnedMessageId: null });

    const partnerSocketId = getReceiverSocketId(partnerId);
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("messageUnpinned", { partnerId: userId.toString() });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in unpinMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Text is required." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only edit your own messages." });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();
    await message.populate("replyTo", "text image senderId audio");

    const partnerId = message.receiverId;
    const partnerSocketId = getReceiverSocketId(partnerId.toString());
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("messageUpdated", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in updateMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only delete your own messages." });
    }

    await Message.findByIdAndDelete(messageId);

    const partnerId = message.senderId.equals(userId)
      ? message.receiverId
      : message.senderId;

    const partnerSocketId = getReceiverSocketId(partnerId.toString());
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ messageId });
  } catch (error) {
    console.log("Error in deleteMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
