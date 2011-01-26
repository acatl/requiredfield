/*
 * requiredfield jquery widget
 *
 * Copyright 2011, Acatl Pacheco
 * Licensed under the MIT License.
 *
 */


$.widget("ui.requiredfield", {
	options : {
		isRequired : true,
		requiredClass : "required",
		watermarkText : null,
		watermarkClass : "watermark",
		functionValidate : null,
		dataType : "string",
		liveCheck : false
	},

	_create : function() {
		this.element.focus($.proxy(this._focusHandler, this));
		this.element.blur($.proxy(this._blurHandler, this));
		if (this.options.liveCheck) {
			this.element.keyup($.proxy(this._keyupHandler, this));
		}
	},

	_init : function() {
		if (this.options.watermarkText != null) {
			this._updateWatermark();
		}
	},

	_focusHandler : function(e) {
		var value = this.element.val();
		var watermarkIt = false;
		if (value == this.options.watermarkText) {
			this.element.val("");
		}
		this.element.toggleClass(this.options.watermarkClass, false);
	},

	_blurHandler : function(e) {
		this._updateValidation();
		this._updateWatermark();
	},

	_keyupHandler : function(e) {
		this._updateValidation();
	},

	_updateValidation : function() {
		var valid = true;
		if (this.options.isRequired) {
			valid = this._validate();
		}
		this.element.toggleClass(this.options.requiredClass, !valid);
	},

	_updateWatermark : function() {

		if (this.options.watermarkText == null)
			return;

		var value = this.element.val();
		var watermarkIt = false;
		if (value == "" || value == this.options.watermarkText) {
			watermarkIt = true;
			this.element.val(this.options.watermarkText);
		}
		this.element.toggleClass(this.options.watermarkClass, watermarkIt);
	},

	_validate : function() {
		var value = this.element.val();

		var valid = true;

		if (value == "") {
			return false;
		}

		var dataTypeValid = true;
		if (this.options.dataType != null) {
			var val = null;
			switch (this.options.dataType) {
				case "number":
					dataTypeValid = !isNaN(Number(value));
					break;
				case "string":
				default:
					dataTypeValid = jQuery.type(val) == this.options.dataType;
					break;
			}

			if (!dataTypeValid)
				return false;
		}

		var functionValidateValid = true;
		if (this.options.functionValidate != null) {
			functionValidateValid = this.options.functionValidate(this.element.val());
		}

		return dataTypeValid && functionValidateValid;
	}

});