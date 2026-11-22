"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, KeyRound, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  useChangePasswordMutation,
  useEditMyProfileMutation,
  useGetMyProfileQuery,
} from "@/redux/api/authApi";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import { handleLoginSuccess } from "@/lib/auth/auth.handlers";

type ProfileUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  signupIntent?: string;
  profileImage?: string | { url?: string };
};

function avatarUrl(user?: ProfileUser | null): string | null {
  if (!user?.profileImage) return null;
  if (typeof user.profileImage === "string") return user.profileImage;
  return user.profileImage.url || null;
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-ink/15 bg-mist px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ink/35 focus:ring-2 focus:ring-accent/35";

export default function AccountPage() {
  const { data: profileResult, isLoading } = useGetMyProfileQuery(undefined);
  const user = profileResult?.data as ProfileUser | undefined;
  const [editProfile, { isLoading: savingProfile }] =
    useEditMyProfileMutation();
  const [changePassword, { isLoading: savingPassword }] =
    useChangePasswordMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setPhone(user.phone || "");
  }, [user]);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const shownAvatar = useMemo(
    () => preview || avatarUrl(user),
    [preview, user],
  );

  const initials = useMemo(() => {
    const base = (name || user?.email || "?").trim();
    return base.slice(0, 1).toUpperCase();
  }, [name, user?.email]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await editProfile({
      name: name.trim(),
      phone: phone.trim(),
      image: imageFile,
    });
    if (!isApiSuccess(res)) {
      toast.error(apiErrorMessage(res, "Could not update profile"));
      return;
    }
    setImageFile(null);
    toast.success("Profile updated");
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    const res = await changePassword({
      currentPassword,
      newPassword,
    });
    if ("error" in res && res.error) {
      toast.error(apiErrorMessage(res, "Could not update password"));
      return;
    }
    try {
      handleLoginSuccess(res.data);
    } catch {
      // keep session if tokens weren't returned
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
  };

  if (isLoading && !user) {
    return (
      <div className="dash-enter p-4 md:p-6">
        <p className="text-sm text-muted">Loading account…</p>
      </div>
    );
  }

  return (
    <div className="dash-enter mx-auto w-full max-w-3xl space-y-6 p-4 pb-10 md:p-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Your account
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Profile & security
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">
          Update how you appear to teammates and change your password anytime.
        </p>
      </header>

      <section className="rounded-2xl border border-ink/10 bg-paper p-5 sm:p-6">
        <div className="flex items-center gap-2 text-ink">
          <UserRound size={18} className="text-muted" />
          <h2 className="font-display text-lg font-semibold">Profile</h2>
        </div>

        <form onSubmit={onSaveProfile} className="mt-5 space-y-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-mist"
              aria-label="Change profile photo"
            >
              {shownAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-ink">
                  {initials}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/55 opacity-0 transition group-hover:opacity-100">
                <Camera size={18} className="text-paper" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.name || "Your name"}
              </p>
              <p className="truncate text-sm text-muted">{user?.email}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs font-semibold text-ink underline-offset-2 hover:underline"
              >
                {imageFile ? "Photo selected — save to upload" : "Change photo"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                placeholder="Optional"
                autoComplete="tel"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                value={user?.email || ""}
                disabled
                className={`${fieldClass} cursor-not-allowed opacity-70`}
              />
              <p className="mt-1 text-xs text-muted">
                Email can’t be changed here.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      <section
        id="password"
        className="scroll-mt-6 rounded-2xl border border-ink/10 bg-paper p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-ink">
          <KeyRound size={18} className="text-muted" />
          <h2 className="font-display text-lg font-semibold">Password</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Use a strong password you don’t reuse elsewhere.
        </p>

        <form onSubmit={onChangePassword} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={fieldClass}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={fieldClass}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={fieldClass}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
            >
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
