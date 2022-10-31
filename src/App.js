import React, { useState } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import SideBar from './Components/SideBar/SideBar';
import Room from "./Components/Room";

function App() {
  const [render, setRender] = useState({create: true})
  const [roomID, setRoomID] = useState(1111)
  return (
    // <BrowserRouter>
    <div style={{backgroundColor: "rgba(54,57,63,255)"}}>
      {/* <Switch> */}
        {/* <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} /> */}
      {/* </Switch> */}
      <div style={{display:"flex"}}>
        <SideBar setRender={setRender}/>
        {!render.create ? <Room roomID={roomID}/>:null}
      </div>
    </div>
    // </BrowserRouter>
  );
}

export default App;
