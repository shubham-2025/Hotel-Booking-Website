"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function getMessage({
  errorCode,
  noticeCode,
  errorMessages,
  noticeMessages,
  showErrorToast,
  showSuccessToast,
}) {
  if (showErrorToast && errorCode && errorMessages[errorCode]) {
    return {
      type: "error",
      code: errorCode,
      message: errorMessages[errorCode],
    };
  }

  if (showSuccessToast && noticeCode && noticeMessages[noticeCode]) {
    return {
      type: "success",
      code: noticeCode,
      message: noticeMessages[noticeCode],
    };
  }

  return null;
}

export function QueryStatusToast({
  errorCode = "",
  noticeCode = "",
  errorMessages = {},
  noticeMessages = {},
  clearKeys = ["error", "notice"],
  showErrorToast = true,
  showSuccessToast = true,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handledKeyRef = useRef("");

  useEffect(() => {
    const feedback = getMessage({
      errorCode,
      noticeCode,
      errorMessages,
      noticeMessages,
      showErrorToast,
      showSuccessToast,
    });

    if (!feedback) {
      return;
    }

    const handledKey = `${feedback.type}:${feedback.code}`;

    if (handledKeyRef.current === handledKey) {
      return;
    }

    handledKeyRef.current = handledKey;

    if (feedback.type === "error") {
      toast.error(feedback.message);
    } else {
      toast.success(feedback.message);
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    let didChange = false;

    clearKeys.forEach((key) => {
      if (nextSearchParams.has(key)) {
        nextSearchParams.delete(key);
        didChange = true;
      }
    });

    if (!didChange) {
      return;
    }

    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [
    clearKeys,
    errorCode,
    errorMessages,
    noticeCode,
    noticeMessages,
    pathname,
    router,
    searchParams,
    showErrorToast,
    showSuccessToast,
  ]);

  return null;
}
