import { ForgotPasswordScreen } from "@/src/frontend/screens/site/forgot-password-screen";

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ForgotPasswordScreen
      errorCode={typeof params?.error === "string" ? params.error : ""}
      noticeCode={typeof params?.notice === "string" ? params.notice : ""}
    />
  );
}
