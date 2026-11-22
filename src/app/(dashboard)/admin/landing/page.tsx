import { redirect } from "next/navigation";

/** Old path — keep so bookmarks still work */
export default function AdminLandingRedirect() {
  redirect("/dashboard/admin/landing");
}
