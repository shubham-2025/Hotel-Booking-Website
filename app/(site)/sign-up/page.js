import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { getSafeRedirectTarget } from "@/src/backend/auth/get-safe-redirect-target";
import { SignUpScreen } from "@/src/frontend/screens/site/sign-up-screen";

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const next = getSafeRedirectTarget(params?.next, "/");
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(next);
  }

  return (
    <SignUpScreen
      next={next}
      errorCode={typeof params?.error === "string" ? params.error : ""}
    />
  );
}
