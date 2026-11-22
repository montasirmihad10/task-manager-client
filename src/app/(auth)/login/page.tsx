"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLoginUserMutation } from "@/redux/api/authApi";
import { handleLoginSuccess } from "@/lib/auth/auth.handlers";

type LoginForm = {
  email: string;
  password: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-md border border-ink/15 bg-mist px-4 py-2.5 text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent/40";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (formData: LoginForm) => {
    try {
      const result = await loginUser(formData).unwrap();
      handleLoginSuccess(result);
      const payload = (result?.data ?? result) as {
        mustChangePassword?: boolean;
        user?: { mustChangePassword?: boolean };
      };
      const mustChange =
        payload.mustChangePassword ||
        payload.user?.mustChangePassword;
      toast.success("Signed in");
      if (mustChange) {
        router.replace("/change-password");
        router.refresh();
        return;
      }
      const redirect = searchParams.get("redirect") || "/dashboard/overview";
      router.replace(redirect);
      router.refresh();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as { message?: string })?.message ||
        "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="w-full border border-ink/10 bg-paper p-5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Log in
      </h1>
      <p className="mt-2 text-sm text-muted">
        Pick up your board where you left off.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
            placeholder="••••••••"
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
          {isLoading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-ink underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <LoginFormInner />
    </Suspense>
  );
}
