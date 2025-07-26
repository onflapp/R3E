var express = require('express');
var app = express();

app.get('/*', function (req, res) {
  console.log(req.method);
  console.log(req.path);
  res.send('hello');
});

app.post('/*', function (req, res) {
  req.on('data', function(chunk) { 
    console.log(chunk);
  });
  req.on('end', function() {
    res.send('hello');
  });
});

//start the server and listen
app.listen(3000, function () {
  console.log('http://localhost:3000');
});
