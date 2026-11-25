import { prisma } from "../config/db.js";
import crypto from "node:crypto";
import { promisify } from "node:util";

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

  // has password using cypto node module;
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
        path: "/"
  })

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


const loginUser = async (req, res) => {
        const {email, password} = req.body;

        // if the email and password is empty
        if(!email || !password){
               return  res.status(400).json({
                message: "Please provide the email and password"
               })
        };

        // check the user already exist or not;
        const userExists = await prisma.user.findUnique({
                where: {email: email}
        });

        if(!userExists){
                res.status(400).json({
                        message: "Please register before login."
                })
        }
}

export { registerUser , loginUser};
