"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function AutoLogout() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const timerRef = useRef(null);

  // 2 jam dalam milidetik (2 * 60 * 60 * 1000)
  const IDLE_TIMEOUT = 7200000; 

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (user) {
      timerRef.current = setTimeout(() => {
        handleIdleLogout();
      }, IDLE_TIMEOUT);
    }
  };

  const handleIdleLogout = async () => {
    try {
      if (user) {
        console.log("Sesi Admin/Kasir berakhir karena tidak ada aktivitas selama 2 jam. Melakukan auto-logout...");
        await logout();
      }
    } catch (err) {
      console.error("Auto logout failed", err);
    }
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      resetTimer();
    };

    if (user) {
      resetTimer(); 
      events.forEach((event) => {
        window.addEventListener(event, handleActivity, { passive: true });
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, pathname]);

  return null; 
}
