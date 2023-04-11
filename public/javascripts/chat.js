var socket = io.connect('http://localhost:4000');

var message = document.getElementById('message'),
btn = document.getElementById('send');

socket.on('chat', (data) => {
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

