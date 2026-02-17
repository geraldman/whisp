interface MessageProps {
  messageText: string;
  from: "send" | "receive";
}

export default function MessageComponent({
  messageText,
  from,
}: MessageProps) {
  return (
    <div
      className={`flex ${
        from === "send" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          px-3 md:px-4 py-2 md:py-2.5 rounded-2xl 
          max-w-[85%] sm:max-w-[75%] md:max-w-[70%]
          text-sm leading-relaxed
          shadow-sm
          break-words
          ${
            from === "send"
              ? "bg-[#7A573A] text-white rounded-br-md"
              : "bg-[#FFFCF6] text-[#2B1B12] border border-black/5 rounded-bl-md"
          }
        `}
      >
        {messageText}
      </div>
    </div>
  );
}
