import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin, organization } from "better-auth/plugins";
import { env } from "~/env";
import {
  sendChangeEmailVerification,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "~/server/auth/email";
import { db } from "~/server/db";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    openAPI(), // /api/auth/reference
    admin({
      impersonationSessionDuration: 60 * 60 * 24 * 7, // 7 days
    }),
    organization({
      allowUserToCreateOrganization: false, // Only admin can create institutions
      organizationLimit: 1, // Users can belong to only one institution
      roles: ["admin", "parent"], // Institution admin and parent roles
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  user: {
    additionalFields: {
      isPremium: {
        type: "boolean",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }, _request) => {
        const { error } = await sendChangeEmailVerification({
          email: newEmail,
          verificationUrl: url,
        });

        if (error)
          return console.log("sendChangeEmailVerification Error: ", error);
      },
    },
  },
  rateLimit: {
    window: 60, // time window in seconds
    max: 5, // max requests in the window
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      const { error } = await sendResetPasswordEmail({
        email: user.email,
        verificationUrl: url,
      });

      if (error) return console.log("sendResetPasswordEmail Error: ", error);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 1, // 1 HOUR
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      const { error } = await sendVerificationEmail({
        email: user.email,
        verificationUrl: verificationUrl,
      });

      if (error) return console.log("sendVerificationEmail Error: ", error);
    },
  },
} satisfies BetterAuthOptions);

// Server session utility - use auth.api.getSession directly in your API routes/server components
export const getSession = auth.api.getSession;

// For App Router server components - this should be called in server components with headers
export async function getServerSession() {
  try {
    // Try to import headers dynamically for server components
    const { headers } = await import("next/headers");
    const headersList = await headers();
    
    return await auth.api.getSession({
      headers: headersList,
    });
  } catch (error) {
    // If headers are not available or session fails, return null session
    console.error("Failed to get server session:", error);
    return { session: null, user: null };
  }
}

export type Session = typeof auth.$Infer.Session;
export type AuthUserType = Session["user"];
