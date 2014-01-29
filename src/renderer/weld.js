var weld = require('weld').weld;

module.exports = {

	render: function (document, renderData) {

		weld(document, renderData, {

			map: function (parent, element, key, val) {
				var key;
				var metaTag;
				var templateType = element.getAttribute('data-weld-type');
				
				if(templateType === 'html') {
					element.innerHTML = val;
					return false;
				}


				if (/og/.test(key)) {
					element.setAttribute('content', val);

					return false;
				}
				
			},

			alias: {

				pageTitle: function (parent, element, key, value) {
					document.title = value;
					return false;
				}

			}

		});

		return document;

	}

}