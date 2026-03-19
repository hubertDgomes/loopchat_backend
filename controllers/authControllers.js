import userSchema from "../model/userSchema.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import emailValidator from "../helper/emailValidator.js";
import imageUpload from "../middleware/cloudinaryMiddleware.js";
import { log } from "console";

const signupController = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All field are requires." });
  }

  const userData = await userSchema.findOne({ email });
  if (userData) {
    return res.status(400).json({ message: "User already exists." });
  }

  const emailCheck = emailValidator(email);
  if (!emailCheck) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = new userSchema({
      fullName,
      email,
      password: hash,
    });
    const savedUser = await user.save();

    req.session.isLoged = true;
    req.session.user = {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.fullName,
    };

    res.status(201).json({ message: "Signup Successfull" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// ==========================================

const signinController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userData = await userSchema.findOne({ email });
    if (!userData) {
      return res.status(400).json({ message: "User hasn't registered yet." });
    }

    const passCheck = await bcrypt.compare(password, userData.password);
    if (!passCheck) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    req.session.isLoged = true;
    req.session.user = {
      id: userData._id,
      email: userData.email,
      name: userData.fullName,
    };

    res.status(201).json({ message: `Login successfully ` });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// ======================================

const profilePhoto = async (req, res) => {
  if (!req.session.isLoged) {
    return res.status(400).json({ message: "You are not logged in." });
  }

  try {
    const imgPath = req.file.path;
    const imgUrl = await imageUpload(imgPath);

    const updateProfile = await userSchema.findByIdAndUpdate(
      req.session.user.id,
      {
        profilePhoto: imgUrl.secure_url,
        isProfileCreated: true,
      },
      { new: true },
    );

    res.status(200).json({ message: "Profile photo updated successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// ===================================================

const getAllUser = async (req, res) => {
  if (!req.session.isLoged) {
    return res.status(400).json({ message: "Login first" });
  }

  try {
    const allUser = await userSchema
      .find({ _id: { $ne: req.session.user.id } })
      .select("-password -email ");
    res.status(201).json(allUser);
  } catch (err) {
    res.status(400).json({ message: err });
  }
};

// ==============================================

const logedUserData = async (req, res) => {
  if (!req.session.isLoged) {
    return res.status(400).json({ message: "Login first" });
  }

  try {
    const getUser = await userSchema
      .findOne({ _id: req.session.user.id })
      .select("-password -isProfileCreated");
    if (!getUser) {
      return res.status(400).json({ message: "User not found!" });
    }
    res.status(201).json(getUser);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

// ============================================

const getUserById = async (req, res) => {
  if (!req.session.isLoged) {
    return res.status(400).json({ message: "Login first" });
  }
  const { id } = req.params;
  try {
    const getData = await userSchema.findById(id).select("-password -isProfileCreated")
    if (!getData) {
      return res.status(400).json({ message: "No user found!" });
    }
    res.status(201).json(getData);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

export default {
  signupController,
  signinController,
  profilePhoto,
  getAllUser,
  logedUserData,
  getUserById,
};
