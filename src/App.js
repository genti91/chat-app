import React, { useState, useRef, useEffect } from 'react'
import './App.css';
import io from 'socket.io-client'
import Video from './Components/Video.js';
import Videos from './Components/Videos';

function App() {
  
  var [localScreen, setLocalScreen] = useState(null)
  var [localCam, setLocalCam] = useState(null)
  var [remoteStreams, setRemoteStreams] = useState([])
  var [peerConnections, setPeerConnections] = useState({})
  var [status, setStatus] = useState('Pleas wait...')
  var [pc_config, setPc_config] = useState({
    "iceServers": [
      {
        urls: 'stun:sp-turn2.xirsys.com'
      }, {
        url: "turn:sp-turn2.xirsys.com:3478?transport=tcp",
        username: "eOJgQ7KrOLjlF2RyaI3DdNk2wcG0YEmZlbzF-uwgCAPWVgZ1wSzLfCcva-sfn9XNAAAAAGM5CuZnZW50aTkx",
        credential: "952f2026-4205-11ed-b4a6-0242ac120004",
      }
    ]
  }) 
  var [sdpConstraints, setSdpConstraints] = useState({
    "mandatory": {
        "OfferToReceiveAudio": true,
        "OfferToReceiveVideo": true,
      }
    }
  )
  var [serviceIP, setServiceIP] = useState('https://4502-181-16-122-114.sa.ngrok.io/webrtcPeer')
  // var localScreen = useRef({});
  // var localCam = useRef({});
  // var remoteScreen = useRef({});
  // var remoteCam = useRef({});
  // var textref = useRef({});
  
  var socket = null
  // var candidates = []
 
  socket = io(
    serviceIP,
    {
      path: '/webrtc',
      query: {}
    }
  )

  useEffect(() => {
    
    socket.on('connection-success', data => {
      getLocalStream();
      console.log(data.success)
      const newStatus = data.peerCount > 1 ? `Total Connected Peers: ${data.peerCount}` : `Waiting for other peers to connect`
      setStatus(newStatus)
    })

    socket.on('peer-disconnected', data => {
      console.log('peer-disconnected', data)

      const newRemoteStreams = remoteStreams.filter(stream => stream.id !== data.socketID)

      setRemoteStreams(newRemoteStreams)

    })

    // socket.on('offerOrAnswer', (sdp) => {
    //   textref.value = JSON.stringify(sdp)
    //   console.log(sdp)
    //   pc.setRemoteDescription(new RTCSessionDescription(sdp))
    //   // setRemoteDescription()
    // })

    socket.on('candidate', (data) => {
      // candidates = [...candidates, candidate]
      const pc = peerConnections[data.socketID]
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
      // addCandidate();
    })

    socket.on('online-peer', socketID => {
      console.log('connected peers...', socketID)
      
      createPeerConnection(socketID, pc => {
        if (pc){
          pc.createOffer(sdpConstraints)
          .then(sdp => {
            pc.setLocalDescription(sdp)
            sendToPeer('offer',sdp, {
              local: socket.id,
              remote: socketID
            })
          })
        }
      })
    })

    socket.on('offer', data => {
      createPeerConnection(data.socketID, pc => {
        pc.addStream(localCam)
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then((sdp) => {
          pc.createAnswer(sdpConstraints)
          sendToPeer('answer', sdp, {
            local: socket.id,
            remote: data.socketID,
          })
        })
      })
    })

    socket.on('answer', data => {
      const pc = peerConnections[data.socketID]
      pc.addStream(localCam)
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      .then((sdp) => {
        pc.createAnswer(sdpConstraints)
        sendToPeer('answer', sdp, {
          local: socket.id,
          remote: data.socketID,
        })
      })
    })

  }, [])

  function getLocalStream(){

    function success(cam, screen) {
      if (cam) {
        // window.localCam = cam
        // localCam.current.srcObject = cam
        setLocalCam(cam)
        // pc.addStream(cam)
      }
      if (screen) {
        // window.localScreen = screen
        // localScreen.current.srcObject = screen
        setLocalScreen(screen);
      }
      whoIsOnline()
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((e) => success(e,false))
    .catch((err) => console.log('getUserMedia error: ', err))

    navigator.mediaDevices.getDisplayMedia()
    .then((e) => success(false,e))
    .catch((err) => console.log('getDisplayMedia error: ', err))
  }

  function whoIsOnline() {
    sendToPeer('onlinePeers', null, {local: socket.id})
  }
  
  function sendToPeer(messageType, payload, socketID){
    socket.emit(messageType, {
      socketID,
      payload
    })
  }

  function createPeerConnection(socketID) {
    try {
      let pc = new RTCPeerConnection(pc_config)
      setPeerConnections({...peerConnections, [socketID]: pc})
      
      pc.onicecandidate = (e) => {
        if(e.candidate){
          sendToPeer('candidate', e.candidate, {
            local: socket.id,
            remote: socketID
          })
        }
      }
      pc.oniceconnectionstatechange = (e) => {
        //  if(pc.iceConnectionState === 'disconnected') {
        //    const newRemoteStreams = remoteStreams.filter(stream => stream.id !== socketID)
        //    const streams = newRemoteStreams.length > 0 && newRemoteStreams[0].stream || null
        //   setRemoteStreams(streams)
        // }
      }
      pc.ontrack = (e) => {
        const remoteVideo = {
          id: socketID,
          name: socketID,
          stream: e.streams[0]
        }
        setRemoteStreams([...remoteStreams, remoteVideo])
      }
      pc.close = () => {

      }
      if(localCam){
        pc.addStream(localCam)
      }
    }catch(err){console.log('error creating connection: ', err);return}
  }
  console.log('remoteStreams: ', remoteStreams)
  return (
    <div className="App">
     
      <div style={{display: "flex"}}>
        <div>
          {/* <div>Screen:</div> */}
          {/* <Video videoStream={localScreen} muted></Video> */}
          <div>Cam:</div>
          <Video videoStream={localCam} muted></Video>
        </div>
        <div>
        {/*   <div>Screen:</div> */}
        {/*   <Video ref={remoteScreen}></Video> */}
        {/*   <div>Cam:</div> */}
        {/*   <Video ref={remoteCam}></Video> */}
          <Videos remoteStreamsP={remoteStreams}></Videos>
        </div>
      </div>

      {/* <button onClick={createOffer}>Offer</button> */}
      {/* <button onClick={createAnswer}>Answer</button> */}
      {/* <br/> */}
      {/* <textarea ref={ref => {textref = ref}}/> */}
      {/* <br/> */}
      {/* <button onClick={setRemoteDescription}>Set Remote Desc</button> */}
      {/* <button onClick={addCandidate}>Add Candidate</button> */}

    </div>
  );
}

export default App;
