export default function Button({
  text,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex
        h-15
        w-76.5

        items-center
        justify-center

        gap-[11.8px]

        rounded-[59px]

        p-[11.8px]

        font-squada
        text-[32.246px]

        transition-all
        duration-200

        ${
          variant === "primary"
            ? "bg-[#FF5E33] text-white"
            : "bg-[#8D8D8D] text-white"
        }

        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }

        ${className}
      `}
    >
      {text}
    </button>
  );
}