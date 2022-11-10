// require('dotenv').config();
// const express = require("express");
// const http = require("http");
// const app = express();
// const socket = require("socket.io");

// app.use(express.static(__dirname + '/build'))
// app.get('/', (req, res, next) => {
//   res.sendFile(__dirname + '/build/index.html')
// })

// const server = http.createServer(app);
// const io = socket(server);

// const users = {};

// const socketToRoom = {};

// io.on('connection', socket => {
//     socket.on("join room", roomID => {
//         if (users[roomID]) {
//             const length = users[roomID].length;
//             if (length === 4) {
//                 socket.emit("room full");
//                 return;
//             }
//             users[roomID].push(socket.id);
//         } else {
//             users[roomID] = [socket.id];
//         }
//         socketToRoom[socket.id] = roomID;
//         const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

//         socket.emit("all users", usersInThisRoom);
//     });

//     socket.on("sending signal", payload => {
//         io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
//     });

//     socket.on("returning signal", payload => {
//         io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
//     });

//     const disconnectPeer = (socketId) => socket.broadcast.emit('peer-disconnected', {
//         socketId: socketId
//     })

//     socket.on('disconnect', () => {
//         const roomID = socketToRoom[socket.id];
//         let room = users[roomID];
//         if (room) {
//             room = room.filter(id => id !== socket.id);
//             users[roomID] = room;
//             disconnectPeer(socket.id)
//         }
//     });

// });

// server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));

const express = require("express");
const http = require("http");
const app = express();
const socket = require("socket.io");


app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/build/index.html')
})


const server = http.createServer(app);
const io = socket(server);

const rooms = {};

io.on("connection", socket => {
    socket.on("join room", roomID => {
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});


server.listen(8000, () => console.log('server is running on port 8000'));