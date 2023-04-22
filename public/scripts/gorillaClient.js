
var socket = new WebSocket(`ws://${location.host}${location.pathname}`);
socket.onopen = (e) => {
    console.log('new connection!' + e);
}

socket.onmessage = (e) => {
    
    const b = new Blob([e.data], { type: "image/png" });
    const u = URL.createObjectURL(b);

    document.getElementById('back').src = u;

    console.log('new message!' + document.getElementsByTagName('body')[0].style.backgroundImage);
}

var message = document.getElementById('message');

document.getElementsByTagName('body')[0].addEventListener('keydown', (e)=>{
    console.log(e.key);
    socket.send("keydown "+e.key);
})


