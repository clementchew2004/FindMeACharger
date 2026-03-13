import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);




export const auth = betterAuth({
  database: new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxUses: 7500,
    allowExitOnIdle: false,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Verify your email address",
        
        // TODO use a react component here e.g. @react-email/components
        html: `<p>Click the link below to verify your email:</p>
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