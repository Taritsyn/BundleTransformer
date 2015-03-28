(function (doc, hogan, templates, undefined) {
	var template = templates.HoganTranslatorBadge,
		badgeElem,
		/**
		* Data for template
		*
		* @export
		*/
		hoganData = {
			/**
			* Text of badge
			*
			* @type {String}
			* @expose
			*/
			text: 'Hogan',

			/**
			* URL which is used for navigating after clicking on badge
			*
			* @type {String}
			* @expose
			*/
			url: 'http://twitter.github.io/hogan.js/',

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
			isVisible: true,

			/**
			* Gets a flag for whether to open URL in a new window
			*
			* @returns {Boolean} - Flag for whether to open URL in a new window
			* @expose
			*/
			_newWindow: function() {
				return this.newWindow;
			}
		},
		htmlContent
		;

	if (template) {
		badgeElem = doc.getElementById('hogan');
		if (badgeElem) {
			htmlContent = template.render(hoganData);

			badgeElem.innerHTML = htmlContent;
			badgeElem.style.display = 'block';
		}
	}
} (document, Hogan, templates));