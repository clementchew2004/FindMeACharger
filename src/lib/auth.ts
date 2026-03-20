import { betterAuth } from "better-auth";
import dotenv from 'dotenv';
import { pool } from "./db";

dotenv.config();

const authApiOrigin = process.env.AUTH_API_ORIGIN || 'http://localhost:8000';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';


export const auth = betterAuth({
  baseURL: authApiOrigin,
  trustedOrigins: [clientOrigin, authApiOrigin],
  database: pool,
  user: {
    additionalFields: {
      publicName: {
        type: "string",
        required: false,
        fieldName: "public_name"
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 12,
    autoSignIn: true,
  },
  advanced: {
    database: {
      generateId: "serial",
    },
  },
});