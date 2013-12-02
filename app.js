
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var geocoder = require('geocoder');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://uxtools:uxtools@ds053728.mongolab.com:53728/heroku_app19991968');


var mongodb = require("mongojs").connect('mongodb://uxtools:uxtools@ds053728.mongolab.com:53728/heroku_app19991968', ['companyitem']);

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 5000);
// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var user_id = 0;
//socket io
io.on('connection', function (socket) {
  socket.emit('user_id', user_id++);
  
/*
  socket.on('submitdata', function (user_data) {
    	addToDatabase(user_data);
  });
*/
  
  socket.on('submititem', function (user_data) {
  		//add item on socket.io push
    	addItem(user_data);
  });

  
});



app.get('/', routes.index(db));
app.get('/company', routes.companylist(db));
//app.get('/helloworld', routes.helloworld);
//app.get('/users', user.list);
app.get('/userlist', routes.userlist(db));
app.get('/adddata', routes.adddata(db));
app.get('/company/:id', routes.company(db));
app.post('/pulldata', routes.pulldata(db));
app.post('/dosearch', routes.dosearch(db));
// add user

//app.get('/newuser', routes.newuser);
app.post('/addcompany', routes.addcompany(db));
app.post('/company/:id', routes.company(db));
app.post('/adddata', routes.pushdata(db))
//geolocation

app.post('/geosearch', routes.geosearch(geocoder));

function addToDatabase(data)
{
	   // Get our form values. These rely on the "name" attributes
        var userName = data.username;
        var userEmail = data.email;

        // Set our collection
        var collection = db.get('usercollection');

        // Submit to the DB
        collection.insert({
            "username" : userName,
            "email" : userEmail
        }, { safe : true}, function(err,doc) {
        	if (err) return;
	     	var data_id = doc._id;
	     	   
	        io.sockets.emit('user', { user_id : user_id, data_id: data_id, data: data });

	        
        });
}



// Export the model
//exports.model = monk[collection];

function addItem(data)
{
		//console.log(data);
	   // Get our form values. These rely on the "name" attributes

        
        //how do you set multiple tags (maybe the tab input box)
        var tagstring =  data.tags;
        if (tagstring != "")
        {
        var tag_array = tagstring.split(",");
		}
		else
		{
		var tag_array = [];
		}
        // Set our collection
        var collection = db.get('companyitem');
		//TODO: ADD DATE
		//TODO: ADD SOURCE (internal, external)
		//TODO: ADD TYPE (email, rfp, note, news)
        // Submit to the DB
        // Origination Location
        // Destination Location
        // Author
        collection.insert({
            "user" : "1",
            "title" : data.title,
            "content" : data.content,
            "company_id" : data.company_id,
            "tags" : tag_array,
            "author" : data.author,
            "source" : data.source,
            "type" : data.type,
            "origination" : data.origination,
            "start_position" : { "lat" : data.startLat, "lng" : data.startLng },
            "destination" : data.destination,
            "end_position" : { "lat" : data.endLat, "lng" : data.endLng },
            "content_date" : new Date(data.content_date)
            
        }, { safe : true}, function(err,doc) {
        	if (err) return;
	     	var data_id = doc._id;
	     	runReduce(); 
	        //io.sockets.emit('item', { user_id : user_id, data_id: data_id, data: data });
			
	        
        });
}


var period = 1;

function runReduce() {

	//TODO: need to add time start and time end to a WHERE
	//TODO: need to inline return
	//TODO: return top 5-10 results only
	//TODO: strip out non-essential tags
	//create today
	//create past week
	//create past month
	//create past year 
	
	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: "word_count_today", query: { content_date: {'$gte' : getLastDay() }}});
	
	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: "word_count_week", query: { content_date: {'$gte' : getLastWeek() }}});

	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: "word_count_month", query: { content_date: {'$gte' : getLastMonth() }}});

	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: "word_count_year", query: { content_date: {'$gte' : getLastYear() }}});

	
	
}

/*
function getLastDay(){
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return lastWeek;
}

function getLastWeek(){
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}

function getLastMonth(){
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth() -1 , today.getDate());
    return lastWeek;
}

function getLastYear(){
    var today = new Date();
    var lastWeek = new Date(today.getFullYear() - 1, today.getMonth() , today.getDate());
         return lastWeek;
}
*/


var mapFunction = function() { 

    var content = this.content;
   
    
    if (content) { 
        // quick lowercase to normalize per your requirements - DONE
        // STRIP TAGS - DONE
        // STRIP NUMBERS - ?
        // STRIP punctuation - DONE
        /*
        FROM STACKOVERFLOW
        replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"")
Doing the above still doesn't return the string as you have specified it. If you want to remove any extra spaces that were left over from removing crazy punctuation, then you are going to want to do something like
replace(/\s{2,}/g," ");
	*/

	        var clean = content.toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
	        var spaceclean = clean.replace(/\s{2,}/g," ");
	        var tags = ['is', 'the', 'to', 'of', 'in', 'as', 'a', 'it', 'am', 'or', 'and', 'because', 'are', 'was', 'by', 'at', 'for', 'with', 'more', 'on', 'said', 'be', 'here', 'its', 'that', 'an', 'have', 'about', 'from', 'their', 'than', 'will', 'even', 'has', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'percent', 'billion', 'million', 'us', 'new', 'since', 'according', 'yesterday', 'bank', 'new', 'york', 'mellon', 'bny', 'if', 'who', 'year', 'after', 'she', 'our', 'we', 'before', 'which', 'where', 'who', 'he', 'there', 'any', 'not', 'been'];
	        content = spaceclean.split(" ");
	        
	        for (var i = content.length - 1; i >= 0; i--) {
	            // might want to remove punctuation, etc. here
	            if (content[i] && tags.indexOf(content[i]) == -1) {      // make sure there's something
	               //get tf-idf value of word
	               var set_string = content[i];
	               emit(set_string, 1); // store a 1 for each word
				}
		}
    }
}

var reduceFunction = function( key, values ) {    
    var count = 0;    
    values.forEach(function(v) {            
        count +=v;    
    });
    return count;
}
/* TODO: SEARCH BY KEYWORD
   TODO: SEARCH BY MULTIPLE KEYWORD 
   TODO: MAP POSITION OF KEYWORDS ON GMAP   
*/

/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/
