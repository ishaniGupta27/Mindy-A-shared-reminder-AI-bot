/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

console.log('1');
/* Connect to server
var io = require('socket.io-client');
var socket = io.connect('http://localhost:8183', {reconnect: true});

console.log('2');

// Add a connect listener
socket.on('connect', function(socket) { 
  console.log('Connected!');
});

console.log('3');
*/

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */
/*
var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
*/
// Create your bot with a function to receive messages from the user
var store = require('data-store')('reminders');
//store.del('a');
store.del({force: true});
store.set('user_map',{'1234':'abhay','127863':'ishani'});
/*
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to family reminder");
        builder.Prompts.text(session, "Let us confirm your identity. Who are you?");
    },
    function (session, results) {
    	console.log('+++++++++++++++');
    	console.log(session.message);
    	//var user_map = null;
    	if(store.has('user_map')){
        	var user_map = store.get('user_map');
        	var user_id = session.message.user.id;
        	user_map[user_id] = results.response;
        	store.set('user_map',user_map);
        	//Update user_map
        }
        session.dialogData.creator = session.message.user.id;//builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.text(session, "What is your reminder?");
    },
    function (session, results) {
        session.dialogData.reminder = results.response;
        builder.Prompts.text(session, "Who is it for?");
    },
    function (session, results) {
        session.dialogData.reminder_subject = results.response;
        // Process request and display reservation details
        //session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.send(`Reminder created. Reminder details: <br/>Creator: ${session.dialogData.creator} <br/>Task: ${session.dialogData.reminder} <br/>Reminder for: ${session.dialogData.reminder_subject}`);
        var reminder_obj = {'created_by':session.dialogData.creator,'created_for':session.dialogData.reminder_subject,'task':session.dialogData.reminder};
        //Get corresponding user_id and save it to their reminders
        var user_map = store.get('user_map');
        var user_id = null;
        for (var key in user_map) {
		    if (user_map.hasOwnProperty(key) && user_map[key] === session.dialogData.reminder_subject) {
		    	user_id = key;
		    	break;
		    }
		}
		if(user_id != null){
			var user_reminders = []
			if(store.has(user_id)){
				user_reminders = store.get(user_id);
			}
			reminder_obj.created_for = user_id;
			user_reminders.push(reminder_obj);
			store.set(user_id,user_reminders);
			//Set reminders, yay!
		}
		console.log(store.get());//Log everything in store
        session.endDialog();
    }
]);
*/

var bot = new builder.UniversalBot(connector);

bot.dialog('/',[
    function(session,results){
        session.send("Welcome!");
        builder.Prompts.text(session, "You can check/create reminders");
    },
    function(session,results){
      var res = results.response;
      if (res.includes('create'))
        session.beginDialog('create_reminder');
      else if (res.includes('check'))
        session.beginDialog('check_reminder');
    }

]);

bot.dialog('create_reminder',[
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
          //Lower case the nickname and remove period at the end.
          var user_name = results.response;
          user_name = user_name.toLowerCase();
          user_name = user_name.replace('.','');//Voice sometimes appends . at the end
          user_map[userId] = user_name;
          store.set('user_map',user_map);
          builder.Prompts.text(session, "Cool, Who do you want to send the reminder ?");
      }else{
          builder.Prompts.text(session, "Hi, Who do you want to send the reminder ?");
      }
    },
    function (session, results){
        //Parse the name again, lower case, remove periods.
        var user_name = results.response;
        user_name = user_name.toLowerCase();
        user_name = user_name.replace('.','');//Voice sometimes appends . at the end
        session.dialogData.receiver= user_name;
        builder.Prompts.text(session, "What is the reminder you want to send ?");
        //session.beginDialog('What is the reminder you want to send ?');
    },
    function (session, results) {
        session.dialogData.task = results.response;
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
        session.endDialog();
    },

]).triggerAction({
        matches: /^create$/i
});

bot.dialog('check_reminder',[
//You use the session.send method to send messages in response to a message from the user.
    function (session){
        builder.Prompts.text(session, "Do you want to check your shared reminders?");
        //session.beginDialog('Hi, Who do you want to send the reminder ?');
        //builder.Prompts.text(session,"Hi, Who do you want to send the reminder ?");
    },
    function (session,results){
        // See if it's YES or NO
        //session.dialogData.receiver= results.response;
        var user_map = store.get('user_map');
        user_id = session.message.user.id;
        console.log('User_id: %s', user_id );
        reminder_obj = store.get( user_id );
        console.log( '%s', reminder_obj );
        if (reminder_obj === undefined){
            session.say('You have no reminders set', 'You have no reminders set');
        }
        else {
            session.send(' You have '+reminder_obj.length+' reminders set ')
            /*
            for ( var i in reminder_obj ){
                var text_to_send = "Task "+(i+1) +": "+ reminder_obj[i].task + "<br>  Created by: " + user_map[reminder_obj[i].created_by];
                var text_to_speak = user_map[reminder_obj[i].created_by]+' wants to remind you to '+reminder_obj[i].task;
                session.say(text_to_send, text_to_speak);
                console.log('Task:  %s', reminder_obj[i].task );
            }*/

            var text_to_send = "Task 1: "+ reminder_obj[0].task + "<br/>  Created by: " + user_map[reminder_obj[0].created_by];
            var text_to_speak = user_map[reminder_obj[0].created_by]+' wants to remind you to '+reminder_obj[0].task;
            session.say(text_to_send, text_to_speak);
        }
        session.endDialog();  
    },  

]).triggerAction({
        matches: /^check$/i
});
