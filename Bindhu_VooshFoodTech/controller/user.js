const bcrypt = require("bcryptjs");
const User = require("../model/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, password, phone, role } = req.body;
    // Check if user with the same email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res
      .status(200)
      .json({ message: "User logged in successfully", token, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.editUserDetails = async (req, res) => {
  try {
    const { name, bio, phone, email, password, role } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.file && user.photo.filename) {
      // Delete the existing image file from local storage
      const imagePath = path.join(
        __dirname,
        "..",
        "images",
        user.photo.filename
      );
      fs.unlinkSync(imagePath);
    }
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (req.file) {
      user.photo.filename = req.file.filename;
      user.photo.contentType = req.file.mimetype || "image/png";
      user.photo.url = undefined;
    }
    if (req.body.imageUrl) {
      user.photo.data = undefined;
      user.photo.contentType = undefined;
      user.photo.url = req.body.imageUrl;
    }
    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.viewPublicProfiles = async (req, res) => {
  try {
    const publicProfiles = await User.find({ isPublic: true });
    res.status(200).json({ message: publicProfiles });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.viewProfiles = async (req, res) => {
  try {
    const publicProfiles = await User.find({ isPublic: true });
    res.status(200).json({ profiles: publicProfiles });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userRoles = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      // For admin, retrieve all profiles
      const profiles = await User.find({});

      return res.json({ profiles: profiles });
    }
    // For normal users, retrieve only public profiles
    const publicProfiles = await User.find({ isPublic: true });

    return res.json({ profiles: publicProfiles });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.viewProfileDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    console.log(user.role, "role");
    if (!user.isPublic && user.role !== "admin") {
      return res.status(404).json({ message: "Need admin access" });
    }
    if (user.role === "admin") {
      return res
        .status(200)
        .json({ user, message: "Profile details fetched successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.editProfileVisibility = async (req, res) => {
  try {
    const { isPublic } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isPublic = isPublic;
    await user.save();
    res.json({ message: "Profile visibility updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    // console.log(req,"this is request")
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let imageUrl;

    if (req.file) {
      imageUrl = req.file.filename;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    if (imageUrl) {
      user.photo.filename = imageUrl;
      user.photo.contentType = req.file.mimetype || "image/png";
      user.photo.url = undefined;
    }

    await user.save();
    res.json({ message: "Photo added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.accessBothProfies = async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createUser = async (req, res) => {
  const { id, displayName, photos, emails } = req.user;
  const email = emails && emails.length > 0 ? emails[0].value : null;
  const photoUrl = photos && photos.length > 0 ? photos[0].value : null;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newUser = new User({
      name: displayName,
      email,
      photo: {
        url: photoUrl,
      },
    });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
  res.status(200).json({
    message: "User logged in successfully",
    user: req.user,
  });
};
exports.logOutUser = async (req, res, next) => {
  try {
    res.clearCookie('jwtToken');
    res.redirect('/');
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
