"use client";

import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import MessageInput from "../components/messageinput";
import MessageBox from "../layout/messageBox";

export default function chats(){
    const { loading, user } = useRequireAuth();
    
    if (loading || !user) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="w-full flex flex-row h-screen">
            <div className="w-3/10"> 
                <h1>Hello ${user?.username}</h1>
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