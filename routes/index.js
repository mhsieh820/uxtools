var mongo = require('mongodb');
var mongodb = require("mongojs").connect('mongodb://uxtools:uxtools@ds053728.mongolab.com:53728/heroku_app19991968', ['companyitem']);


/*
 * GET home page.
 */
 exports.index = function(db) {

	return function(req, res){
	//get company list
	var collection = db.get('companycollection');
	 collection.find({},{},function(e,docs){
	 		//console.log(render_business(docs));
	 
            res.render('login', {
                "companylist" : render_business(docs)
            });
        });
	}
  //res.render('index', { title: 'Express' });
};

function render_business(docs)
{
	var companies = [];
	//console.log(docs);
	for (var key in docs) {
		//console.log(docs[key]);
		var el = docs[key];
		if (companies[el.name] == undefined)
		{
		companies[el.name] = new Array();
		}
		//push to existing json
		companies[el.name].push({'_id': el._id, 'lineofbusiness' : el.lineofbusiness});
	}

	return companies;

}


exports.companylist = function(db) {

	return function(req, res){
	//get company list
	var collection = db.get('companycollection');
	 collection.find({},{},function(e,docs){
            res.render('companylist', {
                "companylist" : render_business(docs)
            });
        });
	}
  //res.render('index', { title: 'Express' });
};

exports.adddata = function(db) {

	return function(req, res){
	//get company list
		 var companycollection = db.get('companycollection');
		 companycollection.find({},{},function(e,docs){
		 
		 		res.render('adddata', {
			 			companylist: render_business(docs)
			 		}
		 		);
         });

	
         
	}
  //res.render('index', { title: 'Express' });
};

exports.pushdata = function(db) {
	
	return function(req, res){
	
		var data = req.body;
		addItem(data, db);
		
		var companycollection = db.get('companycollection');
		 companycollection.find({},{},function(e,docs){
		 
		 		res.render('adddata', {
			 			companylist: render_business(docs)
			 		}
		 		);
         });
	}
	
}

exports.addcompany = function(db)
{
	 return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var name = req.body.companyname;
		var lineofbusiness = req.body.lineofbusiness;
		var externalfilter = req.body.externalfilter;
		var internalfilter = req.body.internalfilter;
		
        // Set our collection
        var collection = db.get('companycollection');

        // Submit to the DB
        collection.insert({
            "name" : name,
            "lineofbusiness" : lineofbusiness,
            "externalfilter" : externalfilter,
            "internalfilter" : internalfilter
            
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, forward to success page
                res.redirect("/");
                // And set the header so the address bar doesn't still say /adduser
                //res.location("userlist");
            }
        });

    }


}

exports.geosearch = function (geocoder) {
	
	 return function(req, res) {
	 
	 	var place = req.body.place;
	 	

		// Geocoding
		geocoder.geocode(place, function ( err, data ) {
		  // do something with data
		  	if (err ) {
			  	
				res.send("ERROR WITH GEOCODING");  	
		  	}
		  	else {
		  	var address = data.results[0].formatted_address;
		  	var latlng = data.results[0].geometry.location;
		  	res.json({ "latlng" : latlng, 'address' : address});
		  	}
		  	
		});
	 	
	 
	 }
	
}


