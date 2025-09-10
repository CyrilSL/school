import { Resend } from "resend";
import { env } from "~/env";

// Simple email templates to replace React Email components
const ChangeEmailVerificationTemplate = ({ inviteLink }: { inviteLink: string }) => 
  `<div>Click here to verify your email: <a href="${inviteLink}">Verify Email</a></div>`;

const ResetPasswordEmailTemplate = ({ inviteLink }: { inviteLink: string }) => 
  `<div>Click here to reset your password: <a href="${inviteLink}">Reset Password</a></div>`;

const VerificationEmailTemplate = ({ inviteLink }: { inviteLink: string }) => 
  `<div>Click here to verify your account: <a href="${inviteLink}">Verify Account</a></div>`;

export const resend = new Resend(env.RESERND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Verify your Email address",
    html: VerificationEmailTemplate({ inviteLink: verificationUrl }),
  });
};

export const sendResetPasswordEmail = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Reset Password Link",
    html: ResetPasswordEmailTemplate({ inviteLink: verificationUrl }),
  });
};

export const sendChangeEmailVerification = async ({
  email,
  verificationUrl,
}: {
  email: string;
  verificationUrl: string;
}) => {
  return await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [email],
    subject: "Change Email Verification",
    html: ChangeEmailVerificationTemplate({ inviteLink: verificationUrl }),
  });
};
