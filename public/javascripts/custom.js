$j = jQuery.noConflict();
var lastword =  "";
var externallastword = "";
var map, pointarray, heatmap;
$j(document).foundation();

	if (typeof currentcompany !== 'undefined') {
		$j("#" + currentcompany).parent("a").addClass("active");	
	}


$j(document).ready(function () {



	var user_id = 0;
	//var socket = io.connect('http://localhost:5000');
	isotope();
	
/*
	$j("#nav .link").click(function () {
			$j(this).parents("li").siblings("li").children(".innernav").slideUp();
			$j(this).siblings(".innernav").slideDown();
		
	});
*/
	

/*
	$j("#formAddUser").submit(function (e) {
		e.preventDefault();
		console.log("SUBMIT FORM");
		var username = $j("#inputUserName").val();
		var email = $j("#inputUserEmail").val();
		//create socket to send data async
			
			
		socket.emit('submitdata', { user_id: user_id, username: username, email : email });	
	});
	
*/
	
/*
	$j("#formAddItem").submit(function (e) {
		e.preventDefault();
		console.log("SUBMIT ITEM");
		var submit_array = $j(this).serializeArray();
		var item_json = {};
		$j.each(submit_array, function(index, element)
		{
			
			item_json[element.name] = element.value;
			
			
		});
		//create socket to send data async
		console.log(item_json);
			
		socket.emit('submititem', item_json);	
		
		location.reload();
	});
*/
	$j("#clear-search").click(function () {
		
		$j("#searchform input").val('');
		
	});
	
	$j("#inputOrigination").blur(function () {
		
		var place = $j(this).val();
		
		$j.post(
			"/geosearch", 
			{ place: place },
			function(data, status)
			{
				var address = data.address
				var lat = data.latlng.lat
				var lng = data.latlng.lng
				$j("#inputOrigination").val(address);
				$j("#OriginationLngLat").val(lng + ", " + lat);
				$j("#startLat").val(lat);
				$j("#startLng").val(lng);
			});

		
	});
	
	$j("#inputDestination").blur(function () {
		
		var place = $j(this).val();
		
		$j.post(
			"/geosearch", 
			{ place: place },
			function(data, status)
			{
				var address = data.address
				var lat = data.latlng.lat
				var lng = data.latlng.lng
				$j("#inputDestination").val(address);
				$j("#DestinationLngLat").val(lng + ", " + lat);
				$j("#endLat").val(lat);
				$j("#endLng").val(lng);
			});

		
	});
	
	
/*
	socket.on('user_id', function (id) {
		user_id = id;
			
	});
	
	socket.on('user', function (data) {
		add_data(data.user_id, data.data);
		
	});
	
	socket.on("item", function(data) {
		
		add_item(data.user_id, data.data);
	});
*/
	
	function testInternalHighlight() {
		$j("#internal-news .content").unhighlight();
		$j(".internalsearch").each(function () {
				if ($j(this).hasClass("searchinput2"))
				{
					$j("#internal-news .content").highlight( $j(this).val(),
						{
							wordsOnly: true,
							className: 'important'
						});
				}
				else
				{
				$j("#internal-news .content").highlight( $j(this).val(),
					{
					wordsOnly: true,
					});
				}
		});		
	}
	
	function testExternalHighlight() {
		$j("#external-news .content").unhighlight();
		$j(".externalsearch").each(function () {
				if ($j(this).hasClass("searchinput2"))
				{
					$j("#external-news .content").highlight( $j(this).val(),
						{
							wordsOnly: true,
							className: 'important'
						});
				}
				else
				{
				$j("#external-news .content").highlight( $j(this).val(),
					{
					wordsOnly: true,
					});
				}
		});		
	}
	
	function doHighlight(word, source)
	{
		if (source == 'internal')
		{
			$j("#internal-news .content").unhighlight();
			$j("#internal-news .content").highlight( word,
						{
							wordsOnly: true,
						});
		} else {	
		$j("#external-news .content").unhighlight();

			$j("#external-news .content").highlight( word,
						{
							wordsOnly: true,
						});

		}	
	}
	
	$j(".internalsearch").on("keyup", testInternalHighlight);
	
	$j(".internalsearch").focus(function () {
			$j("#keyword-list .selectable").removeClass("highlight");
			testInternalHighlight();			
	});
	
	$j(".internalsearch").blur(function () {
			var word = $j(this).val();	
			if (word != "" && word != lastword) 
			{
				doSearchUpdate(word, 'internal');
			}	
	});
	
	$j(".externalsearch").on("keyup", testExternalHighlight);
	
	$j(".externalsearch").focus(function () {
			$j("#keyword-list .selectable").removeClass("highlight");
			testExternalHighlight();	
	});	

	$j(".externalsearch").blur(function () {
			var word = $j(this).val();	
			if (word != "" && word != externallastword) 
			{
				doSearchUpdate(word, 'external');
			}	
	});
	
	$j("#keyword-list").on("click", ".selectable", function () {
		$j("#keyword-list .selectable").removeClass("highlight");
		$j(this).addClass("highlight");
		var word = $j(this).attr("data-word");
		doSearchUpdate(word, 'both');
	});

	//finish
	
	var user_id = 0;
	function send_message(message) {
		socket.emit("message", user_id, message);
	}

	function add_data (user_id, data) {
		//parameters = { user_id : user_id };
		console.log(data);
		var $item = $j("<div class='item' id='" + data.data_id + "'>" + data.username + "</div>");

		$j('#userlist').isotope( 'insert', $item );
		/*
$j.get( '/pulldata',parameters, function(data) {
			 $j('#values').html(data);
			 isotope();
		});
		*/
	}
	
	function add_item (user_id, data) {
		//parameters = { user_id : user_id };
		console.log(data);
		var $item = $j("<div class='item' id='" + data.data_id + "'>" + data.title + "</div>");

		$j('#userlist').isotope( 'insert', $item );
		/*
$j.get( '/pulldata',parameters, function(data) {
			 $j('#values').html(data);
			 isotope();
		});
		*/
	}

	function isotope()
	{
		$j('#userlist').isotope({
			// options
			itemSelector : '.item',
			layoutMode : 'masonry'
		});
		
		
	}
	
	function doSearchUpdate(word, source)
	{
		//update internal
		//update external
		//update both
			$j.post(
			"/dosearch", 
			{ searchword: word, source: source },
			function(data, status)
			{
				if (source == 'internal')
				{

						$j("#internal-news .padding").html(data.internal).fadeIn('fast');
						doHighlight(word, 'internal');
						

				}
				
				if (source == 'external')
				{
				
						$j("#external-news .padding").html(data.external).fadeIn('fast');
						doHighlight(word, 'external');
				}
				
				if (source == 'both')
				{
					$j("#internal-news .padding").html(data.internal).fadeIn('fast');
						doHighlight(word, 'internal');	
					$j("#external-news .padding").html(data.external).fadeIn('fast');
						doHighlight(word, 'external');

				}
				
				
				//update map
				$j("#scriptinsert").html(data.map);
				update_map();
				$j(document).foundation();
			});
			
	}
		
	
	$j("#date-selection").on("click", "a", function() {
		$j("#date-selection dd").removeClass('active');
		var datetext = $j(this).html();
		var dateselection = $j(this).attr("date-selection"); 
		$j(this).parent("dd").addClass("active");
		$j.post(
			"/pulldata", 
			{ dateselection: dateselection },
			function(data, status)
			{
				//console.log(data.map);
				$j("#date-selected span").html(datetext);
				$j("#scriptinsert").html(data.map);
				update_map();
				$j("#keyword-list").stop().fadeOut('fast', 'swing', function () {
				$j(this).html(data.list).fadeIn('fast');
				
					//console.log(data.articles);
				
					$j("#internal-news .padding").html(data.internal).fadeIn('fast');
					$j("#external-news .padding").html(data.external).fadeIn('fast');
					$j(document).foundation();
					}
					);
			}
		);		
	});
	
	$j("#expand").click(function ()  {
			if ($j("#map-canvas").hasClass("expanded"))
			{
				$j("#map-canvas").removeClass("expanded");
			}
			else
			{
				$j("#map-canvas").addClass("expanded");
			}
			google.maps.event.trigger(map, 'resize');
	});
	
	


});
		
