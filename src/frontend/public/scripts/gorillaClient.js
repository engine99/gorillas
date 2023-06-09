
$(function(){
var socket = new WebSocket(`ws://${location.host}${location.pathname}`);
socket.onopen = (e) => {
    console.log('new connection!' + e);
}

socket.onmessage = (e) => {
    
    const b = new Blob([e.data], { type: "image/png" });
    const u = URL.createObjectURL(b);

    document.getElementById('theimg').src = u;

    console.log('new message!' + document.getElementsByTagName('body')[0].style.backgroundImage);
}

var message = document.getElementById('message');

$('body').on("keydown", (e)=>{
    console.log(e.key);

    if (e.key.match(/(Backspace|Enter|^[\w. ]$)/)) {
        socket.send("keydown:"+e.key+":");
    } else {
        console.log("illegal key" + e.key)
    }
})

$('body').on('touchstart', (e)=>{
    
    document.getElementById('theinput').focus();
})

$('#theimg').on("contextmenu", (e) => {
    e.preventDefault();
});

});

