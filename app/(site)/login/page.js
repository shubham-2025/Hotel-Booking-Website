import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { getSafeRedirectTarget } from "@/src/backend/auth/get-safe-redirect-target";
import { SignInScreen } from "@/src/frontend/screens/site/sign-in-screen";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = getSafeRedirectTarget(params?.next, "/");
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(next);
  }

  return (
    <SignInScreen
      next={next}
      errorCode={typeof params?.error === "string" ? params.error : ""}
      noticeCode={typeof params?.notice === "string" ? params.notice : ""}
    />
  );
}
