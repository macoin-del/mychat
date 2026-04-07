const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const ADMIN_NAME = "admin";

io.on("connection", (socket) => {
    let userName = "user";

    socket.on("set name", (name) => {
        userName = name;
    });

    socket.on("chat message", (msg) => {
        io.emit("chat message", {
            user: userName,
            text: msg
        });
    });

    socket.on("admin msg", (data) => {
        if (userName === ADMIN_NAME) {
            io.emit("chat message", {
                user: "👑 ADMIN",
                text: data
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("running"));