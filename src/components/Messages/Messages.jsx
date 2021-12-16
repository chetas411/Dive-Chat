import React from 'react';
import ScrollToBottom from "react-scroll-to-bottom";
import { getAuth } from 'firebase/auth';
import Message from "../Message";
import './Messages.css';

const Messages = ({messages,name}) => {
    console.log(messages)
    return (
        <ScrollToBottom className = "messages">
        {
            messages.map((message,index)=>{
                let pos = (message.from === getAuth().currentUser.uid)? "right" : "left";
                return <Message messageData={message} id={index} key={index} pos={pos}  /> 
            })
        }
        </ScrollToBottom>
    );
}

export default Messages;