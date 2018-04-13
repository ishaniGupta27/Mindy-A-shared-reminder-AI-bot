var restify=require("restify");
var builder=require("botbuilder");
var assert= require('assert');
var clients= require('restify-clients');
//we are creating a server using restify and it is listening !
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('%s listening to %s',server.name,server.url)
});
//This is where server is listening
server.post('/health_check_site',function(req,res,next){
    res.send(200);
    return next();
});

//Your bot's logic is hosted as a web service that receives messages from users through the Connector service, and your bot's replies are sent to the Connector using HTTPS POST.
//For connection we need the id & password.
var con = new builder.ChatConnector({ //chatconnector connects us to outside world{
    appId: process.env.MICROSOFT_APP_ID,
    appPassword:process.env.MICROSOFT_APP_PASSWORD
});


server.post('/api/messages/new', con.listen()); 

//The UniversalBot class forms the brains of your bot. It's responsible for managing all the conversations your bot has with a user. The ChatConnector class connects your bot to the Bot Framework Connector Service.
var bot = new builder.UniversalBot(con);

//dialogs are fundamental block to build conversation witht he user
bot.dialog('/',function(session){

	//You use the session.send method to send messages in response to a message from the user.
        console.log(session.message);
	session.send("Hello World");
});

//Server 1 acting as a client 
//var clients = require('restify-clients');
var assert= require('assert');
var cl1 = clients.createJsonClient('http://127.0.0.1:3979');
cl1.post('/health_check_site', function(err,req,res){
       //assert.ifError(err);
      console.log('%s %d','Connected',res.statusCode);
 });
