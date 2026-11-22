"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useLoginUserMutation,
  useSignUpUserMutation,
} from "@/redux/api/authApi";
import { handleLoginSuccess } from "@/lib/auth/auth.handlers";

type SignupIntent = "manager" | "member";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-md border border-ink/15 bg-mist px-4 py-2.5 text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent/40";

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");
  const [intent, setIntent] = useState<SignupIntent>(
    intentParam === "member" ? "member" : "manager",
  );
  const [signUpUser, { isLoading }] = useSignUpUserMutation();
  const [loginUser] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (formData: RegisterForm) => {
    try {
      const result = await signUpUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        signupIntent: intent,
      }).unwrap();

      if (!result?.success && !result?.data) {
        toast.error(result?.message || "Sign up failed");
        return;
      }

      toast.success(
        intent === "manager"
          ? "Manager account created"
          : "Member account created",
      );

      try {
        const loginResult = await loginUser({
          email: formData.email,
          password: formData.password,
        }).unwrap();
        handleLoginSuccess(loginResult);
        router.replace("/dashboard/overview");
        router.refresh();
        return;
      } catch {
        // fall through
      }

      router.replace("/login");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Sign up failed";
      toast.error(message);
    }
  };

  return (
    <div className="w-full border border-ink/10 bg-paper p-5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Get started
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Choose how you want to use Planboard — lead a team or work solo.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setIntent("manager")}
          className={`rounded-xl border px-3 py-3 text-left transition ${
            intent === "manager"
              ? "border-ink bg-ink text-accent"
              : "border-ink/15 bg-white text-ink hover:border-ink/30"
          }`}
        >
          <p className="text-sm font-semibold">Manager</p>
          <p
            className={`mt-1 text-xs leading-relaxed ${
              intent === "manager" ? "text-white/70" : "text-muted"
            }`}
          >
            Create a team workspace, invite members, and assign work.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setIntent("member")}
          className={`rounded-xl border px-3 py-3 text-left transition ${
            intent === "member"
              ? "border-ink bg-ink text-accent"
              : "border-ink/15 bg-white text-ink hover:border-ink/30"
          }`}
        >
          <p className="text-sm font-semibold">Member</p>
          <p
            className={`mt-1 text-xs leading-relaxed ${
              intent === "member" ? "text-white/70" : "text-muted"
            }`}
          >
            Personal board for your own work — no team under you.
          </p>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name", { required: "Name is required" })}
            className={fieldClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-signal">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className={fieldClass}
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-signal">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={fieldClass}
            placeholder="At least 6 characters"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-signal">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-accent transition hover:bg-ink-soft disabled:opacity-60"
        >
          {isLoading
            ? "Creating..."
            : intent === "manager"
              ? "Create manager account"
              : "Create member account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        Invited by a manager? Use the invite link or login credentials they
        sent you.
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <RegisterPageInner />
    </Suspense>
  );
}
