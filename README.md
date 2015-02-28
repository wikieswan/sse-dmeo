# sse-dmeo
sse 简单的例子

##1 SSE 是什么

SSE 是 HTML5 的 Server-Sent Events缩写，服务器端发送的事件。网页自动获取服务器端的数据更新。
之前网页获取服务器端更新的数据是需要先想服务器发送情况，确定是否有数据变更，然后获取，而SSE是服务器
一旦有数据更新就主动向网页发送数据。

浏览器支持

	API		Chrome 	IE 	Firefox 	Safari 	Opera				
	SSE		6.0 	No 	6.0 		5.0 	1.5

##2 关键js对象 EventSource

EventSource接口用来管理服务器发送事件.你可以通过将EventSource对象的onmessage属性指向一个自定义方法来处理那些从服务器接受到的无类型的消息(也就是,没有event字段的消息).你还可以使用addEventListener()方法来监听其他指定了事件类型的消息.

##3 一个简单的例子

我们用一个简单的 SSE demo来介绍SSE的使用，因为我们是前端工程师，所以服务器端我们就用node来实现(ps:其他语言也可以的，只要你愿意)。

### 项目文件结构

	SSE
		node_modules
		public
			index.html
		server.js
		package.json

### 前端代码 index.html

	<!doctype html>
	<html>
		<head>
			<meta charset="UTF-8">
			<title>SSE demo</title>
		</head>
		<body>
			<pre id="x">Intializing....</pre>

		<script src="http://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
		</body>
	</html>

	<script type="text/javascript">
	$(function() {
		var es = new EventSource('http://127.0.0.1:8000/sseApi');
		es.addEventListener('message',function(e){
			$('#x').html('\n'+e.data+'\n')
		},false);
	})
	</script>

EventSource 的参数就是服务器端提供数据的接口，创建对象es，当有数据向服务器端发送的时候，es的onmessage会触发，在回调函数中
e 指的是服务器发送的对象，我们关心的是里面的数据对象，所以用 e.data接受数据。

### 后端代码  server.js

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

在计时器函数中，每秒向客户端发送服务器当前时间戳。需要注意的是```var b = res.write(content);```之后并没有出现```res.end();```，而是在关闭连接的时候才出现。当客户端和服务器建立连接之后，直到客户端主动断开连接，否则一直保持连接。
关闭连接的方式是用户离开当前页面，比如关闭页面、跳转到其他页面等。

注意1

	var content = 'data:' + new Date().toISOString() + '\n\n';

以```'\n\n'```结尾是SSE协议方式。

注意2

	res.writeHead(200,{'Content-Type':'text/event-stream'})

发送事件的服务器脚本必须以 ```text/event-stream```作为相应头.每一条消息都以一对换行符作为结尾.

参考 [MDN](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events):
Sending events from the server
The server-side script that sends events needs to respond using the MIME type text/event-stream. Each notification is sent as a block of text terminated by a pair of newlines. For details on the format of the event stream, see Event stream format.



### 项目配置代码 package.json

	{
	  "name": "SSE",
	  "version": "1.0.0",
	  "description": "",
	  "main": "index.js",
	  "scripts": {
	    "test": "echo \"Error: no test specified\" && exit 1"
	  },
	  "author": "",
	  "license": "ISC",
	  "devDependencies": {
	    "express": "^4.12.0"
	  }
	}

当代码完成之后，在浏览器值输入 ```http://127.0.0.1:8000/index.html``` ，就可以发现页面的数据1s变化一次,用F12查看浏览器控制台,
可以发现有一个接口 sseApi 一直在和服务器保持连接.
