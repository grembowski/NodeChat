http = require('http');
url = require('url');
path = require('path');
fs = require('fs');
io = require('socket.io');

webServ = http.createServer(function(req, res){
	var uri = url.parse(req.url).pathname;
	var abspath = path.join(process.cwd(), uri);

	if(req.url == '/'){
	    abspath += 'index.html';
	}

	path.exists(abspath, function(exists){
		if(!exists){
		    res.writeHead(404, {"Content-Type":"text/html"});
		    res.write('<html><body>404</body></html>');
		    res.end('');
		    return;
		}

		fs.readFile(abspath, "binary", function(err, file){
			res.writeHead(200, {"Content-Type":"text/html"});
			res.write(file, "binary");
			res.end('');
		    });
	    });
	
    });

webServ.listen(8000);

var clients = [];
function userData(ip, socket) {
    this.socket = socket;
    this.nick = "";
    this.uid = ip;
    this.ip = ip;
    this.channels = {};
}

function chanData() {
}

var socket = io.listen(webServ);

var privmsg = function() {
    console.log("PRIVATE MESSAGE!!");
};

var who = function(){
    console.log("WHO!");
}

var nick = function(userdata, nick){

    console.log(userdata.nick + " nick changed to " + nick);
    userdata.nick = nick;
}

var nocommand = function(){
    console.log("Not a recognized command");
};


socket.sockets.on('connection', function(client){
	console.log("connection works!");
	var address = client.handshake.address; // Get client ip address and port.
	var thisuser = new userData(address.address, client);

	clients.push(thisuser);

	client.on('data', function(data){
	
		var words = data.split(' ');
		
		switch(words[1]){
		case "INIT":
		    console.log("INIT connection with client: "+address.address+":"+address.port); // Log client ip and port.
		    var uid = address.address+address.port; // Some sort of ip/port combo unique id <--- Replace with better identifier????
		    client.send('#cs455 ' + uid); // Assign and send unique user id to client for identification later.
		    break;
		case "PRIVMSG":
		    privmsg();
		    break;
		case "WHO":
		    who();
		    break;
		case "NICK":
		    nick(thisuser, words[2]);
		    break;
		case "JOIN":
		case "PART":
		case "MODE":
		case "TOPIC":
		case "LIST":
		case "INVITE":
		case "KICK":
		case "BAN":
		default:
		    nocommand();
		}
	
	    });
	

    });