exports.company = function(db)
{
	 return function(req, res) {
		 var date_set = false;
		 if (req.body.startDate && req.body.endDate)
		 {
			 date_set = true;
		 }
		 
		 var current_company = req.params.id;
		 //console.log(current_company);

		 //get the elements within the company
		 var collection = db.get('companyitem');
		 var word_count = db.get('word_count_today');
		
		 var external_content = "";
		 var companylist = "";
		 var response = "";
		 var latlng = {};
         var linkmap = [];
         var endlatlng = {};
         var start_line = "";
        collection.find({}, {}, function(e, articles) {
	         
	    for (var i = 0; i < articles.length; i++) {
		if (typeof(articles[i].start_position) != "undefined")
		{
		 	var lat = articles[i].start_position.lat;
		 	var lng = articles[i].start_position.lng;
		 	start_line = "new google.maps.LatLng(" + lat + "," + lng + ")";
			latlng[articles[i]._id] = start_line;
		
		
		if (typeof(articles[i].end_position) != "undefined")
		 {
			 var endlat = articles[i].end_position.lat;
			 var endlng = articles[i].end_position.lng;
			 
			 if (endlat != "" && endlng != "")
			 {
			 var end_line = "new google.maps.LatLng(" + endlat + "," + endlng + ")";
			 //latlng.push(end_line);
			 endlatlng[articles[i]._id] = end_line;
	 		 linkmap.push("[" + start_line + "," + end_line+ "]");
	 		 }
		 }
		 }
		
		}
			//nest
			 word_count.find({}, { limit: 10, sort: { value : -1 }}, function(e, words) {
			response = words;
			//nest
			var companycollection = db.get('companycollection');
			companycollection.find({},{ limit: 100 },function(e,docs){
           		companylist = docs;
         
		   			//nest
		   			
		   		collection.find({ source: "external" },{
			 	sort: { content_date: -1 }
			 	},function(e,docs){
			 			external_content = docs;
			 			//nest
			 			 collection.find({ source: "internal" },{
				 		sort: { content_date: -1 }
			 
		 	},function(e,docs){
		 			//console.log(linkmap);
		 	
		            res.render('company', {
		            	"path" : req.path,
		            	"current_company" : current_company,
		            	"companylist" : render_business(companylist),
		            	"company_id" : req.params.id,
		            	"linkmap" : linkmap,
		            	"latlng" : latlng,
		            	"endlatlng" : endlatlng,
		                "internal" : parse_text(docs),
		                "external" : parse_text(external_content),
		                "word_count" : response
					});
				});

	 		});
   			
   		});
 
	});	
     
});
	
				 	 
	 }
}

exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('userlist', {
                "userlist" : docs
            });
        });
    };
};

exports.dosearch = function (db)
{
	

	return function(req, res) {
		var latlng = {};
		var endlatlng = {};
		var linkmap = [];
		var word = req.body.searchword;
		var source = req.body.source;
		/*
var collection = db.get('companyitem');
		collection.find({}, {}, function(e, articles) {
			
			res.json({ articles: articles })
			
		});
*/
		var collection = db.get('companyitem');
		if (source != 'both')
		{
		
		
		var searchparams = { source: source, content : { $regex : ".*" + word + ".*", $options : "i" }};
		}
		else
		{
		var searchparams = { content : { $regex : ".*" + word + ".*", $options : "i" }};	
		}
		
		collection.find(searchparams, function(err, articles) {

		// No error
		if(!err) {
			// Render the view
			
		for (var i = 0; i < articles.length; i++) {
		if (typeof(articles[i].start_position) != "undefined")
		{
		 	var lat = articles[i].start_position.lat;
		 	var lng = articles[i].start_position.lng;
		 	start_line = "new google.maps.LatLng(" + lat + "," + lng + ")";
			latlng[articles[i]._id] = start_line;
		
		
		if (typeof(articles[i].end_position) != "undefined")
		 {
			 var endlat = articles[i].end_position.lat;
			 var endlng = articles[i].end_position.lng;
			 if (endlat != "" && endlng != "") {
			 var end_line = "new google.maps.LatLng(" + endlat + "," + endlng + ")";
			 //latlng.push(end_line);
			 endlatlng[articles[i]._id] = end_line;
	 		 linkmap.push("[" + start_line + "," + end_line+ "]");
	 		 }
		 }
		 }
		
		}
			
			res.render('ajaxmap', {
				"linkmap" : linkmap,
		        "latlng" : latlng,
		        "endlatlng" : endlatlng,	
			}, function (err, ajaxmap)
			{
				var internal_articles = [];
				var external_articles = [];
				//nest
				for (var i = 0; i < articles.length; i++)
				{
					if (articles[i].source == 'internal')
					{
						internal_articles.push(articles[i]);
					}
					else
					{
						external_articles.push(articles[i]);
					}
					
				}
				
				 res.render('ajaxnews', {
			    	"articles" : parse_text(internal_articles),
					}, function (err, internal) {
					 res.render('ajaxnews', {
			    	"articles" : parse_text(external_articles),
					}, function (err, external) {
					
					var response = { internal : internal, external : external, map: ajaxmap }
					res.send(response);
					});
				});
			});	
			   
					
		}
		
		// Error
		else {
			req.flash("error", "Error searching!");
			res.redirect("back");
		}
		});
		
	}
}

