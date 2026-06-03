"use client";

import { useEffect } from "react";

import { useRouter }
from "next/navigation";

export default function SplashScreen() {

  const router = useRouter();

  useEffect(() => {

    const timer = setTimeout(() => {

      router.push("/LoginPage");

    }, 2500);

    return () =>
      clearTimeout(timer);

  }, [router]);

  return (
    <div
      className="
        flex
        min-h-screen
        flex-col
        items-center
        justify-center

        bg-[#B6D04E]
      "
    >

      <img
        src="/Logo.svg"

        alt="Logo StokAja!"

        width={95}
        height={95}

        className="
          mb-0
          w-24
        "
      />

      <h1
        className="
          font-squadaOne
          text-[75.097px]
          leading-none
          font-normal

          text-white
        "
      >
        StokAja!
      </h1>

    </div>
  );
}