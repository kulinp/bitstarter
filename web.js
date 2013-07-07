var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var indexBuffer = fs.readFileSync("index.html");
var stringResponse = indexBuffer.toString();
app.get('/', function(request, response) {
  response.send(stringResponse);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