exports.pulldata = function (db)
{
	return function(req, res) {
		var latlng = {};
		var endlatlng = {};
		var linkmap = [];
	
		var type = req.body.dateselection;
		var daterange = "";
		if (type == 'today')
		{
    	var word_count = db.get('word_count_today');
    	daterange = getLastDay();
    	}
    	else if (type == 'week')
    	{
	    var word_count = db.get('word_count_week');
	    daterange = getLastWeek();
	
    	}
    	else if (type == 'month')
    	{
	    var word_count = db.get('word_count_month');
		daterange = getLastMonth();
    	}
    	else if (type == 'year')
    	{
	    var word_count = db.get('word_count_year');
		daterange = getLastYear();
    	}
    	
    	var articles = get_articles(daterange, db, res);
		var collection = db.get('companyitem');
		collection.find({ content_date: { "$gte" : daterange } }, {}, function(e, articles) {
	         
	    for (var i = 0; i < articles.length; i++) {
		if (typeof(articles[i].start_position) != "undefined")
		{
		 	var lat = articles[i].start_position.lat;
		 	var lng = articles[i].start_position.lng;
		 	start_line = "new google.maps.LatLng(" + lat + "," + lng + ")";
			latlng[articles[i]._id] = start_line;
		
		//only have end if have beginning
		if (typeof(articles[i].end_position) != "undefined")
		 {
			 var endlat = articles[i].end_position.lat;
			 var endlng = articles[i].end_position.lng;
			 if (endlat != "" && endlng != ""){
			 var end_line = "new google.maps.LatLng(" + endlat + "," + endlng + ")";
			 //latlng.push(end_line);
			 endlatlng[articles[i]._id] = end_line;
	 		 linkmap.push("[" + start_line + "," + end_line+ "]");
	 		 }
		 }
		 
		 }
		
		}
		
			res.render('ajaxmap', {
				"linkmap" : linkmap,
		        "latlng" : latlng,
		        "endlatlng" : endlatlng,	
			}, function (err, ajaxmap)
			{
				//nest
			word_count.find({},{ limit: 10, sort: { value : -1 } },function(e,words){
			
			var internal_articles = [];
				var external_articles = [];
				//nest
				for (var i = 0; i < articles.length; i++)
				{
					if (articles[i].source == 'internal')
					{
						internal_articles.push(articles[i]);
					}
					else
					{
						external_articles.push(articles[i]);
					}
					
				}
				
				 res.render('ajaxnews', {
			    	"articles" : parse_text(internal_articles),
					}, function (err, internal) {
					 res.render('ajaxnews', {
			    	"articles" : parse_text(external_articles),
					}, function (err, external) {
			
			            res.render('ajaxlist', {
			                "word_count" : words
			            }, function (err, html) {
				            var response = { internal : internal, external: external, list : html, map: ajaxmap }
				            res.send(response);
				            });
	            });
            });
        });
        
     });
		
		});	
	};
}