if ($j("#map-canvas").length > 0)
{



var infowindow = new google.maps.InfoWindow({
		  	  content: "",
		  	  maxWidth: 250
});

var count = 1;
var markers = [];
var lines = [];
function add_images(latlng, loc)
{
		if (loc == 'start')
		{
	  var image = {
	    url: '/images/circle.png',
	    // This marker is 20 pixels wide by 32 pixels tall.
	    size: new google.maps.Size(15, 15),
	    // The origin for this image is 0,0.
	    origin: new google.maps.Point(0,0),
	    anchor: new google.maps.Point(7.5, 7.5)
	  };
	  }
	   else {
		 var image = {
	    url: '/images/circle_e.png',
	    // This marker is 20 pixels wide by 32 pixels tall.
	    size: new google.maps.Size(15, 15),
	    // The origin for this image is 0,0.
	    origin: new google.maps.Point(0,0),
	    anchor: new google.maps.Point(7.5, 7.5)
	  };

	   }
	  $j.each(latlng, function(i, pos) {
	  	  
		  //console.log(pos);
	  
	  	 var marker = new google.maps.Marker({
		 position: pos.latlng,
         map: map,
         icon: image
		 });
		 
		  google.maps.event.addListener(marker, 'click', function() {
		  		var title = $j("#excerpt_" + pos.id + " .excerpt_title").html();
		  		var content = $j("#excerpt_" + pos.id + " .excerpt").html();

		  		infowindow.setContent("<div class='small'>" + title + content + "</div>");
			  	infowindow.open(map,marker);
			  	
		  });
		  
		 markers.push(marker);
	 });
}



// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
  
  for (var i = 0; i < lines.length; i++) {
    lines[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}


function update_map() {
		clearMarkers();
		add_images(latlng.elements, "start");
		add_images(endlatlng.elements, "start");
		add_images(extlatlng.elements, "end");
		add_images(extendlatlng.elements, "end");
		var combined = [];
		$j.each(latlng.elements, function(i, pos) {
		 	combined.push(pos.latlng);
		});
		
		$j.each(endlatlng.elements, function(i, pos) {
		 	combined.push(pos.latlng);
		});
		
		var pointArray = new google.maps.MVCArray(combined);

		var heatmap = new google.maps.visualization.HeatmapLayer({
		  data: pointArray,
		  radius: 20
		  });
		 heatmap.setMap(map)
		 
		 
		 var lineSymbol = {
		  path: 'M 0,-1 0,1',
		  strokeOpacity: 1,
		  scale: 2
		};

		 //create lines
		 $j.each(links, function(i, link) {
			var line = new google.maps.Polyline({
		    path: link,
		    strokeColor: "#FFF",
		    strokeOpacity: 0,
		    icons: [{
			    icon: lineSymbol,
			    offset: '0',
			    repeat: '10px'
			  }],
		    geodesic: true,
		    map: map
		});
			lines.push(line);
		 });
				
	
}


function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(20, -20),
          zoom: 2,
          disableDefaultUI: true,
          mapTypeId: google.maps.MapTypeId.SATELLITE
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
		update_map();
		//create heatmap
		/*
var combined = latlng.concat(endlatlng); 	
		var pointArray = new google.maps.MVCArray(combined);

		var heatmap = new google.maps.visualization.HeatmapLayer({
		  data: pointArray
		  });
		 heatmap.setMap(map);
*/
		 //create markers

}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

google.maps.event.addDomListener(window, 'load', initialize);

} // end if


