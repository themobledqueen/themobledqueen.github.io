(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Ajaxfields = factory());
}(this, (function () { 'use strict';

	/**
	 * ajaxfields.js - Licensed under the MIT license
	 * ----------------------------------------------
	 *
	 */

	
	var _Group = function () {
		this._items = {};
	};

	_Group.prototype = {
	
		get: function (id) {
			return this.getAll()[id];
		},
		
		getAll: function () {

			return Object.keys(this._items).map(function (itemId) {
				return this._items[itemId];
			}.bind(this));

		},

		removeAll: function () {
			this._items = {};
		},

		add: function (item) {
			this._items[item.getInstanceId()] = item;
		},

		remove: function (item) {
			delete this._items[item.getInstanceId()];
		}

	};

	
	const AJAXFIELDS_TYPE_TEXT = 0;
	const AJAXFIELDS_TYPE_TEXTAREA = 1;
	const AJAXFIELDS_TYPE_PASSWORD = 2;
	const AJAXFIELDS_TYPE_SELECT = 3;
	const AJAXFIELDS_TYPE_DATE = 4;
	const AJAXFIELDS_TYPE_DATETIME = 5;
	const AJAXFIELDS_TYPE_TIME = 6;
	const AJAXFIELDS_TYPE_TOGGLE = 7;
	
	const AJAXFIELDS_STATE_NULL = 0;
	const AJAXFIELDS_STATE_READY = 1;
	const AJAXFIELDS_STATE_PENDING_ACTIVE = 2;
	const AJAXFIELDS_STATE_PENDING_ACTIVE_CANCELED = 3;
	const AJAXFIELDS_STATE_ACTIVE = 4;
	const AJAXFIELDS_STATE_PENDING_UPDATE = 5;
	
	var Ajaxfields = new _Group();

	Ajaxfields.Group = _Group;
	Ajaxfields._nextId = 0;
	Ajaxfields._baseURL = window.location.origin;
	Ajaxfields._idKey = 'id';
	Ajaxfields._fieldnameKey = 'fieldname';
	Ajaxfields._valueKey = 'val';
	Ajaxfields.nextId = function () {
		return Ajaxfields._nextId++;
	};
	
	Ajaxfields.setBaseURL = function(e){
		Ajaxfields._baseURL = e;
	}
	
	Ajaxfields.setIdKey = function(e){
		Ajaxfields._idKey = e;
	}
		
	Ajaxfields.getIdKey = function(){
		return Ajaxfields._idKey;
	}
	
	Ajaxfields.setFieldnameKey = function(e){
		Ajaxfields._fieldnameKey = e;
	}
	
	Ajaxfields.getFieldnameKey = function(){
		return Ajaxfields._fieldnameServerKey;
	}
	
	Ajaxfields.setValueKey = function(e){
		Ajaxfields._valueKey = e;
	}
			
	Ajaxfields.getValueKey = function(){
		return Ajaxfields._valueKey;
	}
	
	Ajaxfields.baseURL = function(e){
		console.log(e);
		if (!this._baseURL) return e;
		return this._baseURL+'/'+e;
	}
	
	Ajaxfields.ghostInputCss = function(){
		return {
			'padding': 0,
			'outline': 0,
			'border': 0,
			'background': 0
		};
	}
	
	Ajaxfields._passwordString = "•••••••";
	Ajaxfields._toggleElemCSS = {
		  'border': '2px solid #aaa',
		  'width': '1.5em',
		  'height': '1.5em',
		  'display': 'flex',
		  'align-items': 'center',
		  'justify-content': 'center',
		  'line-height': '1em',
		  'border-radius': '4px',
		  'color': '#fff',
		  'background': '#fff'
	};
	Ajaxfields._checkmarkSVG = '<svg style="width: 1em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.837 17.837"><path d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27 c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0 L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"/></svg>';
	
	Ajaxfields.getToggleElem = function(){
		var checkmarkElem = $(Ajaxfields._checkmarkSVG);
		var toggleElem = $(document.createElement('div'));
		toggleElem.addClass('ajaxfield_toggle');
		toggleElem.css(Ajaxfields._toggleElemCSS);
		toggleElem.append(checkmarkElem);
		return toggleElem;
	}
	
	Ajaxfields.$ = function (object) {
		return $(object);
	};
	
	Ajaxfields.getAllTypes = function(type){
		return [
			AJAXFIELDS_TYPE_TEXT,
			AJAXFIELDS_TYPE_TEXTAREA,
			AJAXFIELDS_TYPE_PASSWORD,
			AJAXFIELDS_TYPE_SELECT,
			AJAXFIELDS_TYPE_DATE,
			AJAXFIELDS_TYPE_DATETIME,
			AJAXFIELDS_TYPE_TIME,
			AJAXFIELDS_TYPE_TOGGLE
		]
	}
	
	Ajaxfields.cancelAllByState = function(state){
		var fields = this.getAll();
		if (!Array.isArray(state)) state = [state];
		for(var i in fields){
			var f = fields[i];
			if (state.includes(f.getState())) f.cancelActivation();
		}
	}
	
	Ajaxfields.cancelAllPending = function(){
		this.cancelAllByState(AJAXFIELDS_STATE_PENDING_ACTIVE);
	}
	
	Ajaxfields.cancelAllActiveOrPending = function(){
		this.cancelAllByState([AJAXFIELDS_STATE_ACTIVE, AJAXFIELDS_STATE_PENDING_ACTIVE]);
	}
	
	Ajaxfields.parseType = function(type){
		if (['t', 'text'].includes(type)) return AJAXFIELDS_TYPE_TEXT;
		if (['ta', 'textarea'].includes(type)) return AJAXFIELDS_TYPE_TEXTAREA;
		if (['p', 'pass', 'password'].includes(type)) return AJAXFIELDS_TYPE_PASSWORD;
		if (['s', 'select'].includes(type)) return AJAXFIELDS_TYPE_SELECT;
		if (['d', 'date'].includes(type)) return AJAXFIELDS_TYPE_DATE;
		if (['dt', 'datetime'].includes(type)) return AJAXFIELDS_TYPE_DATETIME;
		if (['time'].includes(type)) return AJAXFIELDS_TYPE_TIME;
		if (['c', 'color'].includes(type)) return AJAXFIELDS_TYPE_COLOR;
		if (['tog', 'toggle'].includes(type)) return AJAXFIELDS_TYPE_TOGGLE;
		return Ajaxfields.getAllTypes().includes(parseInt(type)) ? parseInt(type) : false;
	};
	
	Ajaxfields.configParam = function(key, config, default_value){
		if (typeof config !== 'object') return default_value;
		return (config[key] !== undefined) ? config[key] : default_value;
	}
		
	Ajaxfields.gatherData = function (object) {
		var elemData = object.data();
		var fieldData = {};
		for(var i in elemData){
			var key = i;
			var regex = /af(.*)/;
			if (key.match(regex)){
				key = key.replace(regex, '$1');
				key =  key.charAt(0).toLowerCase() + key.slice(1);
				fieldData[key] = elemData[i];
			}
		}
		
		return fieldData;
	},
	
	Ajaxfields.getDefaults = function(){
	
		var genericResponseStatusCheckFn = function(response, field){
			return (response[field.getResponseStatusKey()] == true);
		};
	
		var defaults = {
			simulateResponse: false,
			ghostInput: false,
			props: [],
			url: false,
			method: 'post',
			options: false,
			updateFromResponse: false,
			responseValueKey: 'val',
			checkResponseStatus: true,
			responseStatusKey: 'status',
			absolutePositioning: true,
			group: undefined,
			groupSelector: '[data-ajaxfield-group]',
			id: undefined,
			idKey: Ajaxfields.getIdKey(),
			fieldname: undefined,
			fieldnameKey: Ajaxfields.getFieldnameKey(),
			valueKey: Ajaxfields.getValueKey(),
			responseStatusCheckFunction: genericResponseStatusCheckFn
		};
		return defaults;
	},
	
	Ajaxfields.field = function (object, config) {
		this._id = Ajaxfields.nextId();
		this._object = Ajaxfields.$(object);
		this._config = config;
		
		this._callback = {};
			this._callback.init = Ajaxfields.configParam('onInit', config, function(){});
			this._callback.ready = Ajaxfields.configParam('onReady', config, function(){});
			this._callback.success = Ajaxfields.configParam('onSuccess', config, function(){});
			this._callback.error = Ajaxfields.configParam('onError', config, function(){});
			this._callback.complete = Ajaxfields.configParam('onComplete', config, function(){});
		
		this._type = Ajaxfields.parseType(config.type);
		this._optionsCache;
		this._lastInputValue;
		this._state = AJAXFIELDS_STATE_NULL;
		
		this._init();
		Ajaxfields.add(this);
	};
	
	Ajaxfields.field.prototype = {
	
		_getProp: function(prop, shallow){
			var groupData = {};
			var group;
			if (!shallow){
				group = this.getGroup();
				if (group){
					groupData = Ajaxfields.gatherData(group);
				}
			}
			var propVal = Ajaxfields.configParam(
				prop,
				this._config,
				Ajaxfields.configParam(
					prop,
					groupData,
					Ajaxfields.configParam(
						prop,
						Ajaxfields.getDefaults(),
						undefined
					)
				)
			)			
			
			return propVal;
		},
	
		getInstanceId: function () {
			return this._id;
		},
		
		getCustomProps: function(callback){
			var props = this._getProp('props');
			if (!Array.isArray(props)) return [];
			return props;
		},
		
		getId: function(){
			return this._getProp('id');;
		},
		
		getFieldname: function(){
			return this._getProp('fieldname');;
		},
		
		getSafeVal: function(callback){
			return this._safeVal;
		},
		
		getGroupSelector: function(){
			return this._getProp('groupSelector', true);
		},
		
		getIdKey: function(){
			return this._getProp('idKey');
		},
		
		getFieldnameKey: function(){
			return this._getProp('fieldnameServerKey');
		},
		
		getValueKey: function(){
			return this._getProp('valueKey');
		},
		
		inState: function(state){
			return (this.getState() == state);
		},
		
		getState: function(state){
			return this._state;
		},
		
		setState: function(state){
			return this._state = state;
		},
		
		cancelActivation: function(){
			var field = this;
			field.setState(AJAXFIELDS_STATE_PENDING_ACTIVE_CANCELED);
			field.complete(false, false, true);
		},
		
		monitorCanceledState: function(){
			var field = this;
			return new Promise(function(resolve, reject) {
				var i = setInterval(() => {
					if (!field.inState(AJAXFIELDS_STATE_PENDING_ACTIVE)){
						resolve(false);
						clearInterval(i);
					}
				}, 1);
			});
		},
		
		getGroup: function(){
			var group = this._group;
			if (group) return Ajaxfields.$(group);
			var selector = this.getGroupSelector();
			if (!selector) return false;
			group = this.getObject().closest(selector);
			if (group.length == 0) return false;
			this._group = group;
			return group;
		},
		
		checksResponseStatus: function(){
			return this._getProp('checkResponseStatus');
		},
		
		updatesFromResponse: function(){
			return this._getProp('updateFromResponse');
		},
		
		getResponseValueKey: function(){
			return this._getProp('responseValueKey');
		},
		
		getResponseStatusKey: function(){
			return this._getProp('responseStatusKey');
		},
		
		getCachedOptions: function(){
			return this._optionsCache;
		},
		
		updateCachedOptions: function(e){
			this._optionsCache = e;
		},
		
		getLastInputValue: function(){
			return this._lastInputValue;
		},
		
		updateLastInputValue: function(e){
			this._lastInputValue = e;
		},
		
		getOptions: function(cached){
			var field = this;
			var optionsPromise = new Promise(function(resolve, reject) {
				var optionsObj = field._getProp('options');
				var optionsCache = field.getCachedOptions();
				var optionsResult = false;
				if (cached){
					resolve(optionsCache);
				} else {
					Promise.resolve(optionsObj).then(o => {
						if (o instanceof Function){
							optionsResult = o();
						}
						if (Array.isArray(o)){
							optionsResult = o;
						}
						if (typeof o === 'string'){
							o = Function("return " + o);
							optionsResult = o();
						}
						field.updateCachedOptions(optionsResult)
						resolve(optionsResult);
					});
				}
			});
			return optionsPromise;
		},
		
		getURL: function(){
			var url = this._getProp('url');
			return Ajaxfields.baseURL(url);
		},
		
		simulateResponse: function(){
			var simulateResponse = this._getProp('simulateResponse');
			if(jQuery.isFunction(simulateResponse)){
				return simulateResponse();
			} else {
				return simulateResponse;
			}
		},
		
		isSimulation: function(){
			return (this._getProp('simulateResponse'));
		},
		
		isGhostInput: function(){
			return (this._getProp('ghostInput'));
		},
		
		isPassword: function(){
			return this.isOfType(AJAXFIELDS_TYPE_PASSWORD);
		},
		
		isSelect: function(){
			return this.isOfType(AJAXFIELDS_TYPE_SELECT);
		},
		
		isTextarea: function(){
			return this.isOfType(AJAXFIELDS_TYPE_TEXTAREA);
		},
		
		isToggle: function(){
			return this.isOfType(AJAXFIELDS_TYPE_TOGGLE);
		},
		
		isInput: function(){
			if (this.isSelect()) return false;
			if (this.isTextarea()) return false;
			return true;
		},
		
		isOfType: function(type){
			return (this._type == type);
		},
		
		isAbsolutePositioning: function(){
			return (this._getProp('absolutePositioning'));
		},
		
		getType: function(){
			return this._type;
		},
				
		getMethod: function(){
			return this._getProp('method');
		},
		
		updateSafeValue(){
			var field = this;
			return new Promise(function(resolve, reject) {
				var valPromise = field.extractVal();
				valPromise.then(val => {
					field._safeVal = val;
					resolve(val);
				});
			});
		},
		
		updateDispalyValue(response){
			var field = this;
			var val;
			return new Promise(function(resolve, reject) {
				var optionsPromise = field.getOptions(true);
				optionsPromise.then(options => {
					if (field.updatesFromResponse()){
						val = response[field.getResponseValueKey()];
					}
					if (val === undefined) {
						val = field.getLastInputValue();
					}
					var obj =field.getObject()
					if (field.isSelect()){
						obj.text(options[val]);
					} else {
						if (field.isPassword()){
							obj.text(Ajaxfields._passwordString);
						} else {
							if (field.isToggle()){
								field.updateToggleElem(val);
							} else {
								obj.text(val);
							}
						}
					}
					var updatePromise = field.updateSafeValue();
					updatePromise.then(val => {
						resolve(val);
					});
				});

			});
			
		},
		
		updateValue(explicitVal){
			var field = this;
			field.setState(AJAXFIELDS_STATE_PENDING_UPDATE);
			var val;
			if (explicitVal !== undefined){
				val = explicitVal;
			} else {
				val = field.extractInputVal();
			}
			
			if (val===field.getSafeVal()){
				field.swapToDisplay();
				return false;
			}

			if (field.isPassword() && val == ''){
				field.swapToDisplay();
				return false;
			}

			var data = {};
			
			data[this.getValueKey()] = val;
			
			field.updateLastInputValue(val);
			
			var customProps = field.getCustomProps();
			for (let k in customProps) {
				data[k] = customProps[k];
			}
			
			var id = this.getId();
			if (id){
				data[this.getIdKey()] = id;
			}
			
			var fieldname = this.getFieldname();
			if (fieldname){
				data[this.getFieldnameKey()] = fieldname;
			}
			
			var method = field.getMethod();
			var url = field.getURL();
			if (field.isSimulation()){
				field.success(field.simulateResponse());
			} else {
				field.showLoading();
				$.ajax({
					type: method,
					url: url,
					data: data,
					dataType: 'json',
					success: function (response) {						
						field.success(response, data);
					},
					error: function (xhr, ajaxOptions, thrownError) {
						field.error({}, data, xhr, thrownError);
					}
				});
			}
		},
		
		checkResponseStatus(response){
			if (!this.checksResponseStatus()) return true;
			var checkFunction = this._getProp('responseStatusCheckFunction');
			var field = this;
			return checkFunction(response, field);
		},
		
		success(response, data){
			var status = this.checkResponseStatus(response);
			if(status){
				this.updateDispalyValue(response);
			} else {
				this.error(response, data);
			}
			this._callback.success(this, response, data);
			this.complete(response);
		},
		
		error(response, data, xhr, thrownError){
			this._callback.error(this, response, data, xhr, thrownError);
			this.complete(false, data);
		},
		
		complete(response, data, quiet){
			this.hideLoading();
			this.swapToDisplay();
			this.setState(AJAXFIELDS_STATE_READY);
			if (!quiet) this._callback.complete(this, response, data);
		},
		
		createInputElem() {
			var field = this;
			return new Promise(function(resolve, reject) {
				var optionsPromise = field.getOptions();
				optionsPromise.then(options => {
					var valPromise = field.extractVal(true);
					valPromise.then(val => {
						var tag = "input";
						if (field.isSelect()) tag = "select";
						if (field.isTextarea()) tag = "textarea";
						var inputElem = $(document.createElement(tag));
						inputElem.addClass('ajaxfield_input');
						
						inputElem.on('keypress', function(e){
							if(e.which == 13 && !e.shiftKey){
								e.preventDefault();
								inputElem.blur();
							}
						});
						
						inputElem.on('focusout', function(e){
							field.updateValue();
						});
						
						let typeAttr = 'text';
						
						if (field.isOfType(AJAXFIELDS_TYPE_DATE)){
							typeAttr = 'date';
						}
						
						if (field.isOfType(AJAXFIELDS_TYPE_DATETIME)){
							typeAttr = 'datetime-local';
						}
						
						if (field.isOfType(AJAXFIELDS_TYPE_TIME)){
							typeAttr = 'time';
						}
						
						if (field.isOfType(AJAXFIELDS_TYPE_PASSWORD)){
							typeAttr = 'password';
						}
						
						if (field.isInput()){
							inputElem.attr('type', typeAttr);
						}
						
						if (field.isGhostInput()){
							inputElem.css(Ajaxfields.ghostInputCss());
						}
						
						if (field.isSelect()){
							for (var key in options) {
								var option = $(document.createElement('option'));
								option.attr('value', key);
								option.text(options[key]);
								inputElem.append(option);
							}
						}
						resolve(inputElem);
					});
				});
			});
		},
		
		createInputWrapElem() {
			var field = this;
			return new Promise(function(resolve, reject) {
				var inputElemPromise = field.createInputElem();
				inputElemPromise.then(inputElem => {
					var inputWrapElem = $(document.createElement('div'));
					inputWrapElem.addClass('ajaxfield_input_wrap');
					inputWrapElem.append(inputElem);
					resolve(inputWrapElem);
				});
			});
		},
		
		createInputWrapElem() {
			var field = this;
			return new Promise(function(resolve, reject) {
				var inputElemPromise = field.createInputElem();
				inputElemPromise.then(inputElem => {
					var inputWrapElem = $(document.createElement('div'));
					inputWrapElem.addClass('ajaxfield_input_wrap');
					inputWrapElem.append(inputElem);
					resolve(inputWrapElem);
				});
			});
		},
		
		createLoaderElem() {
			var field = this;
			var loaderWrapElem = $(document.createElement('div'));
			var loaderElem = $(document.createElement('div'));
			loaderWrapElem.addClass('ajaxfield_loader_wrap');
			var loaderCss = {
				'position' : 'absolute',
				'height' : '100%',
				'width' : '100%',
				'top' : '0',
				'left' : '0',
			};
			loaderWrapElem.css(loaderCss);
			loaderElem.css(loaderCss);
			loaderElem.addClass('ajaxfield_loader');
			loaderElem.addClass('progress-bar progress-bar-striped progress-bar-animated bg-info');
			loaderWrapElem.append(loaderElem);
			return loaderWrapElem;
		},
		
		getToggleElem() {
			var elem = this.getObjectWrap().find('.ajaxfield_toggle');
			if (elem.length == 0){
				return false;
			} else {
				return elem;
			}
		},
		
		getLoaderElem() {
			var elem = this.getObjectWrap().find('.ajaxfield_loader_wrap');
			if (elem.length == 0){
				return false;
			} else {
				return elem;
			}
		},
		
		getInputElem() {
			var elem = this.getObjectWrap().find('.ajaxfield_input');
			if (elem.length == 0){
				return false;
			} else {
				return elem;
			}
		},
		
		getInputWrapElem() {
			var elem = this.getObjectWrap().find('.ajaxfield_input_wrap');
			if (elem.length == 0){
				return false;
			} else {
				return elem;
			}
		},
		
		hideDisplay(){
			var obj = this.getObject();
			obj.css({
				'pointer-events': 'none',
				'visibility': 'hidden',
				'opacity': 0
			});
		},
		
		showDisplay(){
			var obj = this.getObject();
			obj.css({
				'pointer-events': 'all',
				'visibility': 'visible',
				'opacity': 1
			});
		},
		
		showLoading(){
			var field = this;
			var objWrap = field.getObjectWrap();
			var loader = field.createLoaderElem();
			objWrap.css('position', 'relative');
			objWrap.append(loader);
		},
		
		hideLoading(){
			var field = this;
			var objWrap = field.getObjectWrap();
			var loader = field.getLoaderElem();
			if (loader){
				loader.remove();
			}
		},
		
		swapToInput() {
			var field = this;
			var inputWrapPromise = field.createInputWrapElem();
			var canceledStatePromise = field.monitorCanceledState();
			Ajaxfields.cancelAllActiveOrPending();
			field.hideDisplay();
			field.showLoading();
			field.setState(AJAXFIELDS_STATE_PENDING_ACTIVE);
			
			Promise.race([inputWrapPromise, canceledStatePromise]).then(inputWrap => {
				if (!inputWrap){
					
				} else {
					var valPromise = field.extractVal(true);
					valPromise.then(val => {
						field.hideLoading();
						var obj = field.getObject();
						var objWrap = field.getObjectWrap();
						inputWrap.css('display', obj.css('display'));
						inputWrap.width(obj.width());
						
						objWrap.append(inputWrap);

						var input = field.getInputElem();
						input.css('width', '100%');
						if (field.isTextarea()){
							input.height(obj.height());
						}
						
						if(field.isAbsolutePositioning()){
							objWrap.css('position', 'relative');
							var objOffset = obj.offset();
							inputWrap.css('position', 'absolute'); 
							
							
							var inputPadding = {
								'top' : parseInt(input.css('padding-top')),
								'bottom' : parseInt(input.css('padding-bottom')),
								'left' : parseInt(input.css('padding-left')),
								'right' : parseInt(input.css('padding-right')),
							};
							
							var inputBorder = {
								'top' : parseInt(input.css('border-top-width')),
								'bottom' : parseInt(input.css('border-bottom-width')),
								'left' : parseInt(input.css('border-left-width')),
								'right' : parseInt(input.css('border-right-width')),
							};
							
							var outerHeight = obj.outerHeight(true);
							var innerHeight = input.height();
							innerHeight = innerHeight + inputPadding.top + inputPadding.bottom + inputBorder.top + inputPadding.bottom;
							
							var heightDistance = outerHeight-innerHeight;
							inputWrap.css('margin-top', heightDistance/2);
							
							var outerWidth = inputWrap.outerWidth(true);
							var innerWidth = inputWrap.width();
							innerWidth = innerWidth - inputPadding.left - inputPadding.right;
							var widthDistance = outerWidth-innerWidth;
							inputWrap.css('margin-left', -widthDistance);
							inputWrap.css('top', 0);
							inputWrap.css('width', objWrap.width);
						}
									
						if (field.isPassword()){
							input.val("");
						}
						input.val(val).change();
						input.focus();
						input.select();
						field.setState(AJAXFIELDS_STATE_ACTIVE);
					
					});
				}
			});
			
		},
		
		swapToDisplay() {
			var inputWrapElem = this.getInputWrapElem();
			var obj = this.getObject();
			var objWrap = this.getObjectWrap();
			objWrap.css('position', '');
			if (inputWrapElem){
				inputWrapElem.remove();
			}
			this.showDisplay();
		},
		
		extractInputVal: function () {
			var input = this.getInputElem();
			if (!input) return false;
			return input.val();
		},
		
		getToggleVal: function(){
			var field = this;
			var obj = field.getObject();
			var dataAttr = obj.data('af-toggle-active');
			var active = false;
			if (dataAttr == 1) active = true;
			return active ? 1 : 0;
		},
				
		updateToggleElem: function(explicitVal){
			var field = this;
			var obj = field.getObject();
			
			var val;
			if (explicitVal !== undefined){
				val = explicitVal;
			} else {
				val = field.getToggleVal();
			}
			var active = (val == 1);
			obj.data('af-toggle-active', val);
			var toggleElem  = field.getToggleElem();
			var checkmarkElem = toggleElem.find('svg');
			var activeClass = 'ajaxfield-toggle-active';
			if (active){
				toggleElem.addClass(activeClass);
				checkmarkElem.show();
			} else {
				toggleElem.removeClass(activeClass);
				checkmarkElem.hide();
			}
		},
		
		toggleAndUpdate: function(){
			var field = this;
			var val = 1-field.getToggleVal();
			field.updateValue(val);
		},
		
		extractVal: function (cached) {
			var field = this;
			return new Promise(function(resolve, reject) {
				var optionsPromise = field.getOptions(cached);
				optionsPromise.then(options => {
					var obj = field.getObject();
					var objText = obj.text();
					switch (field.getType()) {
						case AJAXFIELDS_TYPE_TOGGLE:
							resolve (field.getToggleVal());
							break;
						case AJAXFIELDS_TYPE_PASSWORD:
							resolve(undefined);
							break;
						case AJAXFIELDS_TYPE_SELECT:
							var val;
							for(var i in options){
								if (options[i] == objText) val = i;
							}
							resolve(val);
							break;
						default:
							resolve(objText);
					}
					resolve(false);
				});
			});
		},
		
		getObject: function () {
			return this._object;
		},
		
		getObjectWrap: function () {
			return this._object.parent();
		},
		
		_init: function (){
			this._callback.init(this);
			var field = this;
			field.updateSafeValue();
			var obj = field.getObject();
			obj.addClass('ajaxfield');
			obj.css('cursor', 'pointer');
			if (field.isTextarea()){
				obj.css('white-space', 'pre-wrap');
			}
			if (field.isToggle()){
				var toggleElem = Ajaxfields.getToggleElem();
				obj.append(toggleElem);
				obj.css('display', 'inline-block');
				obj.css('vertical-align', 'top');
				field.updateToggleElem();
				obj.on('click', function(){
					field.toggleAndUpdate();
				});
			} else {
				obj.on('click', function(){
					field.swapToInput();
				});
			}
			if (field.isPassword()){
				obj.text(Ajaxfields._passwordString);
			}
			field.setState(AJAXFIELDS_STATE_READY);
			this._callback.ready(this);
		}
		
	};
		
	document.addEventListener("DOMContentLoaded", function(event) {
		var elems = $('[data-ajaxfield]');
		elems.each(function(){
			var elem = $(this);
			var fieldData = Ajaxfields.gatherData(elem);
			new Ajaxfields.field(elem, fieldData);
		});
	});
	
	return Ajaxfields;

})));
