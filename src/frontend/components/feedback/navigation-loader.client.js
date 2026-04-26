"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RouteLoadingState } from "@/src/frontend/components/feedback/route-loading-state";

function isModifiedEvent(event) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function NavigationLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    function clearTimers() {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }

    function handleDocumentClick(event) {
      if (event.defaultPrevented || isModifiedEvent(event)) {
        return;
      }

      const clickTarget =
        event.target instanceof Element ? event.target : event.target?.parentElement;
      const anchor = clickTarget?.closest("a[href]");

      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const rawHref = anchor.getAttribute("href");

      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      let targetUrl;

      try {
        targetUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const nextKey = `${targetUrl.pathname}?${targetUrl.searchParams.toString()}`;
      const currentKey = `${currentUrl.pathname}?${currentUrl.searchParams.toString()}`;

      if (nextKey === currentKey) {
        return;
      }

      clearTimers();
      showTimerRef.current = window.setTimeout(() => {
        setIsVisible(true);
        showTimerRef.current = null;
      }, 130);
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  useEffect(() => {
    const pathChanged = previousPathnameRef.current !== pathname;

    if (!pathChanged) {
      return undefined;
    }

    previousPathnameRef.current = pathname;

    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (!isVisible) {
      return undefined;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      hideTimerRef.current = null;
    }, 180);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname, isVisible]);

  if (!isVisible) {
    return null;
  }

  return <RouteLoadingState mode="floating" />;
}
