var socket = io.connect('/');
var myId = -1;

var state = 0;
var pieces;

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});

socket.on('success', function (data) {
  console.log('success=' + data.success);
});

/*socket.on('send id', function (data) {
  myId = data.id;
  console.log('client id=' + myId);
});*/

socket.on('pieces', function (data) {
  console.log('found pieces...');
  console.log(data);
  pieces = data; 
  clearBoard();
  drawPieces();
});
// canvas

var gameCanvas;
var bContext;

var cherryRed = '#CC3300';
var myRed = '#800000';
var black = '#000';

var cherryRadius = 10;
var dt = new Date();
var rps = 1;

function init() {
  gameCanvas = document.getElementById('GameCanvas');
  bContext = gameCanvas.getContext('2d');
  gameCanvas.addEventListener('click', gameOnClick, false);
  gameCanvas.width = 640;
  gameCanvas.height = 480; 
  // bContext.fillRect(50, 25, 150, 100);
  $('#NameModal').modal({keyboard: false, show: true});
  socket.emit('get id', { });
  $('#StartBtn').on('click', sendName);
}

function clearBoard() {
  console.log('clearing canvas');
  bContext.clearRect(0,0,gameCanvas.width,gameCanvas.height);
}

function sendCollisions(collisions) {
  console.log('sending collisions');
  socket.emit('clear pos', collisions);
}

function sendName() {
  var name = $('#UserNameField').val();
  if (name !== undefined && name.length > 5) {
    socket.emit('identify', name, function(data) {
      if (data !== undefined && data) {
        $('#NameModal').modal('hide');
        myId = name;
      } else {
        $('#ErrorMsg').html('Username already taken');
      }
    });
  } else {
    $('#ErrorMsg').html('Invalid user name'); 
  }
}

function drawCherry(x, y, radius, ownCherry) {
  if (radius === undefined) {
    radius = cherryRadius;
  }

  bContext.beginPath();
  bContext.arc(x, y, radius, 0, Math.PI * 2, false);
  bContext.closePath();

  bContext.strokeStyle = black;
  bContext.stroke();
  bContext.fillStyle = ownCherry !== undefined && ownCherry ? myRed : cherryRed;
  bContext.fill();

}

function gameOnClick(e) {
  var pos = getCursorPosition(e);

  var collisions = getCollidedPieces(pos.x, pos.y);
  if (collisions.length == 0) {
    console.log("game click at " + pos.x + "," + pos.y);

    socket.emit('add piece', { x: pos.x, y: pos.y, id: myId });
 
    drawCherry(pos.x, pos.y, null, true);
  } else {
    sendCollisions(collisions);
  }
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

function getPieces() {
  socket.emit('get pieces', { });
}

function drawPieces() {
  console.log('drawing pieces');
  doForEachPiece(function(p) {
    if (p.x !== undefined && p.y !== undefined) {
      drawCherry(p.x, p.y, cherryRadius, p.id == myId);
    }
  });
}

function getCollidedPieces(x, y) {
  collisions = new Array();
  doForEachPiece(function(p) {
    if (p.x !== undefined && p.y !== undefined) {
      maxX = p.x + cherryRadius;
      minX = p.x - cherryRadius;
      maxY = p.y + cherryRadius;
      minY = p.y - cherryRadius;
      if ((maxX >= x && minX <= x) && (maxY >= y && minY <= y)) {
        collisions.push({x: p.x, y: p.y});
        console.log('collision at ' + p.x + ',' + p.y);
      }
    }
  });
  return collisions;
}

function doForEachPiece(f) {
  if (pieces !== undefined) {
    for (var pieceX in pieces) {
      if (pieces.hasOwnProperty(pieceX)) {
        for (var pieceY in pieces[pieceX]) {
          if (pieces[pieceX].hasOwnProperty(pieceY)) {
            p = pieces[pieceX][pieceY];
            f(p);
          }
        }
      }
    }
  } else {
    console.log('no pieces!');
  }
}

function updateBoard() {
  console.log("updating board");
  reqInProgress = true;
  getPieces();
}

function doLoop() {
  var cd = new Date(); //current date
  if ((cd.getTime() - dt.getTime()) >= 1000) {
    console.log('updating board');
    dt = cd;
    updateBoard();
  }
}

function gameLoop() {
  if (state == 1)
    doLoop();
    requestAnimationFrame(gameLoop);
}

$(function() {
  init();
  state = 1;
  requestAnimationFrame(gameLoop);
});

