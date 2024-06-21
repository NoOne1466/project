const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: `./config.env` });

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require(`./app.js`);
const Chat = require("./models/chatModel.js");
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(console.log("DB Connection"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.message, err.name);
  console.log("UNHANDLED REJECTION");
  server.close(() => {
    process.exit(1);
  });
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinRoom", ({ chatId }) => {
    socket.join(chatId);
    console.log(`Client joined room: ${chatId}`);
  });

  socket.on("chatMessage", async ({ chatId, sender, message }) => {
    const chat = await Chat.findById(chatId);
    console.log(chat);
    if (chat) {
      chat.messages.push({ sender, message });
      await chat.save();
      io.to(chatId).emit("message", { sender, message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});
