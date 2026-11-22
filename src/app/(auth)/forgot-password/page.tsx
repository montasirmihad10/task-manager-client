import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md border border-ink/10 bg-paper p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Account
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
        Reset coming soon
      </h1>
      <p className="mt-3 text-sm text-muted">
        Password reset will plug into the auth OTP flow next.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-accent hover:bg-ink-soft"
      >
        Back to login
      </Link>
    </div>
  );
}
