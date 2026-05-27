import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/utils.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../emails/email.js";
import cloudinary from 'cloudinary';

export const signup = async  (req, res) => {
  const { fullName, email, password} = req.body;

  try {
    if(!fullName || !email || !password){
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (password.length <6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({email});
    if (user) {
      return res.status(400).json({ message: "UserEmail already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User ({
        fullName,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 //24 hours
    });

   if(newUser){
    generateToken(newUser._id, res);
    await newUser.save();

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json ({
      success: true,
      message: "User created successfully",
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      isVerified: newUser.isVerified,
    });
   }else{
    res.status(400).json({ message: "Invalid user data" });
   }

  } catch (error) {

    console.log("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }

};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  console.log("Verification code received:", code);
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: {$gt: Date.now()},
    });
    if(!user) {
      return res.status(400).json ({
          success: false,
          message: "Invalid or expired verification code"
      });
    }

    user.isVerified =true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.fullName);

    res.status(200).json ({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password:undefined,
      },
    });
  } catch (error) {

    console.log("Error during email verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email});
    if(!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });


     generateToken(user._id, res);
     res.status(200).json ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
     });
  } catch (error) {
    console.error("error in login controller:", error);
    res.status(500).json({message: "internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;// destructuring profilePic from req.body

    if(!profilePic) return res.status(400).json({ message: "Profile picture is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

   const updatedUser =  await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true }).select("-password");

   res.status(200).json({updatedUser});

    }catch (error) {

    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });

  }
};
