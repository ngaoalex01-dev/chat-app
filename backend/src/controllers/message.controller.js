import cloudinary from '../lib/cloudinary.js';
import Message from '../models/message.js';
import User from '../models/User.js';

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
    });

    res.status(200).json(messages);
  } catch (error) {

    console.log("Error in getmessages controller:", error);
    res.status(500).json({ message: "Internal server error" });

  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;


    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
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
      //upload the image to cloudinary and get the URL
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });

      await newMessage.save();

      res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const getChatPartners = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;

//     //find all messages where the looged i  user is either the sender or the reciever
//     const messages = await Message.find({
//       $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
//     });

//     const chatPartnerIds = [
//       ...new Set(
//         messages.map((msg) =>
//         msg.senderId.toString() === loggedInUserId.toString()
//           ? msg.receiverId.toString()
//           : msg.senderId.toString()
//         )
//       ),
//     ];

//     const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

//     res.status(200).json(chatPartners);
//   } catch (error) {
//     console.log("Error in getChatPartners controller:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const getChatPartners = async (req, res) => {
  try {

    const loggedInUserId = req.user._id;

    const chatPartners = await Message.aggregate([

      // Find messages involving logged-in user
      {
        $match: {
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId }
          ]
        }
      },

      // Determine the other user
      {
        $project: {
          chatPartner: {
            $cond: {
              if: { $eq: ["$senderId", loggedInUserId] },
              then: "$receiverId",
              else: "$senderId"
            }
          }
        }
      },

      // Remove duplicates
      {
        $group: {
          _id: "$chatPartner"
        }
      },

      // Join with users collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },

      // Convert user array into object
      {
        $unwind: "$user"
      },

      // Remove password field
      {
        $project: {
          "user.password": 0
        }
      }

    ]);

    res.status(200).json(chatPartners);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};
