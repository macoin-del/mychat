const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const ADMIN_NAME = "abdulloh";

let messages = [];
let users = {};

io.on("connection", (socket) => {
    let name = "user";

    socket.on("join", (userName) => {
        name = userName;
        users[socket.id] = name;

        io.emit("online users", Object.values(users));
    });

    socket.on("chat message", (msg) => {
        const data = {
            user: name,
            text: msg
        };

        messages.push(data);
        io.emit("chat message", data);
    });

    // 👑 KICK
    socket.on("kick user", (targetName) => {
        if (name !== ADMIN_NAME) return;

        for (let id in users) {
            if (users[id] === targetName) {
                io.to(id).emit("kicked");
                io.sockets.sockets.get(id)?.disconnect();
            }
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("online users", Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("running"));