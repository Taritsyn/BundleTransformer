(function (doc, handlebars, undefined) {
	var template = handlebars.templates.HandlebarsTranslatorBadge,
		badgeElem,
		/**
		* Data for template
		*
		* @export
		*/
		handlebarsData = {
			/**
			* Text of badge
			*
			* @type {String}
			* @expose
			*/
			text: 'Handlebars',

			/**
			* URL which is used for navigating after clicking on badge
			*
			* @type {String}
			* @expose
			*/
			url: 'http://handlebarsjs.com/',

			/**
			* Flag for whether to open URL in a new window
			*
			* @type {Boolean}
			* @expose
			*/
			newWindow: true,

			/**
			* Flag for whether to make visible badge
			*
			* @type {Boolean}
			* @expose
			*/
			isVisible: true
		},
		htmlContent
		;

	if (template) {
		badgeElem = doc.getElementById('handlebars');
		if (badgeElem) {
			htmlContent = template(handlebarsData);

			badgeElem.innerHTML = htmlContent;
			badgeElem.style.display = 'block';
		}
	}
} (document, Handlebars));