var mouse = {
    click: false,
    move: false,
    pos: { x: 0, y: 0 },
    pos_prev: false
};

var eraserOn = false;

var username;
var canvas = document.getElementById('drawing');
var context = canvas.getContext('2d');
var width = window.innerWidth * 0.5;
var height = window.innerHeight * 0.5;

document.getElementById('buttons-container').style.height = height+'px';

canvas.width = width;
canvas.height = height;

var strokeColor = 'red';
var socket = io.connect();

var roomId = document.getElementById('room_id').innerHTML;

socket.emit('joinRoom', roomId);

canvas.oncontextmenu = function(e) { 
    e.preventDefault(); 
    e.stopPropagation(); 
}

canvas.onmousedown = function(e) {
    if (e.button == 0)
        mouse.click = true;
}

canvas.onmouseup = function(e) {
    mouse.click = false;
}

canvas.onmousemove = function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.pos.x = (e.clientX - rect.left) / width;
    mouse.pos.y = (e.clientY - rect.top) / height;
    mouse.move = true;
    socket.emit('draw_cursor', { line: { x: mouse.pos.x, y: mouse.pos.y } });
    // alert(`${mouse.pos.x}, ${mouse.pos.y}`);
}

socket.on('draw_line', function(data) {
    var line = data.line;
    context.lineWidth = line.lineWidth;
    context.strokeStyle = line.color;
    if (!data.line.erase) {
        context.globalCompositeOperation = "source-over";
    } else {
        context.globalCompositeOperation = "destination-out";
    }
    console.log(line.start);
    context.beginPath();
    context.moveTo(line.start.x * width, line.start.y * height);
    context.lineTo(line.end.x * width, line.end.y * height);
    // context.moveTo(0 * width, 0 * height);
    // context.lineTo(0 * width, 0* height);
    // context.moveTo(0.5 * width, 0.5 * height);
    // context.lineTo(0.6 * width, 0.5 * height);
    context.stroke();
    context.strokeStyle = strokeColor;
});

socket.on('clear_canvas', function(data) {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('set_username', function(data) {
    username = data;
    console.log("username set ", username);
})


function mainLoop() {
    if (mouse.click && mouse.move && mouse.pos_prev) {
        var lineWidth = document.getElementById('strokeWidth').value;
        var strokeColor = document.getElementById('brushColor').value;
        socket.emit('draw_line', { line: { start: mouse.pos, end: mouse.pos_prev, color: strokeColor, lineWidth: lineWidth, erase: eraserOn } });
        mouse.move = false;
    }
    mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
}

setInterval(mainLoop, 25);


function clearCanvas() {
    socket.emit('clear_canvas', {});
}

function changeStrokeColor(color) {
    strokeColor = color;
    context.strokeStyle = color;
}

function toggleEraser() {
    eraserOn = !eraserOn;
    if (eraserOn) {
        document.getElementById('eraser').style.backgroundColor = 'green';
        document.getElementById('drawing').style['cursor'] = 'url("/images/eraser.png"), auto';
    } else {
        document.getElementById('eraser').style.backgroundColor = '';
        document.getElementById('drawing').style['cursor'] = 'url("/images/cursor.png"), auto';
    }
}



function getCursorElement(id) {
    var elementId = 'cursor-' + id;
    var element = document.getElementById(elementId);
    if (element == null) {
        element = document.createElement('span');
        element.id = elementId;
        element.className = 'cursor';
        document.getElementById('canvasDiv').appendChild(element);
    }
    return element;
}


socket.on('draw_cursor', function(data) {
    var rect = canvas.getBoundingClientRect();
    var el = getCursorElement(data.id);
    var color = data.color;
    console.log(color);
    console.log(data.line);
    el.style.left = (data.line.x * width + rect.left) + 'px';
    // el.style.left = (width) + 'px';
    // el.style.top = (height) + 'px';
    el.style.top = (data.line.y * height + rect.top) + 'px';
    el.style.borderColor = color;
    el.style.position = "absolute";
});