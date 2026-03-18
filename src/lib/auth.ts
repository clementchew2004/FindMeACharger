import { betterAuth } from "better-auth";
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { Pool } from "pg";
import { Resend } from 'resend';
import { pool } from "./db";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
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
    requireEmailVerification: true,
    minPasswordLength: 12,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }) => {
      resend.emails.send({
        from: `FindMeACharger <${process.env.EMAIL_FROM!}>`,
        to: user.email,
        subject: "Reset your password",
        headers: {
          'X-Entity-Ref-ID': randomUUID(), // prevent threading/grouping in email clients
        },
        html: `<p>Hi ${user.name},</p><p>Please click the link below to reset your FindMeACharger account password:</p>
                       <a href="${url}">Reset Password</a><p>If you did not request a password reset, you can safely ignore this email.</p>`,
      });
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      resend.emails.send({
        from: `FindMeACharger <${process.env.EMAIL_FROM!}>`,
        to: user.email,
        subject: "Verify your email address",
        headers: {
          'X-Entity-Ref-ID': randomUUID(),
        },
        html: `<p>Hi ${user.name},</p><p>Please click the link below to verify your FindMeACharger account email:</p>
                       <a href="${url}">Verify Email</a>`,
      });
    },
  },
  advanced: {
    database: {
      generateId: "serial",
    },
  },
});