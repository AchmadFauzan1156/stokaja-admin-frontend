import {
  Squada_One,
  Signika,
} from "next/font/google";

import "./globals.css";

import {
  AdminProvider,
} from "@/context/AdminContext";

const squadaOne =
  Squada_One({
    subsets: ["latin"],
    weight: "400",

    variable:
      "--font-squadaOne",
  });

const signika =
  Signika({
    subsets: ["latin"],

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],

    variable:
      "--font-signika",
  });

export const metadata = {
  title: "StokAja!",

  description:
    "Inventory management app",
};

export const viewport = {
  width: "device-width",

  initialScale: 1,
};

export default function RootLayout({
  children,
}) {

  return (
    <html lang="en">

      <body
        className={`
          ${squadaOne.variable}
          ${signika.variable}

          bg-[#1E1E1E]

          overflow-x-hidden
          antialiased
        `}
      >

        <AdminProvider>

          <main
            className="
              relative

              mx-auto

              min-h-screen
              w-full
              max-w-full

              overflow-hidden

              bg-[#F6F3EA]
            "
          >

            {children}

          </main>

        </AdminProvider>

      </body>

    </html>
  );
}