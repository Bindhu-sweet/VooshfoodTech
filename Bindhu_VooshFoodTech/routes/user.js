const express = require("express");
const userController = require("../controller/user");
const validateRegistration = require("../middleware/validation");
const path = require("path");
const {
  authMiddleware,
  authorizationMiddleware,
} = require("../middleware/authenticationMiddleware");

const {
  fileUpload,
  errorHandle,
} = require("../middleware/fileUploadMiddleware");

const passport = require("passport");
const router = express.Router();

router.get(
  "/api/users/viewprofiledetails",
  authMiddleware,
  userController.viewProfileDetails
);
//normal user view public profiles
router.get(
  "/profiles/public",
  authMiddleware,
  userController.viewPublicProfiles
);
//list public profiles to all users
router.get("/api/profiles", userController.viewProfiles);

// Endpoint to retrieve user profiles based on user roles
router.get("/api/roles", authMiddleware, userController.userRoles);
//register
router.post(
  "/api/users/register",
  validateRegistration,
  userController.registerUser
);

//login
router.post("/api/users/login", userController.loginUser);

router.put(
  "/api/users/edituser",
  authMiddleware,
  userController.editUserDetails
);
//admin user to access both public and private profiles
router.post(
  "/api/admin/profile",
  authMiddleware,
  authorizationMiddleware,
  userController.accessBothProfies
);

//users to set their profiles
router.put(
  "/api/users/editprofilevisibility",
  authMiddleware,
  userController.editProfileVisibility
);

router.post(
  "/api/users/uploadimage",
  authMiddleware,
  fileUpload,
  express.static(path.join(__dirname, "images")),
  errorHandle,
  userController.uploadImage
);
router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get("/failed/login", (req, res) => {
  res.send("Login failed");
});

router.get(
  "/fb/auth",
  passport.authenticate("facebook", { failureRedirect: "/user/failed/login" }),
  (req, res) => {
    // Handle successful authentication
    res.status(200).json({
      message: "User logged in successfully",
      user: req.user, 
    });
  }
);
router.post("/api/users/logout", authMiddleware, userController.logOutUser);
module.exports = router;
