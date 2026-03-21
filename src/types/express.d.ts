import type { Session, User } from "better-auth";

// adds user and session properties to express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

export { };