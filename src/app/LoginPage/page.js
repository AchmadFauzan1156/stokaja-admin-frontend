"use client";

import { useState } from "react";

import { useRouter }
from "next/navigation";

import TextBox from "@/components/TextBox";
import Button from "@/components/Button";

export default function LoginPage() {

  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showError,
    setShowError,
  ] = useState(false);

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

  const formValid =
    emailValid &&
    password.trim() !== "";

  const handleLogin = () => {

    const validEmail =
      "admin@stokaja.com";

    const validPassword =
      "12345678";

    if (
      email !== validEmail ||
      password !== validPassword
    ) {

      setShowError(true);

      return;
    }

    router.push(
      "/dashboard"
    );
  };

  return (
    <>
      {/* Error Modal */}
      {showError && (

        <div
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/40
          "
        >

          <div
            className="
              w-80

              rounded-3xl

              bg-white

              p-6
            "
          >

            <h2
              className="
                font-squadaOne
                text-[28px]

                text-[#FF5C2B]
              "
            >
              Login Gagal
            </h2>

            <p
              className="
                mt-3

                font-signika
                text-[18px]

                text-[#555]
              "
            >
              Email atau password
              yang Anda masukkan
              salah.
            </p>

            <div
              className="
                mt-6

                flex
                justify-center
              "
            >

              <Button
                text="OK"

                onClick={() =>
                  setShowError(
                    false
                  )
                }
              />

            </div>

          </div>

        </div>

      )}

      <div
        className="
          flex
          min-h-screen
          flex-col
          items-center
          justify-center

          bg-[#F0E7D6]

          px-8
        "
      >

        {/* Title */}
        <h1
          className="
            mb-16

            text-[43.593px]
            leading-none

            text-[#6E822E]
          "
        >
          Admin Login
        </h1>

        {/* Form */}
        <div
          className="
            flex
            w-full
            max-w-md
            flex-col
            gap-4
          "
        >

          <TextBox
            placeholder="E-Mail"
            type="email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <TextBox
            placeholder="Password"
            type="password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          {email &&
            !emailValid && (

              <p
                className="
                  font-signika
                  text-sm

                  text-red-500
                "
              >
                Format email tidak valid
              </p>

            )}

        </div>

        {/* Login Button */}
        <Button
          text="Log In"

          onClick={
            handleLogin
          }

          disabled={!formValid}

          className="
            mt-16

            leading-none
          "
        />

      </div>
    </>
  );
}