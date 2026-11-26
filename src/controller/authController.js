import { prisma } from "../config/db.js";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { passwordVarification } from "../utils/passworVerify.js";
import path from "node:path";

const scrypt = promisify(crypto.scrypt);

// session cookie name
const SESSION_COOKIE_NAME = "sid";
const SESSION_EXPIRY_TIME = 1000 * 60 * 60 * 24;

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // validate the request body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "please provide username, email and password" });
  }

  // check if the user already exists;
  const userExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (userExists) {
    return res
      .status(400)
      .json({ error: "user with this email already exists" });
  }

  // hash password using cypto node module;
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedkey = await scrypt(password, salt, 64);
  const passwordHash = `${salt}:${derivedkey.toString("hex")}`;

  // generate session token and hash the session token with expiry time
  const session_token = crypto.randomBytes(32).toString("hex");
  const session_token_hash = crypto
    .createHash("sha256")
    .update(session_token)
    .digest("hex");
  const session_time = new Date(Date.now() + SESSION_EXPIRY_TIME);

  // create a new user;
  const newUser = await prisma.user.create({
    data: {
      name: username,
      email: email,
      password: passwordHash,

      sessions: {
        create: {
          tokenHash: session_token_hash,
          expiresAt: session_time,
        },
      },
    },
  });

  // setting the session id into cookies
  res.cookie(SESSION_COOKIE_NAME, session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_EXPIRY_TIME,
    path: "/",
  });

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: newUser.id,
        username: newUser.name,
        email: newUser.email,
      },
    },
  });
};

// user login controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // if the email and password is empty
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide the email and password",
    });
  }

  // check the user already exist or not;
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!userExists) {
    res.status(401).json({
      message: "Invalid Email and Password",
    });
  }

  // compare password is same or not
  const passwordMatches = await passwordVarification(
    password,
    userExists?.password ?? DUMMY_PASSWORD_HASH,
  );

  console.log("user found:", Boolean(userExists));
  console.log("password matches:", passwordMatches);

  // if user requested with wrong credentials, sent this message
  if (!userExists || !passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // grab the old sessiontoken
  const oldSessionToken = req.cookies?.[SESSION_COOKIE_NAME];

  if (oldSessionToken) {
    const oldSessionTokenHash = crypto
      .createHash("sha256")
      .update(oldSessionToken)
      .digest("hex");

    await prisma.session.deleteMany({
      where: {
        tokenHash: oldSessionTokenHash,
      },
    });
  }

  // creating a new session and hashing it with setting expiry time
  const sessionToken = crypto.randomBytes(32).toString("base64url");
  const sessionTokenHash = crypto
    .createHash("sha256")
    .update(sessionToken)
    .digest("hex");
  const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRY_TIME);

  await prisma.session.create({
    data: {
      userId: userExists.id,
      tokenHash: sessionTokenHash,
      expiresAt: sessionExpiresAt,
    },
  });

  res.cookie(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_EXPIRY_TIME,
    path: "/",
  });

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: userExists.id,
        username: userExists.name,
        email: userExists.email,
      },
    },
  });
};

const logoutUser = async (req, res) => {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];

  if (sessionToken) {
    const sessionTokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");
    await prisma.session.deleteMany({
      where: {
        tokenHash: sessionTokenHash,
      },
    });
  }

  // clear the session token what has set in the browser cookies
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({
    status: "success",
    message: "User logged Out Successfully",
  });
};

export { registerUser, loginUser, logoutUser };
