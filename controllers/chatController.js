const Chat = require("../models/chatModel");
const AppError = require("../utils/appError");
const Doctor = require("../models/doctorModel");
const ChatOrder = require("../models/chatOrderModel");
const catchAsync = require("../utils/catchAsync");
const { PaymentGateway, paymobAPI } = require("../services/PaymentGetaway.js");

exports.getChat = async (req, res, next) => {
  if (req.user) {
    userId = req.user.id;
    doctorId = req.body.doctorId;
  } else if (req.doctor) {
    doctorId = req.doctor.id;
    userId = req.body.userId;
  } else {
    return next(new AppError("Provide a user id and doctor id", 400));
  }

  const chat = await Chat.findOne({
    user: userId,
    doctor: doctorId,
  }).populate("user doctor");

  if (!chat) {
    return next(new AppError("There's no chat for the provided IDs", 404));
  }

  res.status(200).json({ status: "success", data: { chat } });
};

exports.createChat = async (req, res, next) => {
  console.log("x");
  const doctor = await Doctor.findById(req.body.doctorId);
  if (!doctor) {
    return next(new AppError("Enter a valid doctor id", 400));
  }
  console.log(doctor);
  const order = new ChatOrder({
    user: req.user._id,
    doctor: doctor._id,
    priceInCents: doctor.priceOfConsultationInCents || 10000,
    isPaid: false,
  });
  await order.save();

  const paymentGateway = new PaymentGateway(
    paymobAPI,
    process.env.API_KEY,
    process.env.INTEGRATION_ID
  );
  await paymentGateway.getToken();

  const paymobOrder = await paymentGateway.createOrder({
    id: order._id,
    priceInCents: order.priceInCents,
    name: doctor.firstName,
    description: "Chat",
  });

  const paymentToken = await paymentGateway.createPaymentGateway({
    uEmail: req.user.email,
    uFirstName: req.user.firstName,
    uLastName: req.user.lastName,
    uPhoneNumber: req.user.phoneNumber,
  });
  order.orderId = paymobOrder.id;

  await User.findByIdAndUpdate(req.user._id, {
    $push: { chatOrders: order._id },
  });
  await Doctor.findByIdAndUpdate(req.body.doctorId, {
    $push: { chatOrders: order._id },
  });

  const paymentURL = process.env.IFRAME_URL.replace("{{TOKEN}}", paymentToken);

  res.status(201).json({
    status: "success",
    data: paymentURL,
  });

  // const newChat = await Chat.create({
  //   user: userId,
  //   doctor: doctorId,
  //   messages: [],
  // });

  res.status(201).json({ status: "success", data: { chat: newChat } });
};

exports.getAllChatForCurLoggedIn = async (req, res, next) => {
  let chat;
  // console.log(req.user.id);
  if (req.user) {
    chat = await Chat.find({
      user: req.user.id,
    }).populate("user doctor");
    console.log(chat);
  } else if (req.doctor) {
    chat = await Chat.find({
      doctor: req.doctor.id,
    }).populate("user doctor");
    console.log(chat);
  }

  // console.log(chat);
  if (!chat) {
    return next(
      new AppError("There are not chats for the current logged in person.", 400)
    );
  }

  res.status(200).json({ status: "success", data: { chat } });
};

exports.webhook = catchAsync(async (req, res, next) => {
  const paymobAns = req.body;
  const hmac = req.query.hmac;

  if (!hmac) return next(new AppError("HMAC is required", 400));
  if (!paymobAns) return next(new AppError("Invalid request", 400));
  if (!PaymentGateway.verifyHmac(paymobAns, hmac, process.env.HMAC_SECRET))
    return next(new AppError("Invalid HMAC", 400));

  if (paymobAns.type !== "TRANSACTION") {
    return res.status(200).json({
      status: "success",
    });
  }
  if (paymobAns.obj.success !== true)
    return next(new AppError("Transaction failed", 400));

  const orderId = paymobAns?.obj?.order?.merchant_order_id;

  const order = await ChatOrder.findByIdAndUpdate(
    orderId,
    {
      isPaid: true,
      transactionId: paymobAns?.obj?.id,
      paidAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const newChat = await Chat.create({
    user: order.user,
    doctor: order.doctor,
    messages: [],
  });

  await newChat.save();

  return res.status(200).json({
    status: "success",
  });
});
