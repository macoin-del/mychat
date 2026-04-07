express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let messages = [];

function isAdmin(name) {
  if (!name) return false;
  const n = name.toLowerCase();
  return n.includes('abdulloh') || n.includes('абдуллох');
}

io.on('connection', (socket) => {
  let user = { name: '', admin: false };

  socket.emit('init', messages);

  socket.on('join', (name) => {
    user.name = name;
    user.admin = isAdmin(name);
    socket.emit('admin', user.admin);
  });

  socket.on('message', (data) => {
    const msg = {
      id: Date.now(),
      name: user.name,
      text: data.text || null,
      voice: data.voice || null,
      time: new Date().toLocaleTimeString(),
    };

    messages.push(msg);
    io.emit('message', msg);
  });

  socket.on('deleteMessage', (id) => {
    if (!user.admin) return;
    messages = messages.filter(m => m.id !== id);
    io.emit('deleteMessage', id);
  });

  socket.on('editMessage', ({ id, text }) => {
    if (!user.admin) return;
    const msg = messages.find(m => m.id === id);
    if (msg) msg.text = text;
    io.emit('editMessage', { id, text });
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
