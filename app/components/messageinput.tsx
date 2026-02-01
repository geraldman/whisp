"use client";

import { useState } from "react";

function messageInput(){
    const [message, setMessage] = useState("");

    return (
        <div className="flex flex-row w-full pb-5 px-10">
            <textarea 
                name="" 
                id="" 
                className="w-9/10" 
                placeholder="Write your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button 
                className="flex w-1/10 items-center justify-center"
                disabled={!message.trim()}
            >
                <span className={`flex items-center justify-center rounded-full p-3 ${message.trim() ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    <img src="/sent-02-stroke-rounded.png" alt="Send" className="invert" />
                </span>
            </button>
        </div>
    ) 
}

export default messageInput;