function parse_text(articles)
{
	if (articles.length != 0) {
	for (var i = 0; i < articles.length; i++) {

		 var excerpt = articles[i].content.substring(0, 250);	
		 var fixdate = new Date(articles[i].content_date);
		 
		 //console.log(excerpt);	
		articles[i].excerpt = excerpt;
		articles[i].content_date = (fixdate.getMonth() + 1) + "/" + (fixdate.getDate()+ 1) + "/" + fixdate.getFullYear();	
	}
		return articles;
	}
	else
	{
		var arr = [];
		return arr;
	}
}

function get_articles(daterange, db, res)
{
	var collection = db.get('companyitem');
	var response = {};
	//console.log(daterange);
	collection.find({ source: "external", content_date: { "$gte" : daterange } },{
			 	sort: { content_date: -1 }
			 
		 	},function(e,docs){
			 	res.render('ajaxnews', {
                "articles" : parse_text(docs),
            }, function(err, html) {
            	
            	response.external = html;
				collection.find({ source: "internal", content_date: { "$gte" : daterange } },{
				sort: { content_date: -1 }
			 
		 	},function(e,docs){
		 
		 
            res.render('ajaxnews', {
                "articles" : parse_text(docs),
            }, function (err, html) {
	            
	            	response.internal = html;
	            	return response;

				});
			});
        });
	});
}
	
var period = 1;

function addItem(data, db)
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
        var insert_date = "";
        if (data.content_date == "")
        {
	        insert_date = normalizeDate(new Date());
        }
        else
        {
	        insert_date = normalizeDate(new Date(data.content_date));
        }
        
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
            "content_date" : insert_date
            
        }, { safe : true}, function(err,doc) {
        	if (err) return;
	     	var data_id = doc._id;
	     	runReduce(); 
	        //io.sockets.emit('item', { user_id : user_id, data_id: data_id, data: data });
			
        });
}


function runReduce() {

	//TODO: need to add time start and time end to a WHERE
	//TODO: need to inline return
	//TODO: return top 5-10 results only
	//TODO: strip out non-essential tags
	//create today
	//create past week
	//create past month
	//create past year 
	
	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: { replace: "word_count_today"}, query: { content_date: {'$gte' : getLastDay() }}, readPreference: "primary" });
	
	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: { replace: "word_count_week"}, query: { content_date: {'$gte' : getLastWeek() }}, readPreference: "primary"});

	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: { replace: "word_count_month"}, query: { content_date: {'$gte' : getLastMonth() }}, readPreference: "primary"});

	mongodb.companyitem.mapReduce(mapFunction, reduceFunction, {out: { replace: "word_count_year"}, query: { content_date: {'$gte' : getLastYear() }}, readPreference: "primary"});

	
	
}

function normalizeDate(today)
{
	var normalized = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return normalized;
}

function getLastDay(){
    var today = new Date();
    var lastday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return lastday;
}

function getLastWeek(){
    var today = new Date();
    var lastweek = new Date(today.getFullYear(), today.getMonth() , today.getDate() - 7);
    return lastweek;
}

function getLastMonth(){
    var today = new Date();
    var lastmonth = new Date(today.getFullYear(), today.getMonth()-1, today.getDate());
    return lastmonth;
}

function getLastYear(){
    var today = new Date();
    var lastyear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return lastyear;
}

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
	        var tags = ['is', 'the', 'to', 'of', 'in', 'as', 'a', 'it', 'am', 'or', 'and', 'because', 'are', 'was', 'by', 'at', 'for', 'with', 'more', 'on', 'said', 'be', 'here', 'its', 'that', 'an', 'have', 'about', 'from', 'their', 'than', 'will', 'even', 'has', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'percent', 'billion', 'million', 'us', 'new', 'since', 'according', 'yesterday', 'bank', 'new', 'york', 'mellon', 'bny', 'if', 'who', 'year', 'after', 'she', 'our', 'we', 'before', 'which', 'where', 'who', 'he', 'there', 'any', 'not', 'been', 'this'];
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

