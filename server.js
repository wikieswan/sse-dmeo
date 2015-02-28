var express = require('express');
var app = express();
var http = require('http');

app.use(express.static(__dirname + '/public'));

app.get('/sseApi', function(req, res){
	res.writeHead(200,{'Content-Type':'text/event-stream'})
	var timer = setInterval(function(){
		var content = 'data:' + 
			new Date().toISOString() + '\n\n';
		var b = res.write(content);
		if(!b){
			console.log("data queued (content="+content+")");
		}
		else{
			console.log("Flushed!(content="+content+")");
		}
	},1000);
	
	res.connection.on('close',function(){
		res.end();
		clearInterval(timer);
		console.log("Aborting");
	})
});

app.listen(8000);
console.log('server start at 8000');