"use client";

export default function TextBox({
  placeholder,

  type = "text",

  value,

  onChange,

  multiline = false,

  className = "",
}) {

  /* ───────── Textarea ───────── */

  if (multiline) {

    return (
      <textarea
        placeholder={placeholder}

        value={value}

        onChange={onChange}

        className={`
          w-full

          rounded-2xl

          border-2
          border-[#B1B1B1]

          bg-[#F2F2F2]

          px-4
          py-3

          outline-none
          resize-none

          font-signika
          text-[21.357px]
          text-[#575757]

          placeholder:text-[#B0B0B0]
          placeholder:text-[21.357px]
          placeholder:font-signika

          ${className}
        `}
      />
    );
  }

  /* ───────── Input ───────── */

  return (
    <input
      type={type}

      placeholder={placeholder}

      value={value}

      onChange={onChange}

      className={`
        w-full
        h-18.75

        rounded-2xl

        border-2
        border-[#B1B1B1]

        bg-[#F2F2F2]

        px-4
        py-3

        outline-none

        font-signika
        text-[21.357px]
        text-[#575757]

        placeholder:text-[#B0B0B0]
        placeholder:text-[21.357px]
        placeholder:font-signika

        ${className}
      `}
    />
  );
}