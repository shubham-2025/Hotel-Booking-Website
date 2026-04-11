import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { requireOwner } from "@/src/backend/auth/require-owner";
import { OwnerShell } from "@/src/frontend/components/owner/owner-shell.client";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({ children }) {
  try {
    await requireOwner();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    throw error;
  }

  return <OwnerShell>{children}</OwnerShell>;
}
