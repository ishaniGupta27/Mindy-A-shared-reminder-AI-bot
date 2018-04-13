var restify=require("restify");
var builder=require("botbuilder");
var assert= require('assert');
//var clients= require('restify-clients');
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

//Initialize store
var store = require('data-store')('reminders');
//store.del('a');
store.set('user_map',{'1234':'abhay','127863':'ishani'});

//The UniversalBot class forms the brains of your bot. It's responsible for managing all the conversations your bot has with a user. The ChatConnector class connects your bot to the Bot Framework Connector Service.
var bot = new builder.UniversalBot(con);

//dialogs are fundamental block to build conversation witht he user
bot.dialog('/',[
//You use the session.send method to send messages in response to a message from the user.
    function (session,args,next){
        var userId = session.message.user.id;
	var user_map = store.get('user_map');
	if(!user_map.hasOwnProperty(userId)){
	   builder.Prompts.text(session, "Hi, What is your cool nickname ?");
	}else{
		next();
	}
       // builder.Prompts.text(session, "Hi, Who do you want to send the reminder ?");
        //session.beginDialog('Hi, Who do you want to send the reminder ?');
        //builder.Prompts.text(session,"Hi, Who do you want to send the reminder ?");
    },
    function(session,results){
      if(results.response){
	 var userId= session.message.user.id; 
         var user_map = store.get('user_map');
	 user_map[userId] = results.response;
	 store.set('user_map',user_map);
	 builder.Prompts.text(session, "Cool, Who do you want to send the reminder ?");
      }else{
          builder.Prompts.text(session, "Hi, Who do you want to send the reminder ?");
      }
    },
    function (session, results){
        session.dialogData.receiver= results.response;
        builder.Prompts.text(session, "What is the reminder you want to send ?");
        //session.beginDialog('What is the reminder you want to send ?');
    },
    function (session, results) {

	session.dialogData.task = results.response;
        session.say('Reminder Sent','Reminder Sent');
	session.send('Reminder Sent !');
        var reminder_obj = {'task':session.dialogData.task,'receiver':session.dialogData.receiver};
        var user_map = store.get('user_map');
        var user_id = null;
        for (var key in user_map) {
            if (user_map.hasOwnProperty(key) && user_map[key] === session.dialogData.receiver) {
                user_id = key;
                break;
            }
        }
        if(user_id != null){
            var user_reminders = []
            if(store.has(user_id)){
                user_reminders = store.get(user_id);
            }
            reminder_obj.receiver = user_id;
            reminder_obj.created_by = session.message.user.id;
            user_reminders.push(reminder_obj);
            store.set(user_id,user_reminders);
            //Set reminders, yay!
        }
        console.log(store.get());//Log everything in store
    },

]);

//Server 1 acting as a client 
//var clients = require('restify-clients');
//var assert= require('assert');
/*var cl1 = clients.createJsonClient('http://127.0.0.1:3979');
cl1.post('/health_check_site', function(err,req,res){
       //assert.ifError(err);
      console.log('%s %d','Connected',res.statusCode);
 });
 */


