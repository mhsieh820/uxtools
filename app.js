
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
//app.use(express.logger('dev'));
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


/*
var user_id = 0;
//socket io
io.on('connection', function (socket) {
  socket.emit('user_id', user_id++);
  
  socket.on('submitdata', function (user_data) {
    	addToDatabase(user_data);
  });

  
  socket.on('submititem', function (user_data) {
  		//add item on socket.io push
    	addItem(user_data);
  });

  
});
*/

app.get('/', routes.index(db));
app.get('/company', routes.companylist(db));
app.get('/userlist', routes.userlist(db));
app.get('/adddata', routes.adddata(db));
app.get('/company/:id', routes.company(db));

//post
app.post('/addcompany', routes.addcompany(db));
app.post('/company/:id', routes.company(db));
app.post('/adddata', routes.pushdata(db));
app.post('/pulldata', routes.pulldata(db));
app.post('/dosearch', routes.dosearch(db));

//geolocation
app.post('/geosearch', routes.geosearch(geocoder));

/*
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

*/


// Export the model
//exports.model = monk[collection];

/*
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

*/


/* TODO: SEARCH BY KEYWORD
   TODO: SEARCH BY MULTIPLE KEYWORD 
   TODO: MAP POSITION OF KEYWORDS ON GMAP   
*/

/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/
