import Image from "next/image";

export default function SearchBar({
  value,
  onChange,
}) {
  return (
    <div className="relative m-2.5">

      <Image
        src="/Search.svg"
        alt="Search Icon"
        width={24}
        height={24}
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
        "
      />

      <input
        type="text"
        placeholder="Search"

        value={value}
        onChange={onChange}

        className="
          w-84.5
          h-12

          rounded-2xl

          border-2
          border-[#B1B1B1]

          bg-[#F2F2F2]

          pl-12
          pr-4
          py-3

          outline-none

          font-signika
          text-[19.125px]
          text-[#575757]

          placeholder:text-[#B0B0B0]
          placeholder:text-[19.125px]
          placeholder:font-signika
        "
      />

    </div>
  );
}