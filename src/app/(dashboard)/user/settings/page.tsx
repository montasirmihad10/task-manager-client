import { redirect } from "next/navigation";

export default function UserSettingsRedirect() {
  redirect("/dashboard/account");
}
