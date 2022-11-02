import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
    padding-left: 50px;
    padding-right: 50px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    max-height: 500px;
    max-width: 800px;
    border-radius: 15px;
    background-color: rgba(32,34,37,255);
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <div>
            <StyledVideo playsInline autoPlay ref={ref} />
        </div>
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = ({roomID, setRender}) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const [video, setVideo] = useState(false);
    // const roomID = props.match.params.roomID;
    const userStream = useRef()

    useEffect(() => {
        socketRef.current = io.connect("https://eb8e-181-16-123-114.sa.ngrok.io");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            userStream.current = stream
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push({
                        peerID: userID,
                        peer,
                    });
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                const peerObj = {
                    peer,
                    peerID: payload.callerID
                }

                setPeers(users => [...users, peerObj]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("peer-disconnected", payload => {
                const peerObj = peersRef.current.find(peer => peer.peerID === payload.socketId)
                if(peerObj){
                    peerObj.peer.destroy();
                }
                peersRef.current = peersRef.current.filter(peer => peer.peerID !== payload.socketId)
                setPeers(peersRef.current)
            });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }
    function disconnect(){
        // const videoTrack = userVideo.current.srcObject.getTracks().find(track => track.kind === 'video');
        // if (videoTrack.enabled) {
        //     videoTrack.enabled = false;
        // }else{
        //     videoTrack.enabled = true;
        // }
        setRender({create: true})
        socketRef.current.emit("disconnect");
    }

    return (
        <Container>
            <button onClick={disconnect}>Disconnect</button>
            <div style={{borderRadius:"20px", marginTop: "50px"}}>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
            </div>
            {peers.map((peer) => {
                return (
                    <Video key={peer.peerID} peer={peer.peer} />
                );
            })}
        </Container>
    );
};

export default Room;
