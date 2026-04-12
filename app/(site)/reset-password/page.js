import { ResetPasswordScreen } from "@/src/frontend/screens/site/reset-password-screen";

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;

  return (
    <ResetPasswordScreen
      errorCode={typeof params?.error === "string" ? params.error : ""}
    />
  );
}
