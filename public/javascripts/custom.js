$j = jQuery.noConflict();
var lastword =  "";
var externallastword = "";
$j(document).foundation();
$j(document).ready(function () {
	var user_id = 0;
	var socket = io.connect('http://localhost:3000');
	isotope();
	
	

	$j("#formAddUser").submit(function (e) {
		e.preventDefault();
		console.log("SUBMIT FORM");
		var username = $j("#inputUserName").val();
		var email = $j("#inputUserEmail").val();
		//create socket to send data async
			
			
		socket.emit('submitdata', { user_id: user_id, username: username, email : email });	
	});
	
	
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
	});
	
	socket.on('user_id', function (id) {
		user_id = id;
			
	});
	
	socket.on('user', function (data) {
		add_data(data.user_id, data.data);
		
	});
	
	socket.on("item", function(data) {
		
		add_item(data.user_id, data.data);
	});
	
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
	
	$j(".internalsearch").on("keyup", testInternalHighlight);
	
	$j(".internalsearch").focus(function () {
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
			testExternalHighlight();	
	});	

	$j(".externalsearch").blur(function () {
			var word = $j(this).val();	
			if (word != "" && word != externallastword) 
			{
				doSearchUpdate(word, 'external');
			}	
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
				
				$j("#internal-news .padding").html(data);
				testInternalHighlight();
				}
				
				if (source == 'external')
				{
				
				$j("#external-news .padding").html(data);
				testExternalHightlight();
				
				}
				$j(document).foundation();
			});
			
	}
		
	
	$j("#date-selection").on("click", "a", function() {
		$j("#date-selection dd").removeClass('active');
		var dateselection = $j(this).attr("date-selection"); 
		$j(this).parent("dd").addClass("active");
		$j.post(
			"/pulldata", 
			{ dateselection: dateselection },
			function(data, status)
			{
				$j("#keyword-list").stop().fadeOut('fast', 'swing', function () {
				$j(this).html(data).fadeIn('fast');
					}
					);
			}
		);		
	});
	
	


});

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

  
 