import React, { useState } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";

function App() {
  const [render, setRender] = useState({create: true})
  const [roomID, setRoomID] = useState(1111)
  return (
    // <BrowserRouter>
    <div>
      {/* <Switch> */}
        {/* <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} /> */}
      {/* </Switch> */}
      {render.create ? <CreateRoom setRender={setRender}/> :
      <Room roomID={roomID}/>}
    </div>
    // </BrowserRouter>
  );
}

export default App;
