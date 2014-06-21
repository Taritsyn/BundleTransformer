(function (doc, handlebars, undefined) {
	var template = handlebars.templates.HandlebarsTranslatorBadge,
		badgeElem,
		data = {
			text: 'Handlebars',
			url: 'http://handlebarsjs.com/',
			newWindow: true,
			isVisible: true
		},
		htmlContent
		;

	if (template) {
		badgeElem = doc.getElementById('handlebars');
		if (badgeElem) {
			htmlContent = template(data);

			badgeElem.innerHTML = htmlContent;
			badgeElem.style.display = 'block';
		}
	}
} (document, Handlebars));