import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlenght: 6,
  },
  profilePic: {
    type: String,
    default: "",
  },
  isVerified: {
      type: Boolean,
      default: false
  },
  verificationToken: {
  type: String,
  },
  verificationTokenExpiresAt: {
  type: Date,
  },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
