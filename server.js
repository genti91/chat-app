const express = require('express')

var io = require('socket.io')
({
  path: '/webrtc'
})

const app = express ()
const port = 8080

/* app.get('/', (req, res) => res.send('hola')) */

app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/build/index.html')
})

const server = app.listen(port, () => console.log('listenign on port: ' + port))

io.listen(server)

const peers = io.of('/webrtcPeer')

let connectedPeers = new Map()

peers.on('connection', socket => {
  
  connectedPeers.set(socket.id, socket)


  console.log(socket.id)
  
  socket.emit('connection-success', {
    success: socket.id,
    peerCount: connectedPeers.size,
  })

  const broadcast = () => socket.broadcast.emit('joined-peers', {
    peerCount: connectedPeers.size,
  })


  const disconnectPeer = (socketId) => socket.broadcast.emit('peer-disconnected', {
    peerCount: connectedPeers.size,
    socketId: socketId
  })

  socket.on('disconnect', () => {
    console.log('disconnected')
    connectedPeers.delete(socket.id)
    disconnectPeer(socket.id)
  })

  socket.on('onlinePeers', (data) => {
    console.log('onlinePeers data: ',data)
    for (const [socketId, _socket] of connectedPeers.entries()) {
      if (data.socketId && socketId !== data.socketId.local){
        console.log('online-peer', data.socketId, socketId)
        socket.emit('online-peer', socketId)
      }
    }
  })

  socket.on('offer', (data) => {
    for (const [socketId, socket] of connectedPeers.entries()) {
      if (socketId !== data.socketId.remote) {
        console.log(socketId, data.payload.type)
        socket.emit('offer', {
          sdp: data.payload,
          socketId: data.socketId.local
        })
      }
    }
  })

  socket.on('answer', (data) => {
    for (const [socketId, socket] of connectedPeers.entries()) {
      if (socketId !== data.socketId.remote) {
        socket.emit('answer', {
          sdp: data.payload,
          socketId: data.socketId.local
        })
      }
    }
  })


  // socket.on('offerOrAnswer', (data) => {
  //   for (const [socketId, socket] of connectedPeers.entries()) {
  //     if (socketId !== data.socketId) {
  //       console.log(socketId, data.payload.type)
  //       socket.emit('offerOrAnswer', data.payload)
  //     }
  //   }
  // })

  socket.on('candidate', (data) => {
    for (const [socketId, socket] of connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        console.log(socketId, data.payload)
        socket.emit('candidate', {
          candidate: data.payload,
          socketId: data.socketId.local
        })
      }
    }
  })

})
