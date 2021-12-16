import React, { useEffect, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import Messages from '../components/Messages/Messages';
import SideBar from '../components/SideBar';
import { getDatabase, ref, onValue, get,update,child,serverTimestamp } from "firebase/database";
import { getAuth } from 'firebase/auth';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(6),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
            overflow: "hidden"
        },
        height: '100vh',
    },
    grid: {
        height: '100%',
    },
    paper: {
        position:'relative',
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        height: '85vh',
        [theme.breakpoints.down('sm')]: {
            position: 'relative',
            height: '100vh'
        }
    },
}));

const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [roomID, setRoomID] = useState('');
    const [message,setMessage] = useState('');
    const [messages,setMessages] = useState([]);
    const [users,setUsers] = useState([]);
    const [reciever,setReciever] = useState("")
    useEffect(()=>{
        if(reciever){
            const cid = getAuth().currentUser.uid;
            const room = (cid < reciever.rid) ? cid + reciever.rid : reciever.rid + cid;
            setRoomID(room)
        }
    },[reciever])
    const db = getDatabase();
    const usersRef = ref(db, 'users/');
    const chatRoomRef = ref(db, 'chat/')
    onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const activeUsers = [];
        const currUserID = getAuth().currentUser.uid;
        console.log(1);
        for(let id in data){
            if(id !== currUserID){
                activeUsers.push({name: data[id].username,id: id, status: data[id].active})
            }
        }
        const currCount = activeUsers.reduce((count,a)=>{
            return count + (a.status)? 1 : 0;
        },0)
        const prevCount = users.reduce((count,a)=>{
            return count + (a.status) ? 1 : 0;
        },0)
        if(activeUsers.length !== users.length || currCount !== prevCount){
            setUsers(activeUsers)
        }
    });
    onValue(chatRoomRef, (snapshot) => {
        if(snapshot.exists() && snapshot.val() !== "empty"){
            console.log(2);
            if (roomID && snapshot.val()[roomID]){
                const data = snapshot.val()[roomID]
                if (data.length !== messages.length) {
                    setMessages(data)
                }
            }
            else if(!snapshot.val()[roomID] && messages.length !== 0){
                setMessages([])
            }
              
        }
    })

    const sendMessage = ()=>{
        if(message){
            const dbRef = ref(db);
            const cid = getAuth().currentUser.uid;
            const roomID = (cid < reciever.rid)? cid+reciever.rid : reciever.rid+cid;
            get(child(dbRef,'chat/')).then((snapshot) => {
                const chatData = snapshot.val();
                if(chatData === "empty"){
                    const updates = {};
                    updates["/chat"] = {
                        [roomID] : [
                            {
                                text: message,
                                from: cid,
                                to: reciever.rid,
                                room: roomID,
                                status: (users.reduce((status, user) => {
                                    return (status || (user.id === reciever.rid && user.status === true))
                                }, false)) ? "recieved" : "sent",
                                timestamp: serverTimestamp()
                            }
                        ]
                    }
                    update(dbRef,updates)
                }
                else if(chatData[roomID]){
                    const updates = {};
                    updates[`/chat/${roomID}`] = [
                        ...chatData[roomID],
                        {
                            text: message,
                            from: cid,
                            to: reciever.rid,
                            room: roomID,
                            status: (users.reduce((status,user)=>{
                                return (status || (user.id === reciever.rid && user.status === true))
                            },false))? "recieved" : "sent",
                            timestamp: serverTimestamp()
                        }
                    ]
                    update(dbRef, updates)
                }
                else{
                    const updates = {};
                    updates["/chat"] = {
                        ...chatData,
                        [roomID]: [
                            {
                                text: message,
                                from: cid,
                                to: reciever.rid,
                                room: roomID,
                                status: (users.reduce((status, user) => {
                                    return (status || (user.id === reciever.rid && user.status === true))
                                }, false)) ? "recieved" : "sent",
                                timestamp: serverTimestamp()
                            }
                        ]

                    }
                    update(dbRef, updates)
                }
            }).then(()=>{
                setMessage("")
            }).catch((error) => {
                console.log(error);
            })
        }
    };
    const classes = useStyles();
    return (
        <>
            <CssBaseline />
            <div className={classes.root} >
                <Grid className={classes.grid} container spacing={3}>
                    <SideBar userSelect={(val) => setReciever(val)} styleclass = {classes.paper} users = {users} />
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper className={classes.paper} elevation={24} >
                            <h2>{reciever.rname}</h2>
                            <Messages messages = {messages} name = {name}/>
                            <Grid container style={{ padding: '20px',position: 'absolute', bottom: 0, left: 0}} >
                                <Grid item xs={10} sm={11}>
                                    <TextField 
                                    id="outlined-basic-email" 
                                    label="Type Something" 
                                    fullWidth variant="outlined" 
                                    autoFocus = "true"
                                    autoComplete="off"
                                    value={message}
                                    onChange = {(event)=>setMessage(event.target.value)}
                                    onKeyPress = {(event)=>(event.key === "Enter")? sendMessage() : null}
                                    />
                                </Grid>
                                <Grid xs={2} sm={1} align="right">
                                    <Fab onClick={() => sendMessage()} color="primary" aria-label="add"><SendIcon /></Fab>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default Chat
