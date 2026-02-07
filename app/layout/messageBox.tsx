import MessageComponent from "../components/messageComponent";

function messageBox(){
    return (
        <div className="flex flex-col gap-2 px-10">
            <MessageComponent messageText="Hello" from="send"/>
            <MessageComponent messageText="Hello" from="receive"/>
            <MessageComponent messageText="How are you" from="send"/>
            <MessageComponent messageText="im fine, hbu?" from="receive"/>
            <MessageComponent messageText="very good" from="send"/>
            <MessageComponent messageText="im doing well" from="send"/>
        </div>
    )
}

export default messageBox;