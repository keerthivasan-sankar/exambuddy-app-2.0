var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_cors = __toESM(require("cors"), 1);
var import_mongoose6 = __toESM(require("mongoose"), 1);

// server/routes/api.ts
var import_express = __toESM(require("express"), 1);

// server/controllers/authController.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcrypt = __toESM(require("bcrypt"), 1);

// server/models/User.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var UserSchema = new import_mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    isPasswordHashed: { type: Boolean, default: false },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    homeCity: { type: String, required: true },
    avatar: { type: String },
    verified: { type: Boolean, default: false },
    preferredTransport: { type: String, default: "Any" },
    preferredLanguage: { type: String, default: "English" }
  },
  { timestamps: true }
);
var User_default = import_mongoose.default.model("User", UserSchema);

// server/middleware/loginRateLimiter.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_node_cache = __toESM(require("node-cache"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  // Lock after 5 failed attempts
  LOCKOUT_DURATION_HOURS: 5,
  // Lock for 5 hours (auto-unlock)
  LOCKOUT_DURATION_SECONDS: 5 * 60 * 60,
  // 18,000 seconds
  RATE_LIMIT_WINDOW: 60,
  // 1 minute
  RATE_LIMIT_MAX: 10,
  // Max 10 requests per minute
  PROGRESSIVE_DELAY_BASE: 1e3,
  // 1 second base delay
  CLEANUP_INTERVAL: 3600
  // 1 hour
};
var failedLoginCache = new import_node_cache.default({
  stdTTL: CONFIG.LOCKOUT_DURATION_SECONDS,
  checkperiod: 300,
  // Check every 5 minutes
  useClones: false
});
var lockoutCache = new import_node_cache.default({
  stdTTL: CONFIG.LOCKOUT_DURATION_SECONDS,
  checkperiod: 300,
  useClones: false
});
var ipRateCache = new import_node_cache.default({
  stdTTL: CONFIG.RATE_LIMIT_WINDOW,
  checkperiod: 60,
  useClones: false
});
var loginRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: CONFIG.RATE_LIMIT_WINDOW * 1e3,
  max: CONFIG.RATE_LIMIT_MAX,
  message: {
    error: "Too many login attempts. Please try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many login attempts. Please try again later.",
      retryAfter: CONFIG.RATE_LIMIT_WINDOW
    });
  }
});
var trackFailedAttempt = async (identifier) => {
  if (!identifier) return;
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const hashedKey = import_crypto.default.createHash("sha256").update(normalizedIdentifier).digest("hex");
  const cacheKey = `failed_login_${hashedKey}`;
  const lockoutKey = `locked_${hashedKey}`;
  try {
    const now = Date.now();
    const existing = failedLoginCache.get(cacheKey);
    let data;
    if (existing) {
      if (existing.lockoutUntil && existing.lockoutUntil > now) {
        data = {
          ...existing,
          lastAttempt: now
        };
        failedLoginCache.set(cacheKey, data, CONFIG.LOCKOUT_DURATION_SECONDS);
        return;
      }
      if (existing.lockoutUntil && existing.lockoutUntil <= now) {
        failedLoginCache.del(cacheKey);
        lockoutCache.del(lockoutKey);
        data = {
          count: 1,
          firstAttempt: now,
          lastAttempt: now,
          lockoutUntil: null,
          email: existing.email || identifier
        };
      } else {
        data = {
          ...existing,
          count: existing.count + 1,
          lastAttempt: now
        };
        if (data.count >= CONFIG.MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = now + CONFIG.LOCKOUT_DURATION_SECONDS * 1e3;
          data.lockoutUntil = lockoutUntil;
          lockoutCache.set(lockoutKey, {
            locked: true,
            lockoutUntil,
            reason: "Multiple failed login attempts"
          }, CONFIG.LOCKOUT_DURATION_SECONDS);
          console.log(`[Security] Account locked for 5 hours: ${identifier}`);
          console.log(`[Security] Auto-unlock at: ${new Date(lockoutUntil).toISOString()}`);
        }
      }
    } else {
      data = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        lockoutUntil: null,
        email: identifier
      };
    }
    const ttl = CONFIG.LOCKOUT_DURATION_SECONDS + 3600;
    failedLoginCache.set(cacheKey, data, ttl);
  } catch (error) {
    console.error("[RateLimiter] Track attempt error:", error);
  }
};
var isAccountLocked = (identifier) => {
  if (!identifier) {
    return { locked: false, lockoutUntil: null, remainingSeconds: 0 };
  }
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const hashedKey = import_crypto.default.createHash("sha256").update(normalizedIdentifier).digest("hex");
  const lockoutKey = `locked_${hashedKey}`;
  const cacheKey = `failed_login_${hashedKey}`;
  const lockoutData = lockoutCache.get(lockoutKey);
  if (lockoutData) {
    const now = Date.now();
    if (lockoutData.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutData.lockoutUntil - now) / 1e3);
      return {
        locked: true,
        lockoutUntil: lockoutData.lockoutUntil,
        remainingSeconds
      };
    } else {
      lockoutCache.del(lockoutKey);
      failedLoginCache.del(cacheKey);
      return { locked: false, lockoutUntil: null, remainingSeconds: 0 };
    }
  }
  const data = failedLoginCache.get(cacheKey);
  if (data && data.lockoutUntil) {
    const now = Date.now();
    if (data.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((data.lockoutUntil - now) / 1e3);
      return {
        locked: true,
        lockoutUntil: data.lockoutUntil,
        remainingSeconds
      };
    } else {
      failedLoginCache.del(cacheKey);
      lockoutCache.del(lockoutKey);
    }
  }
  return { locked: false, lockoutUntil: null, remainingSeconds: 0 };
};
var resetFailedAttempts = (identifier) => {
  if (!identifier) return;
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const hashedKey = import_crypto.default.createHash("sha256").update(normalizedIdentifier).digest("hex");
  const cacheKey = `failed_login_${hashedKey}`;
  const lockoutKey = `locked_${hashedKey}`;
  failedLoginCache.del(cacheKey);
  lockoutCache.del(lockoutKey);
  console.log(`[Security] Manual unlock for: ${identifier}`);
};
var accountLockout = async (req, res, next) => {
  const { mobile, email } = req.body;
  const identifier = mobile || email;
  if (!identifier) {
    return next();
  }
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const lockStatus = isAccountLocked(normalizedIdentifier);
  if (lockStatus.locked) {
    const hours = Math.floor(lockStatus.remainingSeconds / 3600);
    const minutes = Math.floor(lockStatus.remainingSeconds % 3600 / 60);
    let timeMessage = "";
    if (hours > 0) {
      timeMessage = `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else {
      timeMessage = `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    return res.status(429).json({
      error: `Account temporarily locked due to multiple failed attempts. Auto-unlock in ${timeMessage}.`,
      lockedUntil: new Date(lockStatus.lockoutUntil).toISOString(),
      remainingSeconds: lockStatus.remainingSeconds,
      autoUnlockAt: new Date(lockStatus.lockoutUntil).toISOString()
    });
  }
  const hashedKey = import_crypto.default.createHash("sha256").update(normalizedIdentifier).digest("hex");
  const cacheKey = `failed_login_${hashedKey}`;
  const data = failedLoginCache.get(cacheKey);
  if (data && data.count > 0 && data.count < CONFIG.MAX_FAILED_ATTEMPTS) {
    const baseDelay = Math.pow(2, data.count - 1) * CONFIG.PROGRESSIVE_DELAY_BASE;
    const delay = Math.min(baseDelay, 1e4);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  next();
};
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    const keys = lockoutCache.keys();
    const now = Date.now();
    for (const key of keys) {
      const data = lockoutCache.get(key);
      if (data && data.lockoutUntil && data.lockoutUntil <= now) {
        lockoutCache.del(key);
        const cacheKey = key.replace("locked_", "failed_login_");
        failedLoginCache.del(cacheKey);
        console.log(`[Security] Auto-unlocked account: ${key}`);
      }
    }
  }, 6e4);
}

