import React,{useState} from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { blue, grey } from '@material-ui/core/colors';
import {update,onValue,getDatabase,ref, get,child } from 'firebase/database'

const Message = ({messageData,pos,id}) => {
    const [status,setStatus] = useState(messageData.status)
    const db = getDatabase();
    const recieverRef = ref(db, `users/${messageData.to}`)
    const msgRef = ref(db, `chat/${messageData.room}`)
    if(pos === "right"){
        onValue(recieverRef, (snapshot) => {
            const reciever = snapshot.val();
            console.log(reciever);
            console.log(3);
            if (reciever.active && status === "sent") {
                // setStatus("recieved")
                get(child(ref(db), `chat/${messageData.room}`)).then((snapshot) => {
                    const updates = {}
                    let messages = [...snapshot.val()];
                    messages[id] = {
                        ...messageData,
                        status: "recieved"
                    }
                    updates[`/chat/${messageData.room}`] = messages
                    update(ref(db), updates)
                })
                .then(()=>{
                    setStatus("recieved")
                })
            }
        })
        onValue(msgRef,(snapshot) => {
            const messages = snapshot.val();
            if(messages[id].status === "seen" && status !== "seen"){
                setStatus("seen")
            }
        })
    }

    if(pos === "left"){
        get(child(ref(db), `chat/${messageData.room}`)).then((snapshot) => {
            const updates = {}
            let messages = [...snapshot.val()];
            if(messages[id].status !== "seen"){
                messages[id] = {
                    ...messageData,
                    status: "seen"
                }
                updates[`/chat/${messageData.room}`] = messages
                update(ref(db), updates)
            }
        })
    }
    
    let color = (pos==="right")? "primary" : "secondary"
    return (
        <Fade in={true}>
        <ListItem>
            <Grid container>
                <Grid item xs={12}>
                    <ListItemText align={pos} ><Chip color={color} size="medium" label={messageData.text} /></ListItemText>
                </Grid>
                {
                        (pos === "right") && 
                        <Grid item xs={12}>
                            <ListItemText align={pos}>
                                {
                                    (status === "sent") && <DoneIcon style={{color: grey[400]}} />
                                }
                                {
                                    (status === "recieved") && <DoneAllIcon style={{color: grey[400]}} />
                                }
                                {
                                    (status === "seen") && <DoneAllIcon style={{color: blue[400]}} />
                                }
                            </ListItemText>
                        </Grid>
                }
            </Grid>
        </ListItem>
        </Fade>
    )
}

export default Message;
