
"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginForm() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <SignIn
        routing="path"
        path="/admin/sign-in"
        fallbackRedirectUrl="/admin"
      />
    </div>
  );
}
