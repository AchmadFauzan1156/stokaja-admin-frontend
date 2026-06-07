import Image from "next/image";

export default function ChatHeader({ title = "Pelanggan", subtitle = "Online" }) {

  return (
    <div
      className="
        fixed
        top-0
        left-0
        right-0
        z-50

        flex
        items-center
        gap-4

        border-b-2
        border-[#D9D9D9]

        bg-[#F0E7D6]

        px-5
        pb-4
        pt-12
      "
    >

      {/* Store Picture */}
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center

          overflow-hidden
          rounded-full

          bg-[#B6D04E]
        "
      >
        <Image
          src="/Logo.svg"
          alt="Store"
          width={32}
          height={32}
        />
      </div>

      {/* Store Info */}
      <div>

        <h1
          className="
            font-squada
            text-[28px]
            leading-none

            text-[#5F7026]
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-1

            font-signika
            text-[15px]

            text-[#6F6F6F]
          "
        >
          {subtitle}
        </p>

      </div>

    </div>
  );
}