// server/controllers/authController.ts
var generateToken = (id) => {
  return import_jsonwebtoken.default.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d"
  });
};
var registerUser = async (req, res) => {
  try {
    const { mobile, name, gender, homeCity, email, password } = req.body;
    let user = await User_default.findOne({ mobile });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    let hashedPassword = void 0;
    if (password) {
      const salt = await import_bcrypt.default.genSalt(12);
      hashedPassword = await import_bcrypt.default.hash(password, salt);
    }
    user = await User_default.create({
      mobile,
      email,
      password: hashedPassword,
      isPasswordHashed: !!password,
      name,
      gender,
      homeCity,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({
      user: userResponse,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile and password are required" });
    }
    const user = await User_default.findOne({ mobile });
    const handleFailedAttempt = async (identifier) => {
      await trackFailedAttempt(identifier);
    };
    if (!user) {
      await handleFailedAttempt(mobile);
      return res.status(401).json({ error: "Invalid credentials or account locked. Please check your email for recovery options." });
    }
    if (!user.password) {
      await handleFailedAttempt(user.email || mobile);
      return res.status(401).json({ error: "Invalid credentials or account locked. Please check your email for recovery options." });
    }
    let isMatch = false;
    if (!user.isPasswordHashed) {
      isMatch = user.password === password;
      if (isMatch) {
        const salt = await import_bcrypt.default.genSalt(12);
        user.password = await import_bcrypt.default.hash(password, salt);
        user.isPasswordHashed = true;
        await user.save();
      }
    } else {
      isMatch = await import_bcrypt.default.compare(password, user.password);
    }
    if (!isMatch) {
      await handleFailedAttempt(user.email || mobile);
      return res.status(401).json({ error: "Invalid credentials or account locked. Please check your email for recovery options." });
    }
    resetFailedAttempts(user.email || mobile);
    resetFailedAttempts(mobile);
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({
      user: userResponse,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User_default.findById(req.user.id);
    if (!user || !user.password) {
      return res.status(400).json({ error: "User not found or password not set" });
    }
    const isMatch = await import_bcrypt.default.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid old password" });
    }
    const salt = await import_bcrypt.default.genSalt(12);
    user.password = await import_bcrypt.default.hash(newPassword, salt);
    user.isPasswordHashed = true;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var getUserProfile = async (req, res) => {
  try {
    const user = await User_default.findById(req.user.id);
    if (user) {
      const userResponse = user.toObject();
      delete userResponse.password;
      res.json({ data: userResponse });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// server/models/Exam.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var ExamSchema = new import_mongoose2.Schema(
  {
    userId: { type: import_mongoose2.Schema.Types.ObjectId, ref: "User", required: true },
    examName: { type: String, required: true },
    examDate: { type: String, required: true },
    examCity: { type: String, required: true },
    examCenter: { type: String, required: true }
  },
  { timestamps: true }
);
var Exam_default = import_mongoose2.default.model("Exam", ExamSchema);

// server/controllers/examController.ts
var getExams = async (req, res) => {
  try {
    const exams = await Exam_default.find({ userId: req.user?.id }).sort({ examDate: 1 });
    res.json({ data: exams });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var createExam = async (req, res) => {
  try {
    const exam = await Exam_default.create({
      ...req.body,
      userId: req.user?.id
    });
    res.status(201).json({ data: exam });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var deleteExam = async (req, res) => {
  try {
    const exam = await Exam_default.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });
    if (exam) {
      res.json({ data: { success: true } });
    } else {
      res.status(404).json({ error: "Exam not found or unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// server/controllers/matchController.ts
var getMatches = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userExams = await Exam_default.find({ userId });
    const allMatches = [];
    const seenKeys = /* @__PURE__ */ new Set();
    for (const exam of userExams) {
      const matchingExams = await Exam_default.find({
        userId: { $ne: userId },
        examName: exam.examName,
        examDate: exam.examDate,
        examCity: exam.examCity
      }).populate("userId");
      for (const matchExam of matchingExams) {
        const buddy = matchExam.userId;
        if (buddy) {
          const buddyId = buddy._id.toString();
          const key = `${buddyId}_${exam._id}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allMatches.push({ buddy, exam });
          }
        }
      }
    }
    res.json({ data: allMatches });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// server/models/Message.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var MessageSchema = new import_mongoose3.Schema(
  {
    userId: { type: import_mongoose3.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "location"],
      default: "text"
    },
    chatType: {
      type: String,
      enum: ["global", "group", "private"],
      required: true
    },
    chatId: { type: String, required: true },
    fileUrl: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }
);
var Message_default = import_mongoose3.default.model("Message", MessageSchema);

// server/controllers/messageController.ts
var getMessages = async (req, res) => {
  try {
    const { chatType, chatId } = req.params;
    const since = req.query.since ? parseInt(req.query.since) : 0;
    const query = {
      chatType,
      timestamp: { $gt: new Date(since) }
    };
    if (chatType === "private") {
      const reversedChatId = chatId.split("_").reverse().join("_");
      query.chatId = { $in: [chatId, reversedChatId] };
    } else {
      query.chatId = chatId;
    }
    const messages = await Message_default.find(query).sort({ timestamp: 1 }).limit(100);
    res.json({ data: messages });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var sendMessage = async (req, res) => {
  try {
    const user = await User_default.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { message, messageType, chatType, chatId, fileUrl, latitude, longitude } = req.body;
    const newMessage = await Message_default.create({
      userId: user._id,
      userName: user.name,
      message,
      messageType: messageType || "text",
      chatType,
      chatId,
      fileUrl,
      latitude,
      longitude
    });
    res.status(201).json({ data: newMessage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// server/models/Block.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var BlockSchema = new import_mongoose4.Schema(
  {
    blockerId: { type: import_mongoose4.Schema.Types.ObjectId, ref: "User", required: true },
    blockedId: { type: import_mongoose4.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
var Block_default = import_mongoose4.default.model("Block", BlockSchema);

// server/controllers/blockController.ts
var blockUser = async (req, res) => {
  try {
    const blockerId = req.user?.id;
    const { blockedId } = req.body;
    const block = await Block_default.create({
      blockerId,
      blockedId
    });
    res.status(201).json({ data: block });
  } catch (error) {
    if (error.code === 11e3) {
      return res.status(400).json({ error: "User already blocked" });
    }
    res.status(400).json({ error: error.message });
  }
};
var unblockUser = async (req, res) => {
  try {
    const blockerId = req.user?.id;
    const blockedId = req.params.id;
    const result = await Block_default.findOneAndDelete({
      blockerId,
      blockedId
    });
    if (result) {
      res.json({ data: { success: true } });
    } else {
      res.status(404).json({ error: "Block not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var checkBlockStatus = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.id;
    const isBlockedByMe = await Block_default.exists({ blockerId: currentUserId, blockedId: targetUserId });
    const isBlockedByThem = await Block_default.exists({ blockerId: targetUserId, blockedId: currentUserId });
    res.json({
      data: {
        isBlockedByMe: !!isBlockedByMe,
        isBlockedByThem: !!isBlockedByThem
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// server/models/Group.ts
var import_mongoose5 = __toESM(require("mongoose"), 1);
var GroupSchema = new import_mongoose5.Schema(
  {
    name: { type: String, required: true },
    examName: { type: String, required: true },
    examDate: { type: String, required: true },
    examCity: { type: String, required: true },
    members: [{ type: import_mongoose5.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: import_mongoose5.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);
var Group_default = import_mongoose5.default.model("Group", GroupSchema);

// server/controllers/groupController.ts
var createGroup = async (req, res) => {
  try {
    const { name, examName, examDate, examCity } = req.body;
    const userId = req.user?.id;
    const hasExam = await Exam_default.exists({
      userId,
      examName,
      examDate,
      examCity
    });
    if (!hasExam) {
      return res.status(403).json({ error: "You must have this exam to create a group for it" });
    }
    const group = await Group_default.create({
      name,
      examName,
      examDate,
      examCity,
      members: [userId],
      createdBy: userId
    });
    res.status(201).json({ data: group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user?.id;
    const group = await Group_default.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const hasExam = await Exam_default.exists({
      userId,
      examName: group.examName,
      examDate: group.examDate,
      examCity: group.examCity
    });
    if (!hasExam) {
      return res.status(403).json({ error: "You must have a matching exam to join this group" });
    }
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: "You are already a member of this group" });
    }
    group.members.push(userId);
    await group.save();
    res.json({ data: group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
var getGroups = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userExams = await Exam_default.find({ userId });
    const groups = [];
    const seenGroupIds = /* @__PURE__ */ new Set();
    for (const exam of userExams) {
      const matchingGroups = await Group_default.find({
        examName: exam.examName,
        examDate: exam.examDate,
        examCity: exam.examCity
      }).populate("members", "name avatar");
      for (const group of matchingGroups) {
        if (!seenGroupIds.has(group._id.toString())) {
          seenGroupIds.add(group._id.toString());
          groups.push(group);
        }
      }
    }
    res.json({ data: groups });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// server/middleware/authMiddleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = import_jsonwebtoken2.default.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ error: "Not authorized, no token" });
  }
};

// server/middleware/validate.ts
var validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      return res.status(400).json({ error: error.errors });
    }
  };
};

// server/validations/index.ts
var import_zod = require("zod");
var registerSchema = import_zod.z.object({
  body: import_zod.z.object({
    mobile: import_zod.z.string().min(10, "Mobile number must be at least 10 digits"),
    name: import_zod.z.string().min(2, "Name must be at least 2 characters"),
    gender: import_zod.z.string(),
    homeCity: import_zod.z.string().min(2, "Home city must be at least 2 characters"),
    email: import_zod.z.string().email().optional(),
    password: import_zod.z.string().min(6).optional()
  })
});
var createExamSchema = import_zod.z.object({
  body: import_zod.z.object({
    examName: import_zod.z.string().min(2, "Exam name must be at least 2 characters"),
    examDate: import_zod.z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    examCity: import_zod.z.string().min(2, "Exam city must be at least 2 characters"),
    examCenter: import_zod.z.string().min(2, "Exam center must be at least 2 characters")
  })
});
var sendMessageSchema = import_zod.z.object({
  body: import_zod.z.object({
    message: import_zod.z.string().min(1, "Message cannot be empty"),
    messageType: import_zod.z.enum(["text", "image", "video", "file", "location"]).optional(),
    chatType: import_zod.z.enum(["global", "group", "private"]),
    chatId: import_zod.z.string(),
    fileUrl: import_zod.z.string().optional(),
    latitude: import_zod.z.number().optional(),
    longitude: import_zod.z.number().optional()
  })
});
var blockUserSchema = import_zod.z.object({
  body: import_zod.z.object({
    blockedId: import_zod.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
  })
});
var createGroupSchema = import_zod.z.object({
  body: import_zod.z.object({
    name: import_zod.z.string().min(3, "Group name must be at least 3 characters"),
    examName: import_zod.z.string(),
    examDate: import_zod.z.string(),
    examCity: import_zod.z.string()
  })
});

// server/routes/api.ts
var router = import_express.default.Router();
router.post("/auth/register", validate(registerSchema), registerUser);
router.post("/auth/login", loginRateLimiter, accountLockout, loginUser);
router.post("/auth/change-password", protect, changePassword);
router.get("/auth/profile", protect, getUserProfile);
router.route("/exams").get(protect, getExams).post(protect, validate(createExamSchema), createExam);
router.delete("/exams/:id", protect, deleteExam);
router.get("/matches", protect, getMatches);
router.route("/messages").post(protect, validate(sendMessageSchema), sendMessage);
router.get("/messages/:chatType/:chatId", protect, getMessages);
router.route("/blocks").post(protect, validate(blockUserSchema), blockUser);
router.route("/blocks/:id").delete(protect, unblockUser);
router.get("/blocks/:id/check", protect, checkBlockStatus);
router.route("/groups").get(protect, getGroups).post(protect, validate(createGroupSchema), createGroup);
router.post("/groups/:id/join", protect, joinGroup);
var api_default = router;

// server.ts
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express2.default.json());
  if (process.env.MONGODB_URI) {
    try {
      await import_mongoose6.default.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  } else {
    console.log("No MONGODB_URI provided. Database will not be connected.");
  }
  app.use("/api", api_default);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
