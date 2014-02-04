var _ = require('underscore');

function Page(title, meta) {
	this._title = title;

	this._meta = {};

	this._contents = {};

};


Page.prototype = {


	getTitle: function () {
		return this._title;
	},


	setMeta: function (meta) {
		this._meta = _.extend(this._meta, meta);
	},


	eachMeta: function (handler) {
		for(var x in this._meta) {
			if (this._meta.hasOwnProperty(x)) {
				handler(x, this._meta[x]);
			}
		}
	},


	setContents: function (contents) {
		this._contents = _.extend(this._contents, contents);
	},

	eachContents: function (handler) {
		for(var x in this._contents) {
			if (this._contents.hasOwnProperty(x)) {
				handler(x, this._contents[x]);
			}
		}
	}


};

module.exports = Page;