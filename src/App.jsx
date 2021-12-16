import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import Join from "./components/Join";
import Chat from "./components/Chat";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import { getAuth } from 'firebase/auth';
import { ref, getDatabase, update } from 'firebase/database'
import './Firebase'
const App = () => {
    window.addEventListener('beforeunload', async () => {
        const user = getAuth().currentUser
        if(user){
            const db = getDatabase()
            const updates = {};
            updates['/users/' + user.uid + '/active'] = false;
            await update(ref(db), updates);
        }
    })
    return (
        <BrowserRouter>
            <Route path = "/" exact component = {SignUp} />
            <Route path = "/login"component = {LogIn} />
            <Route path = "/join" component = {Join} />
            <Route path = "/chat" component = {Chat} />
        </BrowserRouter>
    )
}

export default App;
