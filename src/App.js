import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import SideBar from './Components/SideBar/SideBar';
import Room from "./Components/Room";
//import SignIn from './Components/SignIn';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import './App.css'

firebase.initializeApp({
  apiKey: "AIzaSyCSCOjSSXznR800HAvxmsnk1U-6fh0-LCI",
  authDomain: "chat-app-c6a23.firebaseapp.com",
  projectId: "chat-app-c6a23",
  storageBucket: "chat-app-c6a23.appspot.com",
  messagingSenderId: "21874384561",
  appId: "1:21874384561:web:33ab504af74026aa458c90"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [render, setRender] = useState({create: true});
  const [roomID, setRoomID] = useState(1111);
  const [user] = useAuthState(auth);
  return (
    <div style={{backgroundColor: "rgba(54,57,63,255)"}}>
      {/* {user ? 
      <div style={{display:"flex"}}>
        <SideBar setRender={setRender}/>
        {!render.create ? <Room roomID={roomID} setRender={setRender}/>:<ChatRoom/>}
      </div>
      : <SignIn/>
      }
      <SignOut/> */}
      <Room roomID={roomID} setRender={setRender}/>
    </div>
  );
}

export default App;

function SignIn() {
  function signInWithGoogle(){
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
  }
  return (
    <div style={{height: '100vh'}}>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const dummy = useRef();

  useEffect(()=>{
    dummy.current.scrollIntoView({behavior: 'smooth'})
  },[])
  
  async function sendMessage(e){
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    try{
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
    }catch(err){
      console.log(err)
    }
    setFormValue('')
    dummy.current.scrollIntoView({behavior: 'smooth'})
  }

  return(
    <div className='chatContainer'>
      <div className='chat'>
        <div className='messages'>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
          <div ref={dummy}></div>
        </div>
        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          <button type='submit'>Send</button>
        </form>
      </div>
    </div>
  )
}

function ChatMessage({message}){
  const {text, uid, photoURL} = message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  )
}

