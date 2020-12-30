var socket = io.connect();

function createRoom() {
    socket.emit('createRoom');
}

function joinRoom() {
    let roomid = document.getElementById('roomnameInp').value;
    if (!roomid) {
        alert('Enter valid room id');
        return;
    }
    socket.emit('checkRoomId', roomid);
}

socket.on('validRoomId', function (roomid){
    let form = document.getElementById('redirectForm');
    form.action = '/draw/' + roomid;
    form.submit();
    // window.location.replace('/draw/' + roomid);

    // window.location.href = '/draw/' + roomid;
});

socket.on('invalidRoomId', function (roomid){
    alert('Invalid room id');
    document.getElementById('roomnameInp').value = '';
});

socket.on('roomId', function(data) {
    alert(`Room id is ${data}`);
    document.getElementById('roomid').innerHTML = data; // To add url later
    let form = document.getElementById('redirectForm');
    form.action = '/draw/' + data;
    form.submit();
    // window.location.href = '/draw/' + data;
});

