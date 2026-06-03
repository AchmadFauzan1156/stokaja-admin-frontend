"use client";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";

export default function Navbar() {

  const pathname = usePathname();

  const navItems = [
    {
      name: "dashboard",
      href: "/dashboard",
      icon: "/Dashboard.svg",
      alt: "Dashboard Icon",
    },

    {
      name: "reports",
      href: "/reports",
      icon: "/Reports.svg",
      alt: "Reports Icon",
    },

    {
      name: "cashier",
      href: "/cashier",
      icon: "/Cashier.svg",
      alt: "Cashier Icon",
    },

    {
      name: "stock",
      href: "/stock",
      icon: "/Stock.svg",
      alt: "Stock Icon",
    },

    {
      name: "chat",
      href: "/chat",
      icon: "/Chat.svg",
      alt: "Chat Icon",
    },
  ];

  return (
    <nav
      className="
        fixed
        bottom-0
        left-1/2
        -translate-x-1/2

        w-full
        max-w-full

        h-33.75

        bg-[#B6D04E]

        flex
        items-center
        justify-center

        px-4
      "
    >

      <div
        className="
          flex
          flex-row
          gap-2
        "
      >

        {navItems.map((item) => {

          const isSelected =
            pathname === item.href;

          return (

            <Link
              key={item.name}
              href={item.href}

              className={`
                w-16.5
                h-16.5

                rounded-2xl

                flex
                items-center
                justify-center

                transition-all
                duration-200

                ${
                  isSelected
                    ? "bg-[#F0E7D6]"
                    : "bg-transparent"
                }
              `}
            >

              <Image
                src={item.icon}
                alt={item.alt}

                width={38}
                height={38}
              />

            </Link>

          );
        })}

      </div>

    </nav>
  );
}