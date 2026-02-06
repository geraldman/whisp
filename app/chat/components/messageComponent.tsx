interface message{
    messageText: string;
    from: 'send' | 'receive';
}

function messageComponent(input: message){
    return(
        <div className={`flex ${input.from === "send" ? "justify-end" : "justify-start"}`}>
            <div
            className={`py-1.5 px-3 rounded-xl w-max
                ${input.from == "send" ? 
                "bg-blue-500 text-white" : 
                "bg-gray-400 text-black"}`}
            >
                <p>{input.messageText}</p>
            </div>
        </div>
    )
}

export default messageComponent;