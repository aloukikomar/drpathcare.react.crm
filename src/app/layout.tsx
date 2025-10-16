"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "@/styles/global.css";

import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      // Skip loader on first load / refresh
      firstRender.current = false;
      return;
    }

    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300); // small delay for smoothness

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        <LocalizationProvider>
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
