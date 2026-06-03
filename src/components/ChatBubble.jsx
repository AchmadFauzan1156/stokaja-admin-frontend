export default function ChatBubble({
  sender,
  message,
  time,
}) {

  const isUser =
    sender === "user";

  return (
    <div
      className={`
        flex
        w-full

        ${
          isUser
            ? "justify-end"
            : "justify-start"
        }
      `}
    >

      <div
        className={`
          max-w-[78%]

          rounded-[22px]

          px-4
          py-3

          ${
            isUser
              ? "bg-[#B6D04E] text-white rounded-br-md"
              : "bg-white text-[#444] rounded-bl-md"
          }
        `}
      >

        {/* Message */}
        <p
          className="
            font-signika
            text-[17px]
            leading-[1.3]
          "
        >
          {message}
        </p>

        {/* Time */}
        <p
          className={`
            mt-2

            text-right

            font-signika
            text-[12px]

            ${
              isUser
                ? "text-[#EEF7D0]"
                : "text-[#8D8D8D]"
            }
          `}
        >
          {time}
        </p>

      </div>

    </div>
  );
}