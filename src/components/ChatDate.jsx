export default function ChatDate({
  date,
}) {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const yesterday =
    new Date(
      Date.now() -
      86400000
    )
      .toISOString()
      .split("T")[0];

  let label = date;

  if (date === today) {
    label = "Hari Ini";
  }

  else if (
    date === yesterday
  ) {
    label = "Kemarin";
  }

  return (
    <div
      className="
        flex
        items-center
        justify-center

        py-2
      "
    >

      <div
        className="
          rounded-full

          bg-[#D9D9D9]

          px-4
          py-1
        "
      >

        <p
          className="
            font-signika
            text-[13px]

            text-[#666]
          "
        >
          {label}
        </p>

      </div>

    </div>
  );
}