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
		allowEmpty: "false", // if true does not add the required class to an empty field unless externally validated
		watermarkText : null,
		watermarkClass : "watermark",
		functionValidate : null,
		dataType : "string",
		liveCheck : false,
		leaveWatermark:false
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
		if (value == this.options.watermarkText && !this.options.leaveWatermark) {
			this.element.val("");
		}
		this.element.toggleClass(this.options.watermarkClass, false);
		
		if ( this.options.leaveWatermark ) {
		}
	},

	_blurHandler : function(e) {
		this._updateWatermark();
		this._updateValidation();
	},

	_keyupHandler : function(e) {
		this._updateValidation();
	},

	_updateValidation : function() {
		this.validate();
		if (this.val() == "" && this.options.allowEmpty == true)
			this.element.removeClass(this.options.requiredClass);
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
	
	refresh: function () {
		if (arguments[0] == true) {
			this.element.val("");
		}
		if (this.options.watermarkText != null) {
			this._updateWatermark();
		}
		this.element.toggleClass(this.options.requiredClass, false);
	},

	validate: function() {
		var valid = true;
		if (this.options.isRequired) {
			valid = this.isValid();
		}
		this.element.toggleClass(this.options.requiredClass, !valid);
		this.element.trigger("validation", [valid]);
	},

	// returns an empty string ("") or a value for the required field.
	val: function() {
		// watermark value is returned by val(). Fail fast if the watermark is enabled
		if ( this.element.hasClass(this.options.watermarkClass) ) return "";

		var value = this.element.val();

		if (value == "" || value == null) return "";

		return value;
	},

	isValid: function() {

		var value = this.val();
		if (value == "") return false;

		var valid = true;
		
		// extracting the data region (technically this should be done only once somewhere, feel free to move it)
		var dataType = this.options.dataType.replace(" ","");
		var dataRegion = (dataType.match(/\[[a-z/]*\]/i) || [""])[0]
		if (dataRegion != "")
		{
			dataType = dataType.replace(dataRegion, "");
			dataRegion = dataRegion.replace("[", "").replace("]", "");
		}

		// Data region is appended to the data type like so [COUNTRY_CODE/PROVINCE_CODE]. For example [CA/ON] is ontario in canada.
		dataRegion = dataRegion.split("/");
		var country = dataRegion[0];
		var state = dataRegion[1];
		
		// validating the data type
		var dataTypeValid = true;
		
		var applyRule = function(regex)
		{
			match = value.match(regex);
			dataTypeValid |= (match != null && match[0] == value);
		}

		
		if (dataType != null && dataType != "") {
			var val = null;
			switch (dataType) {

				case "number":
					dataTypeValid = !isNaN(Number(value));
					break;

				case "string":
					// no validation needed
					break;

					dataTypeValid = true;
				case "postal-code":
					dataTypeValid = false;
					if (country == "CA" || country == "")
					{
						applyRule( /[ABCEGHJKLMNPRSTVXY]\d[A-Z]\s?\d[A-Z]\d/i);
					}
					if (country == "US" || country == "")
					{
						//untested
						applyRule( /\d{5}(-\d{4})?/i);
					}
					if (country == "UK" || country == "")
					{
						//untested
						applyRule( /[A-Z]{1,2}\d[A-Z\d]? \d[ABD-HJLNP-UW-Z]{2}/i )
					}
					break;

				case "phone-number":
					dataTypeValid = false;
					if (country == "CA" || country == "US" || country == "")
					{
						applyRule( /(1-?)?(\()?[2-9]\d{2}(\))?-?[2-9]\d{2}-?\d{4}/ );
					}
					if (country == "UK" || country == "")
					{
						//untested
						applyRule( /^(\(?(0|\+44)[1-9]{1}\d{1,4}?\)?\s?\d{3,4}\s?\d{3,4})$/); // land line
						applyRule( /^((0|\+44)7(5|6|7|8|9){1}\d{2}\s?\d{6})$/); // mobile
					}
					break;

				case "distance":
					dataTypeValid = false;
					if (dataRegion[0] == "IMPERIAL" || dataRegion[0] == "")
					{
						applyRule("(([0-9.]*)')?(([0-9.]*)\"?)?");
					}
					if (dataRegion[0] == "METRIC" || dataRegion[0] == "")
					{
						//todo
					}
					break;

				case "email":
					// Don't think this validation is standards complient. But it at least appears not to be overly strict.
				 dataTypeValid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
				 break;
				
				default:
					dataTypeValid = jQuery.type(value) == this.options.dataType;
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
