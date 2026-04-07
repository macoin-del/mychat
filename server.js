const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const ADMIN = "admin";
let messages = [];
let bannedUsers = [];

io.on("connection", (socket) => {
    let user = "user";
    let room = "main";

    socket.on("join", (data) => {
        user = data.name;
        room = data.room;

        socket.join(room);

        socket.emit("load messages", messages);
    });

    socket.on("chat message", (msg) => {
        if (bannedUsers.includes(user)) return;

        const data = {
            user,
            text: msg,
            room
        };

        messages.push(data);

        io.to(room).emit("chat message", data);
    });

    socket.on("admin ban", (name) => {
        if (user === ADMIN) {
            bannedUsers.push(name);
        }
    });

    socket.on("admin clear", () => {
        if (user === ADMIN) {
            messages = [];
            io.emit("chat message", { user: "system", text: "chat cleared" });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("running"));