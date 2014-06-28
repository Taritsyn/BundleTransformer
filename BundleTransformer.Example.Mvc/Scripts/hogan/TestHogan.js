(function (doc, hogan, templates, undefined) {
	var template = templates.HoganTranslatorBadge,
		badgeElem,
		data = {
			text: 'Hogan',
			url: 'http://twitter.github.io/hogan.js/',
			newWindow: true,
			isVisible: true,
			_newWindow: function() {
				return this.newWindow;
			}
		},
		htmlContent
		;

	if (template) {
		badgeElem = doc.getElementById('hogan');
		if (badgeElem) {
			htmlContent = template.render(data);

			badgeElem.innerHTML = htmlContent;
			badgeElem.style.display = 'block';
		}
	}
} (document, Hogan, templates));