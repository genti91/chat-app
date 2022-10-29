require('dotenv').config();
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

const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    socket.on("join room", roomID => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    const disconnectPeer = (socketId) => socket.broadcast.emit('peer-disconnected', {
        socketId: socketId
    })

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            disconnectPeer(socket.id)
        }
    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));


