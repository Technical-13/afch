//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/core.js]]
function afcHelper_generateSelect(title, options, onchange) {
	var text = '<select name="' + title + '" id="' + title + '" ';
	if (onchange !== null) text += 'onchange = "' + onchange + '" ';
	text += '>';
	for (var i = 0; i < options.length; i++) {
		var o = options[i];
		text += '<option value="' + afcHelper_escapeHtmlChars(o.value) + '" ';
		if (o.selected) text += 'selected="selected" ';
		text += '>' + o.label + '</option>';
	}
	text += "</select>";
	return text;
}

function afcHelper_getToken(show) {
	if (show) document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_gettoken">Getting token</li>';
	token = mw.tokens.values["editToken"];
	if (show) $("#afcHelper_gettoken").html("Got token");
	return token;
}

function afcHelper_getPageText(title, show, redirectcheck) {
	if (show) document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get' + escape(title) + '">Getting <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>';
	var req = sajax_init_object();
	var params = "action=query&prop=revisions&rvprop=content&format=json&indexpageids=1&titles=" + encodeURIComponent(title);
	//	if(redirectcheck)
	//		params += "&redirects=";
	req.open("POST", wgScriptPath + "/api.php", false);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.setRequestHeader("Content-length", params.length);
	req.setRequestHeader("Connection", "close");
	req.send(params);
	var response = eval('(' + req.responseText + ')');
	pageid = response['query']['pageids'][0];
	if (pageid === "-1") {
		if (show) document.getElementById('afcHelper_get' + escape(title)).innerHTML = 'The page <a class="new" href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a> does not exist';
		delete req;
		return '';
	}
	var newtext = response['query']['pages'][pageid]['revisions'][0]['*'];
	//	if(redirectcheck){
	//		var oldusername  = response['query']['redirects'][0]['from'];
	//		var newusername = response['query']['redirects'][0]['to'];
	//		if(oldusername != newusername)
	//			usertalkpage = newusername;
	//	}
	delete req;
	if (show) document.getElementById('afcHelper_get' + escape(title)).innerHTML = 'Got <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a>';
	return newtext;
}

function afcHelper_editPage(title, newtext, token, summary, createonly) {
	summary += afcHelper_advert;
	$("#afcHelper_finished_wrapper").html('<span id="afcHelper_AJAX_finished_' + afcHelper_AJAXnumber + '" style="display:none">' + $("#afcHelper_finished_wrapper").html() + '</span>');
	var func_id = afcHelper_AJAXnumber;
	afcHelper_AJAXnumber++;
	document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_edit' + escape(title) + '">Editing <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>';
	var req = sajax_init_object();
	var params = "action=edit&format=json&token=" + encodeURIComponent(token) + "&title=" + encodeURIComponent(title) + "&text=" + encodeURIComponent(newtext) + "&notminor=1&summary=" + encodeURIComponent(summary);
	if (createonly) params += "&createonly=1";
	url = wgScriptPath + "/api.php";
	req.open("POST", url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.setRequestHeader("Content-length", params.length);
	req.setRequestHeader("Connection", "close");
	req.onreadystatechange = function() {
		if (req.readyState === 4 && req.status === 200) {
			response = eval('(' + req.responseText + ')');
			try {
				if (response['edit']['result'] === "Success") {
					$("#afcHelper_edit" + escape(title)).html('Saved <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a>');
				} else {
					$('#afcHelper_edit' + escape(title)).html('<div style="color:red"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info:' + response['error']['code'] + ' : ' + response['error']['info']);
				}
			} catch (err) {
				$("#afcHelper_edit" + escape(title)).html('<div style="color:red"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>');
			}
			$("#afcHelper_AJAX_finished_" + func_id).css("display", '');
			delete req;
		}
	};
	req.send(params);
}
//</nowiki>
