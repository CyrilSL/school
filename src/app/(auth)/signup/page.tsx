import { SignupForm } from "~/components/auth/signup-form";

// Force dynamic rendering to avoid build issues with auth client
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
