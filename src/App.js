import React, { useState, useRef } from 'react'
import './App.css';

function App() {
  
  var localScreen = useRef({});
  var localCam = useRef({});
  var remoteScreen = useRef({});
  var remoteCam = useRef({});
  var textref = useRef({});

  const pc_config = null
  
  // const pc_config = {
  //   "iceServers": [
  //     {
  //       urls: 'stun:[STUN-IP]:[PORT]',
  //       'credential': '[YOUR CREDENTIAL]',
  //       'username': '[USERNAME]'
  //     }
  //   ]
  // }
  //
  function success(stream) {
    window.localStream = stream
    localCam.current.srcObject = stream
    pc.addStream(stream)
  }

  var pc = new RTCPeerConnection (pc_config)

  pc.onicecandidate = (e) => {
    if (e.candidate) console.log(JSON.stringify(e.candidate))
  }

  pc.oniceconnectionstatechange = (e) => {
    console.log(e);
  }

  pc.onaddstream = (e) => {
    remoteCam.current.srcObject = e.stream
  }

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(success)
  .catch(console.error)

  navigator.mediaDevices.getDisplayMedia()
  .then(v => localScreen.current.srcObject = v)
  .catch(console.error)

  function createOffer() {
    console.log('Offer');
    pc.createOffer({offerToReceiveVideo: 1})
    .then(sdp => {
      console.log(JSON.stringify(sdp))
      pc.setLocalDescription(sdp)
    }, e => {})
  }

  function addCandidate() {
    const candidate = JSON.parse(textref.value)
    console.log('Adding candidate:', candidate)
    pc.addIceCandidate(new RTCIceCandidate(candidate))
  }

  function setRemoteDescription() {
    const desc = JSON.parse(textref.value)
    pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  function createAnswer() {
    console.log('Answer')
    pc.createAnswer({offerToReceiveVideo: 1})
    .then(sdp => {
      console.log(JSON.stringify(sdp))
      pc.setLocalDescription(sdp)
    }, e => {})
  }

  return (
    <div className="App">
     
      <div style={{display: "flex"}}>
        <div>
          <div>Screen:</div>
          <video ref={localScreen} autoPlay></video>
          <div>Cam:</div>
          <video ref={localCam} autoPlay></video>
        </div>

        <div>
          <div>Screen:</div>
          <video ref={remoteScreen} autoPlay></video>
          <div>Cam:</div>
          <video ref={remoteCam} autoPlay></video>
        </div>
      </div>

      <button onClick={createOffer}>Offer</button>
      <button onClick={createAnswer}>Answer</button>
      <br/>
      <textarea ref={ref => {textref = ref}}/>
      <br/>
      <button onClick={setRemoteDescription}>Set Remote Desc</button>
      <button onClick={addCandidate}>Add Candidate</button>

    </div>
  );
}

export default App;
