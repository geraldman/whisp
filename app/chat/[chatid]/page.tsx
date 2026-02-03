"use client";

import MessageInput from "../../components/messageinput";
import MessageBox from "../../layout/messageBox";

export default function chats(){
    return (
        <div className="w-full flex flex-row h-screen">
            <div className="w-3/10"> 

            </div>
            <div className="w-7/10 flex flex-col h-full border-1 border-solid">
                <div className="h-[5%]">

                </div>
                <div className="flex-1 overflow-y-scroll">
                    <MessageBox/>
                </div>
                <div className="h-auto ">
                    <MessageInput/>
                </div>
            </div>
        </div>
    );
} 