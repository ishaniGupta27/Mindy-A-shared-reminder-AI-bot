var restify=require("restify");
var builder=require("botbuilder");

//we are creating a server using restify and it is listening !
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('%s listening to %s',server.name,server.url)
});

server.get("/health_check_site",function(req,res,next){
    res.send(200);
    return next();
});


//For connection we need the id & password.
var con = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword:process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', con.listen());

var bot = new builder.UniversalBot(con);

bot.dialog('/',function(session){

    session.send("Hello World");
});


