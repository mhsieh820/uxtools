var monk = require('monk');
var collection = "companyitem";

// Bind methods to the client
monk.bind(collection, {

	/**
	 * @param string term The term to search for
	 * @param function fn The callback function
	 */
	search: function(term, fn) {

		// RexExp object - search for term, case insensitive
		var regex = new RegExp(term, "i");

		// "this" in this context refers to the mongoskin collection object
		this.find({
			"$or": [
				{
					"content": regex
				},
				{
					"tags": regex
				},
				{
					"title": regex
				}
			]
		}, {}).toArray(fn);
	}
});

/*
 * GET home page.
 */
 exports.index = function(db) {

	return function(req, res){
	//get company list
	var collection = db.get('companycollection');
	 collection.find({},{},function(e,docs){
            res.render('index', {
                "title" : "Select Company",
                "companylist" : docs
            });
        });
	}
  //res.render('index', { title: 'Express' });
};

exports.adddata = function(db) {

	return function(req, res){
	//get company list
         res.render('adddata');
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

exports.company = function(db)
{
	 return function(req, res) {
		 var date_set = false;
		 if (req.body.startDate && req.body.endDate)
		 {
			 console.log("GOT DATES");
			 date_set = true;
		 }

		 console.log(req.params.id);
		 //get the elements within the company
		 var collection = db.get('companyitem');
		 var word_count = db.get('word_count_today');
		
		var external_content = "";
		 
		 var response = "";
		 word_count.find({}, { limit: 10, sort: { value : -1 }}, function(e, words) {
			response = words;
			 
		 } );
		 
		 
		  collection.find({ source: "external" },{
			 	sort: { content_date: -1 }
			 
		 	},function(e,docs){
			 	external_content = docs;
		 })
		 collection.find({ source: "internal" },{
			 	sort: { content_date: -1 }
			 
		 	},function(e,docs){
		 
		 
            res.render('company', {
            	"path" : req.path,
            	"company_id" : req.params.id,
                "internal" : parse_text(docs),
                "external" : parse_text(external_content),
                "word_count" : response
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
		var word = req.body.searchword;
		var source = req.body.source;
		/*
var collection = db.get('companyitem');
		collection.find({}, {}, function(e, articles) {
			
			res.json({ articles: articles })
			
		});
*/
		var collection = db.get('companyitem');
		collection.find({ source: source, content : { $regex : ".*" + word + ".*", $options : "i" }}, function(err, documents) {

		// No error
		if(!err) {
			// Render the view
			    res.render('ajaxnews', {
			    	"articles" : parse_text(documents)
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
		var type = req.body.dateselection;
		console.log(type);
		if (type == 'today')
		{
    	var word_count = db.get('word_count_today');
    	}
    	else if (type == 'week')
    	{
	    var word_count = db.get('word_count_week');
	
    	}
    	else if (type == 'month')
    	{
	    var word_count = db.get('word_count_month');
	
    	}
    	else if (type == 'year')
    	{
	    var word_count = db.get('word_count_year');
	
    	}
		word_count.find({},{ limit: 10, sort: { value : -1 } },function(e,words){
            res.render('ajaxlist', {
                "word_count" : words
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
/*
map reduce on the content



*/



/*
exports.adduser = function(db) {
    return function(req, res) {

        // Get our form values. These rely on the "name" attributes
        var userName = req.body.username;
        var userEmail = req.body.useremail;

        // Set our collection
        var collection = db.get('usercollection');

        // Submit to the DB
        collection.insert({
            "username" : userName,
            "email" : userEmail
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // If it worked, forward to success page
                res.redirect("userlist");
                // And set the header so the address bar doesn't still say /adduser
                //res.location("userlist");
            }
        });

    }
}
*/
