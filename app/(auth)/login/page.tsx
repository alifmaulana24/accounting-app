import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Ledger",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="inline-block text-3xl font-bold tracking-tight text-foreground">
            Accounting App
          </span>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Masuk ke akun Anda
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card px-6 py-7 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

