/*
 * GET home page.
 */
 exports.index = function(db) {

	return function(req, res){
	//get company list
	var collection = db.get('companycollection');
	 collection.find({},{},function(e,docs){
            res.render('login', {
                "companylist" : docs
            });
        });
	}
  //res.render('index', { title: 'Express' });
};

exports.companylist = function(db) {

	return function(req, res){
	//get company list
	var collection = db.get('companycollection');
	 collection.find({},{},function(e,docs){
            res.render('companylist', {
                "companylist" : docs
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
			 			companylist: docs
			 		}
		 		);
         });

	
         
	}
  //res.render('index', { title: 'Express' });
};

exports.addcompany = function(db)
{
	 return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var name = req.body.companyname;

        // Set our collection
        var collection = db.get('companycollection');

        // Submit to the DB
        collection.insert({
            "name" : name,
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
		}
		
		if (typeof(articles[i].end_position) != "undefined")
		 {
			 var endlat = articles[i].end_position.lat;
			 var endlng = articles[i].end_position.lng;
			 var end_line = "new google.maps.LatLng(" + endlat + "," + endlng + ")";
			 //latlng.push(end_line);
			 endlatlng[articles[i]._id] = end_line;
	 		 linkmap.push("[" + start_line + "," + end_line+ "]");
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
		 			console.log(linkmap);
		 	
		            res.render('company', {
		            	"path" : req.path,
		            	"companylist" : companylist,
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
		}
		
		if (typeof(articles[i].end_position) != "undefined")
		 {
			 var endlat = articles[i].end_position.lat;
			 var endlng = articles[i].end_position.lng;
			 var end_line = "new google.maps.LatLng(" + endlat + "," + endlng + ")";
			 //latlng.push(end_line);
			 endlatlng[articles[i]._id] = end_line;
	 		 linkmap.push("[" + start_line + "," + end_line+ "]");
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
		}
		
		if (typeof(articles[i].end_position) != "undefined")
		 {
			 var endlat = articles[i].end_position.lat;
			 var endlng = articles[i].end_position.lng;
			 var end_line = "new google.maps.LatLng(" + endlat + "," + endlng + ")";
			 //latlng.push(end_line);
			 endlatlng[articles[i]._id] = end_line;
	 		 linkmap.push("[" + start_line + "," + end_line+ "]");
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
};


function parse_text(articles)
{
	for (var i = 0; i < articles.length; i++) {

		 var excerpt = articles[i].content.substring(0, 250);	
		 var fixdate = new Date(articles[i].content_date);
		 
		 console.log(excerpt);	
		articles[i].excerpt = excerpt;
		articles[i].content_date = fixdate.getMonth() + "/" + fixdate.getDate() + "/" + fixdate.getFullYear();	
	}
	
	return articles;
}

function get_articles(daterange, db, res)
{
	var collection = db.get('companyitem');
	var response = {};
	console.log(daterange);
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

