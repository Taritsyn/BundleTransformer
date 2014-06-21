(function (handlebars, undefined) {
	handlebars.registerHelper('link', function (text, url, newWindow) {
		return new handlebars.SafeString(
			"<a href='" + url + "'" + (newWindow ? " target='_blank'" : "") +">" + text + "</a>"
		);
	});
} (Handlebars));