import session from "express-session";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

export const sessionConfig = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
});

declare module "express-session" {
  interface SessionData {
    userId?: string;
    hospitalId?: string;
  }
}
