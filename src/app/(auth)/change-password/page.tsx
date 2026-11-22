"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/redux/api/authApi";
import { handleLoginSuccess } from "@/lib/auth/auth.handlers";
import { apiErrorMessage } from "@/lib/apiError";

type Form = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-md border border-ink/15 bg-mist px-4 py-2.5 text-ink outline-none transition focus:border-ink/40 focus:ring-2 focus:ring-accent/40";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>();

  const onSubmit = async (data: Form) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    const res = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if ("error" in res && res.error) {
      toast.error(apiErrorMessage(res, "Could not update password"));
      return;
    }
    // Response may include rotated tokens
    try {
      handleLoginSuccess(res.data);
    } catch {
      // keep existing session if tokens not returned
    }
    toast.success("Password updated");
    router.replace("/dashboard/overview");
    router.refresh();
  };

  return (
    <div className="w-full border border-ink/10 bg-paper p-5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Security
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-muted">
        Your manager sent a temporary password. Choose a new one to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink">
            Temporary / current password
          </label>
          <input
            type="password"
            {...register("currentPassword", { required: "Required" })}
            className={fieldClass}
          />
          {errors.currentPassword ? (
            <p className="mt-1 text-sm text-signal">
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-ink">New password</label>
          <input
            type="password"
            {...register("newPassword", {
              required: "Required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            className={fieldClass}
          />
          {errors.newPassword ? (
            <p className="mt-1 text-sm text-signal">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-medium text-ink">
            Confirm new password
          </label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Required",
              validate: (v) =>
                v === watch("newPassword") || "Passwords do not match",
            })}
            className={fieldClass}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-signal">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-accent disabled:opacity-60"
        >
          {isLoading ? "Saving…" : "Save password"}
        </button>
      </form>
    </div>
  );
}
