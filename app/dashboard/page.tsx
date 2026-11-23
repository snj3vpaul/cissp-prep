import { redirect } from "next/navigation";

/** The dashboard now lives at "/". Keep old bookmarks working. */
export default function DashboardRedirect() {
  redirect("/");
}
