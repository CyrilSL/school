// Simple console-based email service - no external dependencies
import { env } from "~/env";

// Simple email templates
const templates = {
  verification: (inviteLink: string) => ({
    subject: "Verify your Email address",
    html: `<div>Click here to verify your account: <a href="${inviteLink}">Verify Account</a></div>`
  }),
  resetPassword: (inviteLink: string) => ({
    subject: "Reset Password Link",
    html: `<div>Click here to reset your password: <a href="${inviteLink}">Reset Password</a></div>`
  }),
  changeEmail: (inviteLink: string) => ({
    subject: "Change Email Verification",
    html: `<div>Click here to verify your email: <a href="${inviteLink}">Verify Email</a></div>`
  })
};


export const sendVerificationEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  const template = templates.verification(verificationUrl);
  console.log(`📧 VERIFICATION EMAIL:
To: ${email}
Subject: ${template.subject}
Link: ${verificationUrl}
HTML: ${template.html}`);

  return { data: { id: "mock-verification-id" }, error: null };
};

export const sendResetPasswordEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  const template = templates.resetPassword(verificationUrl);
  console.log(`📧 RESET PASSWORD EMAIL:
To: ${email}
Subject: ${template.subject}
Link: ${verificationUrl}
HTML: ${template.html}`);

  return { data: { id: "mock-reset-id" }, error: null };
};

export const sendChangeEmailVerification = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  const template = templates.changeEmail(verificationUrl);
  console.log(`📧 CHANGE EMAIL VERIFICATION:
To: ${email}
Subject: ${template.subject}
Link: ${verificationUrl}
HTML: ${template.html}`);

  return { data: { id: "mock-change-email-id" }, error: null };
};
