const { PaymentGateway, paymobAPI } = require("../services/PaymentGetaway.js");

const Order = require("../models/orderModel");
const ChatOrder = require("../models/chatOrderModel.js");
const Chat = require("../models/chatModel.js");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel.js");

const Appointment = require("../models/appointmentModel.js");

const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const fs = require("fs");

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
  console.log(JSON.stringify(paymobAns));

  if (paymobAns.obj.success !== true)
    return next(new AppError("Transaction failed", 400));

  const orderId = paymobAns?.obj?.order?.merchant_order_id;
  let order;

  order = await Order.findByIdAndUpdate(
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

  if (order) {
    const appointment = new Appointment({
      user: order.user,
      doctor: order.doctor,
      startTime: order.startTime,
      endTime: order.endTime,
      status: "pending",
    });
    await appointment.save();
    return res.status(200).json({
      status: "success",
    });
  }
  order = await ChatOrder.findByIdAndUpdate(
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
  if (order) {
    const chat = new Chat({
      user: order.user,
      doctor: order.doctor,
      messages: [],
      createdAt: Date.now(),
    });
    await chat.save();

    return res.status(200).json({
      status: "success",
    });
  }

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // return res.status(200).json({
  //   status: "success",
  // });
});
