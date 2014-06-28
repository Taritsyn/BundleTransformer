(function (handlebars, undefined) {
	handlebars.registerHelper('link', function (text, url, newWindow) {
		var escapedUrl = handlebars.Utils.escapeExpression(url);

		return new handlebars.SafeString(
			"<a href='" + escapedUrl + "'" + (newWindow ? " target='_blank'" : "") + ">" + text + "</a>"
		);
	});
} (Handlebars));