jQuery.extend({
    highlight: function (node, re, nodeName, className) {
        if (node.nodeType === 3) {
            var match = node.data.match(re);
            if (match) {
                var highlight = document.createElement(nodeName || 'span');
                highlight.className = className || 'highlight';
                var wordNode = node.splitText(match.index);
                wordNode.splitText(match[0].length);
                var wordClone = wordNode.cloneNode(true);
                highlight.appendChild(wordClone);
                wordNode.parentNode.replaceChild(highlight, wordNode);
                return 1; //skip added node in parent
            }
        } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
                !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
                !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
            for (var i = 0; i < node.childNodes.length; i++) {
                i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
            }
        }
        return 0;
    }
});

jQuery.fn.unhighlight = function (options) {
    var settings = { className: 'highlight', element: 'span' };
    jQuery.extend(settings, options);

    return this.find(settings.element + "." + settings.className).each(function () {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.highlight = function (words, options) {
    var settings = { className: 'highlight', element: 'span', caseSensitive: false, wordsOnly: false };
    jQuery.extend(settings, options);
    
    if (words.constructor === String) {
        words = [words];
    }
    words = jQuery.grep(words, function(word, i){
      return word != '';
    });
    words = jQuery.map(words, function(word, i) {
      return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    });
    if (words.length == 0) { return this; };

    var flag = settings.caseSensitive ? "" : "i";
    var pattern = "(" + words.join("|") + ")";
    if (settings.wordsOnly) {
        pattern = "\\b" + pattern + "\\b";
    }
    var re = new RegExp(pattern, flag);
    
    return this.each(function () {
        jQuery.highlight(this, re, settings.element, settings.className);
    });
};

  
 