const app = require('express')();
const cors = require('cors');
const io = require('socket.io').listen(8080);
const SerialPort = require('serialport');
const pug = require('pug');

app.use(cors());

const index = pug.compileFile('index.pug');

app.get('/', (req, res) => {
  res.send(index({
    socketIoUrl: ':8080',
    backgroundColor: req.query.backgroundColor || 'black',
    fontColor: req.query.fontColor || 'red',
    font: req.query.font || 'FreeMono',
    fontSize: req.query.fontSize || '70vh',
    fontWeight: req.query.fontWeight || 'bold',
  }));
});

const server = app.listen(80, () => console.log('HTTP server is running on http://localhost'));

const port = new SerialPort("/dev/ttyUSB0", {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
});

const parser = new SerialPort.parsers.Delimiter({
  includeDelimiter: true,
  delimiter: '<E>',
});

port.pipe(parser);

parser.on('data', (data) => {
  const frame = data.toString().replace(/\s/g, '');
  const timeFrameMatch = frame.match(/<ID\d{2}><\d{2}:(\d{2}):(\d{2})\d{2}><E>/);

  if (!timeFrameMatch) {
    return;
  }

  const [, minutes, seconds] = timeFrameMatch;
  console.log('Time =', minutes + ':' + seconds);

  io.emit('time', {
    minutes,
    seconds,
  });
});

const sockets = [];

io.sockets.on('connection', function(socket) {
  sockets.push(socket);

  socket.once('close', function () {
    sockets.splice(sockets.indexOf(socket), 1);
  });
});

function exit(...params) {
  if (params.length > 0) {
    console.log(...params);
  }

  server.close();
  io.close();
  port.close();
  console.log('Cleaned');
  process.exit(0);
}

process.on('SIGINT', exit);
process.on('SIGUSR1', exit);
process.on('SIGUSR2', exit);
process.on('uncaughtException', exit);
process.on('unhandledRejection', exit);
