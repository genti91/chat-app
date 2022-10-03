import React, { useState, useRef, useEffect } from 'react'
import './App.css';
import io from 'socket.io-client'
import Video from './Components/Video.js';

function App() {
  
  var [localScreen, setLocalScreen] = useState(null)
  var [localCam, setLocalCam] = useState(null)
  // var localScreen = useRef({});
  // var localCam = useRef({});
  var remoteScreen = useRef({});
  var remoteCam = useRef({});
  var textref = useRef({});
  
  var socket = null
  var candidates = []
 
  socket = io(
    '/webrtcPeer',
    {
      path: '/webrtc',
      query: {}
    }
  )

  // useEffect(() => {
    
    socket.on('connection-success', success => {
    console.log(success)
    })

    socket.on('offerOrAnswer', (sdp) => {
      textref.value = JSON.stringify(sdp)
      console.log(sdp)
      pc.setRemoteDescription(new RTCSessionDescription(sdp))
      // setRemoteDescription()
    })

    socket.on('candidate', (candidate) => {
      candidates = [...candidates, candidate]
      pc.addIceCandidate(new RTCIceCandidate(candidate))
      // addCandidate();
    })

  // }, [])

  // const pc_config = null
  
  const pc_config = {
    "iceServers": [
      // {
      //   urls: 'stun:[STUN-IP]:[PORT]',
      //   'credential': '[YOUR CREDENTIAL]',
      //   'username': '[USERNAME]'
      // }
      // {
      //   urls: 'stun:stun.l.google.com:19302'
      // },
      // {
      //   url: 'turn:192.158.29.39:3478?transport=tcp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // },
      {
        urls: 'stun:sp-turn2.xirsys.com'
      }, {
        url: "turn:sp-turn2.xirsys.com:3478?transport=tcp",
        username: "eOJgQ7KrOLjlF2RyaI3DdNk2wcG0YEmZlbzF-uwgCAPWVgZ1wSzLfCcva-sfn9XNAAAAAGM5CuZnZW50aTkx",
        credential: "952f2026-4205-11ed-b4a6-0242ac120004",
      }
    ]
  }


  function success(cam, screen) {
    if (cam) {
      // window.localCam = cam
      // localCam.current.srcObject = cam
      setLocalCam(cam)
      pc.addStream(cam)
    }
    if (screen) {
      // window.localScreen = screen
      // localScreen.current.srcObject = screen
      setLocalScreen(screen);
    }
  }

  var pc = new RTCPeerConnection (pc_config)

  pc.onicecandidate = (e) => {
    if (e.candidate) sendToPeer('candidate', e.candidate)
  }

  pc.oniceconnectionstatechange = (e) => {
    console.log(e);
  }

  pc.onaddstream = (e) => {
    remoteCam.current.srcObject = e.stream
    remoteScreen.current.srcObject = e.stream
  }
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((e) => success(e,false))
    .catch((err) => console.log('getUserMedia error: ', err))

    navigator.mediaDevices.getDisplayMedia()
    .then((e) => success(false,e))
    .catch((err) => console.log('getDisplayMedia error: ', err))
  }, [])
  
  function createOffer() {
    console.log('Offer');
    pc.createOffer({offerToReceiveVideo: 1})
    .then(sdp => {
      // console.log(JSON.stringify(sdp))
      pc.setLocalDescription(sdp)
      sendToPeer('offerOrAnswer', sdp)
    }, e => {})
  }

  function addCandidate() {
    // const candidate = JSON.parse(textref.value)
    // console.log('Adding candidate:', candidate)
    // pc.addIceCandidate(new RTCIceCandidate(candidate))
    candidates.forEach(candidate => {
      console.log(JSON.stringify(candidate))
      pc.addIceCandidate(new RTCIceCandidate(candidate))
    })
  }

  function setRemoteDescription() {
    const desc = JSON.parse(textref.value)
    pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  function createAnswer() {
    console.log('Answer')
    pc.createAnswer({offerToReceiveVideo: 1})
    .then(sdp => {
      // console.log(JSON.stringify(sdp))
      pc.setLocalDescription(sdp)
      sendToPeer('offerOrAnswer', sdp)
    }, e => {})
  }

  function sendToPeer(messageType, payload){
    socket.emit(messageType, {
      socketID: socket.id,
      payload
    })
  }

  return (
    <div className="App">
     
      <div style={{display: "flex"}}>
        <div>
          <div>Screen:</div>
          <Video videoStream={localScreen} muted></Video>
          <div>Cam:</div>
          <Video videoStream={localCam} muted></Video>
        </div>
        {/* <div> */}
        {/*   <div>Screen:</div> */}
        {/*   <Video ref={remoteScreen}></Video> */}
        {/*   <div>Cam:</div> */}
        {/*   <Video ref={remoteCam}></Video> */}
        {/* </div> */}
      </div>

      <button onClick={createOffer}>Offer</button>
      <button onClick={createAnswer}>Answer</button>
      <br/>
      <textarea ref={ref => {textref = ref}}/>
      <br/>
      {/* <button onClick={setRemoteDescription}>Set Remote Desc</button> */}
      {/* <button onClick={addCandidate}>Add Candidate</button> */}

    </div>
  );
}

export default App;
