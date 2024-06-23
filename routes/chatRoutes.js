const express = require("express");
const chatController = require("../controllers/chatController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").post(authController.protect, chatController.createChat);
// .get(authController.protect, chatController.getAll);

router.route("/getChat").get(authController.protect, chatController.getChat);

router
  .route("/getChatforcurrentperson")
  .get(authController.protect, chatController.getAllChatForCurLoggedIn);

module.exports = router;
