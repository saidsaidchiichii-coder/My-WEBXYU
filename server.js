import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "SECRET_KEY";

// =========================
// 🔗 CONNECT DB
// =========================
mongoose.connect("mongodb://127.0.0.1:27017/aiapp");

// =========================
// 👤 USER MODEL
// =========================
const User = mongoose.model("User", {
  email: String,
  password: String
});

// =========================
// 🔐 AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// =========================
// 📝 REGISTER
// =========================
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, password: hash });

  res.json({ message: "ok" });
});

// =========================
// 🔑 LOGIN
// =========================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ error: "no user" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ error: "wrong" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});

// =========================
// 🤖 AI (PROTECTED)
// =========================
app.post("/api/chat", auth, async (req, res) => {
  const { message } = req.body;

  // هنا دير API ديالك (Groq مثلا)
  // مثال dummy:
  res.json({
    reply: "AI Response: " + message
  });
});

// =========================
// 🚀 START
// =========================
app.listen(3000, () => console.log("Server running on 3000"));
