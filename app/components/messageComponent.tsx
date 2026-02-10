interface MessageProps {
  messageText: string;
  from: "send" | "receive";
}

export default function MessageComponent({
  messageText,
  from,
}: MessageProps) {
  return (
    <div className={`flex ${from === "send" ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          px-4 py-2 rounded-2xl max-w-xs text-sm shadow-sm
          ${
            from === "send"
              ? "bg-[#7A573A] text-white"
              : "bg-[#FFFCF6] text-[#2B1B12] border border-black/5"
          }
        `}
      >
        {messageText}
      </div>
    </div>
  );
}
