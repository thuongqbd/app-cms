var MediaBrowser = {
	container : null,
	modalContainer : null,
	browserContent : '',
	selectCallback : null,
	fu : null, // FOR JQUERY FILE UPLOAD
	fc : null, // FILE CONTAINER DISPLAY
	md : null, // FOR DETAIL ITEM
	mf : null, // FOR FORM OF THE SELECTED ITEM
	url : {"json" : null , "pagination":null},  
	me : {"files": []}, // JSON OBJECT OF MEDIA ITEM
	se : {}, // JSON OBJECT OF SELECTED ITEM
	init : function(containerId,jsonUrl,paginationUrl){
		$('body').append(this.browserContent);
		this.container = $('#'+containerId);
		this.modalContainer = $('#'+containerId+' .modal').first();
		this.fu = $('#'+containerId+' #media-upload');
        this.fc = $('#'+containerId+' #file-container');
        this.md = $('#'+containerId+' #media-detail');
        this.mf = $('#'+containerId+' #media-form');	
		this.url = {"json" : jsonUrl , "pagination": paginationUrl};
		
		this.init_modal();
		this.init_fileupload(containerId);
		
		this.handle_sidebar();
		this.handle_pagin();
		this.handle_item();
		this.handle_seleted();
		this.handle_update_attribute();
		this.handle_update_link_to();
		this.handle_delete();
		this.handle_filter();
		this.handle_insert();
	},
	init_modal : function(){
		var _self = this;
		_self.resize_modal();
		
		_self.modalContainer.on("shown.bs.modal", function (e) {
			e.preventDefault();
			//_self.resize_modal();
			_self.init_data();
		});
		$( window ).resize(function() {
			_self.resize_modal();
		});
	},
	resize_modal : function(){
		var _self = this;
		var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName("body")[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;
		var dialog = _self.modalContainer.find(".modal-dialog").first();
		dialog.css({"width":(x * 0.95)+"px","height":(y * 0.8)+"px"});
		var dialog_body = dialog.find(".modal-body").first();
		dialog_body.css({"width":(x * 0.95)+"px","height":(y * 0.8)+"px"});
	},
	/* INIT FILE UPLOAD*/
	init_fileupload : function(containerId){
		var _self = this;
		var dropZone = _self.container.find(".dropzone");
		
		/* FILE UPLOAD CONFIGURATION */
		_self.fu.fileupload({
			url: _self.fu.data("url"),
			dropZone: dropZone,
			autoUpload: true,
			filesContainer: "#"+containerId+" #file-container",
			prependFiles: true
		});

		_self.fu.fileupload("option", "redirect", window.location.href.replace(/\/[^\/]*$/, "/cors/result.html?%s"));
		_self.fu.addClass("fileupload-processing");
		
		_self.modalContainer.bind("dragover", function (e) {
			var foundDropzone, timeout = window.dropZoneTimeout;

			if (!timeout)
				dropZone.addClass("in");
			else
				clearTimeout(timeout);

			var found = false, node = e.target;

			do {
				if ($(node).hasClass("dropzone")) {
					found = true;
					foundDropzone = $(node);
					break;
				}
				node = node.parentNode;
			} while (node != null);

			dropZone.removeClass("in hover");

			if (found) {
				foundDropzone.addClass("hover");
			}

			window.dropZoneTimeout = setTimeout(function () {
				window.dropZoneTimeout = null;
				dropZone.removeClass("in hover");
			}, 100);
		});

		/* ADD NEW UPLOADED FILE TO MEDIA JSON */
		_self.fu.bind("fileuploaddone", function (e, data) {
			$.each(data.result, function (index, file) {
				_self.me.files[_self.me.files.length] = file[0];
			});
		});
		
		_self.fu.bind("fileuploadstart", function (e) {
			_self.container.find("a[href='#media-library-"+containerId+"']").click();
		});
	},
	
	/* GET MEDIA DATA THAT APPEAR ON MEDIA WITHOUT FILTERING */
	init_data : function(){
		var _self = this;
		
		$.ajax({
			url: _self.url.json,
			dataType: "json",
			success: function (response) {
				_self.me = response;
				$.ajax({
					url: _self.url.pagination,
					success: function (response) {
						_self.container.find('#media-pagination').html(response);
					}
				});
				_self.modalContainer.find('.overlay').remove();
				_self.fc.html(tmpl("template-download", response));
			}
		});
	},
	
	/* SIDEBAR NAVIGATION */
	handle_sidebar : function(){
		var _self = this;
		_self.container.on('click', '.media-popup-nav', function (e) {
			e.preventDefault();
			var $this = $(this);

			$this.closest("ul").find("li").removeClass("active");
			$this.parent("li").addClass("active");

			if ($this.hasClass('all')) {
				_self.container.find('.pagination-item').removeAttr('data-post_id');
			}

			else {
				_self.container.find('.pagination-item').attr('data-post_id', $(this).data("post_id"));
			}

			$.ajax({
				url: _self.url.json,
				data: {post_id: $this.data('post_id')},
				dataType: "json",
				success: function (response) {
					_self.me = response;
					$.ajax({
						url: _self.url.pagination,
						data: {post_id: $this.data('post_id')},
						success: function (response) {
							var mp = _self.container.find(".media-pagination");
							mp.html(response);
						}
					});
				   _self.fc.html(tmpl("template-download", response));
				}
			});
		});
	},
	
	/* PAGINATION CLICK */
	handle_pagin : function(){
		var _self = this;
		_self.container.on('click', '.pagination-item', function (e) {
			e.preventDefault();

			var $this = $(this),
				p1 = $(this).data('page'),
				p2 = p1 + 1;

			$.ajax({
				url: $this.attr('href'),
				data: {post_id: $this.data('post_id')},
				dataType: "json",
				success: function (response) {
					_self.me.files = _self.me.files.concat(response.files);
					$.ajax({
						url: _self.url.pagination,
						data: {post_id: $this.data('post_id'), page: p2, 'per-page': $this.data('per-page')},
						success: function (response) {
							var mp = _self.container.find(".media-pagination");
							mp.html(response);
						}
					});
				   _self.fc.append(tmpl("template-download", response));
				}
			});
		});
	},
	
	/* SHOW DETAIL ITEM */
	handle_item : function(){
		var _self = this;		
		_self.fc.on("mousedown", function(e) {
			e.metaKey = true;
		}).selectable({
			filter: "li",
			tolerance: "fit",
			selected: function (event, ui) {
				console.log(_self.mf);
				$.each(_self.me.files, function (i, file) {
					if ($(ui.selected).data('id') === file.id) {
						_self.md.html(tmpl('template-media-detail', file));

						if(_self.fc.data('editor') == 1){
							file.for_editor = true;
						}else{
							file.for_editor = false;
						}
						_self.mf.html(tmpl('template-media-form', file));

						if(_self.fc.data('multiple') == 0){
							$(ui.selected).addClass("ui-selected").siblings().removeClass("ui-selected").each(
								function(key,value){
									$(value).find('*').removeClass("ui-selected");
								}
							);
							_self.se = {};						
						}
						_self.se[$(ui.selected).data("id")] = _self.container.find("#media-form-inner").first().serializeObject();

					}

				});
			},
			unselected: function (event, ui) {
				delete _self.se[$(ui.unselected).data('id')];
			}
		});
	},
	
	/* UPDATE SELECTED */
	handle_seleted : function(){
		var _self = this;
		_self.container.on("blur", "#media-form-inner [id^='media-']", function () {
			var parent = $(this).parents('#media-form-inner'),
				id = parent.data("id");
			_self.se[id] = parent.serializeObject();
		});
	},
	
	/* UPDATE TITLE, EXCERPT, CONTENT OF MEDIA VIA AJAX CALL */
	handle_update_attribute : function(){
		var _self = this;
		_self.container.on("blur", "#media-media_title, #media-media_excerpt, #media-media_content", function () {
			var mfi = $(this).closest('#media-form-inner');
			var attribute = $(this).data('attr');
			var mId = mfi.data("id");
			$.ajax({
				url: mfi.data("update-url"),
				type: "POST",
				dataType: 'json',
				data: {
					id: mId,
					attribute: attribute,
					attribute_value: $(this).val(),
					_csrf: yii.getCsrfToken()
				},
				success: function(response){
					$.each(_self.me.files, function (index, file) {
						if(file.id == mId){
							_self.me.files[index][attribute] = response[attribute];					
							_self.mf.html(tmpl('template-media-form', _self.me.files[index]));
							_self.md.html(tmpl('template-media-detail', _self.me.files[index]));
							return false;
						}
					});				
				}
			});
		});
	},
	
	/* UPDATE LINK TO */
	handle_update_link_to : function(){
		var _self = this;
		_self.container.on('change', '#media-media_link_to', function () {
			var link_value = _self.container.find('#media-media_link_to_value').first();
			if ($(this).val() === 'none') {
				link_value.val('');
				link_value.attr('readonly', true);
			}
			else if ($(this).val() === 'custom') {
				link_value.val('http://');
				link_value.attr('readonly', false);
			}
			else {
				link_value.val($(this).val());
			}
		});
	},
	
	/* DELETE MEDIA ITEM ON MEDIA POP UP */
	handle_delete : function(){
		var _self = this;
		_self.container.on("click", '#delete-media', function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var $this = $(this);

			if (confirm($this.data('confirm'))) {
				$.ajax({
					url: $this.data('url'),
					type: "POST",
					success: function (data) {
						_self.container.find('.media-item[data-id="' + $this.data('id') + '"]').closest('li').remove();
						_self.md.html('');
						_self.mf.html('');
						delete _self.se[$this.data('id')];
					}
				});
			}

		});
	},
	
	 /* MEDIA FILTER SUBMIT */
	handle_filter : function(){
		var _self = this;
		_self.container.on("submit", "#media-filter", function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			var $this = $(this),
				data  = $(this).serialize();
			$.ajax({
				url: _self.url.json,
				data: data,
				dataType: "json",
				success: function(response){
					_self.me = response;
					$.ajax({
						url: _self.url.pagination,
						data: data,
						success: function (response) {
							var mp = _self.container.find(".media-pagination");
							mp.html(response);
						}
					});
					_self.fc.html(tmpl("template-download", _self.me));
				}
			});
		});
	},
	
	/* INSERT INTO CONTAINER */
	handle_insert : function(){
		var _self = this;
		_self.container.on("click", "#insert-media", function (e) {
			e.preventDefault();
			if(Object.keys(_self.se).length == 0){
				return false;
			}
			/* INSERT INTO TINY MCE */
			if(top.tinymce !== undefined && $(this).data('editor') == 1){
				$.ajax({
					url: $(this).data('insert-url'),
					data: {media: _self.se, _csrf: yii.getCsrfToken()},
					type: 'POST',
					success: function(response){
						top.tinymce.activeEditor.execCommand("mceInsertContent", false, response);
						_self.modalContainer.modal('hide');
						if(typeof _self.selectCallback == 'function'){
							_self.selectCallback(response);
						}
					}
				});
			}else{
				$.ajax({
					url: $(this).data('insert-url'),
					data: {media: _self.se, _csrf: yii.getCsrfToken(),json:$(this).data('json')},
					type: 'POST',
					success: function(response){
						_self.modalContainer.modal('hide');
						if(typeof _self.selectCallback == 'function'){
							_self.selectCallback(response);
						}
					}
				});
			}
		});
	},
}