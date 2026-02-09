interface MessageProps {
    messageText: string;
    from: 'send' | 'receive';
    timestamp?: string;
}

function MessageComponent({ messageText, from, timestamp }: MessageProps) {
    return (
        <div className={`flex ${from === "send" ? "justify-end" : "justify-start"}`}>
            <div
                className={`py-1.5 px-3 rounded-xl w-max max-w-xs md:max-w-md lg:max-w-lg
                ${from === "send" ? 
                "bg-blue-500 text-white" : 
                "bg-gray-400 text-black"}`}
            >
                <p className="break-words">{messageText}</p>
                {timestamp && (
                    <p className="text-xs mt-1 opacity-70">
                        {timestamp}
                    </p>
                )}
            </div>
        </div>
    );
}

export default MessageComponent;