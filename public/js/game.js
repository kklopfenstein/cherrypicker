var socket = io.connect('/');
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});


// canvas

var gameCanvas;
var bContext;

var cherryRed = '#CC3300';
var black = '#000';

var cherryRadius = 25;

function init() {
  gameCanvas = document.getElementById('GameCanvas');
  bContext = gameCanvas.getContext('2d');
  gameCanvas.addEventListener('click', gameOnClick, false);
  gameCanvas.width = $(window).width();
  gameCanvas.height = $(window).height(); 
  // bContext.fillRect(50, 25, 150, 100);
}

function drawCherry(x, y, radius) {
  if (radius === undefined) {
    radius = cherryRadius;
  }

  bContext.beginPath();
  bContext.arc(x, y, radius, 0, Math.PI * 2, false);
  bContext.closePath();

  bContext.strokeStyle = black;
  bContext.stroke();
  bContext.fillStyle = cherryRed;
  bContext.fill();
}

function gameOnClick(e) {
  var pos = getCursorPosition(e);

  console.log("game click at " + pos.x + "," + pos.y);

  drawCherry(pos.x, pos.y);
}

function getCursorPosition(e) {
  var x;
  var y;
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + 
      document.documentElement.scrollTop;
  }

  x -= gameCanvas.offsetLeft;
  y -= gameCanvas.offsetTop;

  return { x: x, y: y }
}

$(function() {
  init();
});

