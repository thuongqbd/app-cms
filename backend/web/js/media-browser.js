(function($) {
   function MediaBrowser(container,options) {
		this.container = $(container);
		var containerId = this.container.attr('id');
		var settings = $.extend({
			templates : {
				modalContent : 'template-modal-'+containerId,
				download : 'template-download',
				detail: 'template-media-detail',
				form: 'template-media-form'
			},
			jsonUrl : 'media/get-json',
			paginationUrl : 'media/get-pagination',
			selectCallback : '',
			multipleSelect : false,
			editor: false,
			canChooseFileSize : true
		}, options || {});
				
		this.container = $(container);
		this.modalContainer = this.container.find('#'+containerId+'-modal');
		this.mediaUpload = this.container.find('#media-upload');
        this.mediaContainer = this.container.find('#media-container');
        this.mediaDetail = this.container.find('#media-detail');
        this.mediaForm = this.container.find('#media-form');	
		this.mediaItems = {"files": []}; // JSON OBJECT OF MEDIA ITEM
		this.selectedItems = {}; // JSON OBJECT OF SELECTED ITEM
		if (typeof settings.selectCallback == 'function') {
		  this.selectCallback = settings.selectCallback;
		}
		var _self = this;
		this.init = function (){
			/* INIT*/
			this.resizeModal();			
			this.modalContainer.on("shown.bs.modal", function (e) {
				e.preventDefault();
				//_self.resize_modal();
				_self.getData();
			});
			$( window ).resize(function() {
				_self.resizeModal();
			});
			initFileupload();
			handleSidebar();			
			handlePaging();		
			handleSelectItem();			
			handleUpdateSelected();
			handleUpdateItem();			
			handleChangeLinkTo();
			handleDelete();
			handleFilter();
			handleInsert();
		};
		
		this.resizeModal = function(){
			var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName("body")[0],
			x = w.innerWidth || e.clientWidth || g.clientWidth,
			y = w.innerHeight|| e.clientHeight|| g.clientHeight;
			var dialog = this.modalContainer.find(".modal-dialog").first();
			dialog.css({"width":(x * 0.95)+"px","height":(y * 0.8)+"px"});
			var dialog_body = dialog.find(".modal-body").first();
			dialog_body.css({"width":(x * 0.95)+"px","height":(y * 0.8)+"px"});
		};
		
		/* INIT FILE UPLOAD*/
		var initFileupload = function(){	
			var dropZone = _self.container.find(".dropzone");
			
			/* FILE UPLOAD CONFIGURATION */
			_self.mediaUpload.fileupload({
				url: _self.mediaUpload.data("url"),
				dropZone: dropZone,
				autoUpload: true,
				filesContainer: "#"+containerId+" #file-container",
				prependFiles: true
			});

			_self.mediaUpload.fileupload("option", "redirect", window.location.href.replace(/\/[^\/]*$/, "/cors/result.html?%s"));
			_self.mediaUpload.addClass("fileupload-processing");
			
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
			_self.mediaUpload.bind("fileuploaddone", function (e, data) {
				$.each(data.result, function (index, file) {
					_self.mediaItems.files[_self.mediaItems.files.length] = file[0];
				});
			});
			
			_self.mediaUpload.bind("fileuploadstart", function (e) {
				_self.container.find("a[href='#media-library-"+containerId+"']").click();
			});

		};
		
		/* GET MEDIA DATA THAT APPEAR ON MEDIA WITHOUT FILTERING */
		this.getData = function(data){
			$.ajax({
				url: settings.jsonUrl,
				data: data || {},
				dataType: "json",
				success: function (response) {
					_self.mediaItems = response;
					$.ajax({
						url: settings.paginationUrl,
						data: data || {},
						success: function (response) {
							_self.container.find('#media-pagination').html(response);
						}
					});
					_self.modalContainer.find('.overlay').remove();
					_self.mediaContainer.html(tmpl("template-download", _self.mediaItems));
				}
			});
		};
		
		/* SIDEBAR NAVIGATION */
		var handleSidebar = function(){
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
				
				_self.getData({post_id: $this.data('post_id')});
			});
		};
		
		/* PAGINATION CLICK */
		var handlePaging = function(){
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
						_self.mediaItems.files = _self.mediaItems.files.concat(response.files);
						$.ajax({
							url: settings.paginationUrl,
							data: {post_id: $this.data('post_id'), page: p2, 'per-page': $this.data('per-page')},
							success: function (response) {
								var mp = _self.container.find(".media-pagination");
								mp.html(response);
							}
						});
					   _self.mediaContainer.append(tmpl("template-download", response));
					}
				});
			});
		};
		
		/* SHOW DETAIL ITEM */
		var handleSelectItem = function(){	
			_self.mediaContainer.on("mousedown", function(e) {
				e.metaKey = true;
			}).selectable({
				filter: "li",
				tolerance: "fit",
				selected: function (event, ui) {
					console.log(_self.mediaForm);
					$.each(_self.mediaItems.files, function (i, file) {
						if ($(ui.selected).data('id') === file.id) {
							_self.mediaDetail.html(tmpl('template-media-detail', file));

							if(_self.mediaContainer.data('editor') == 1){
								file.for_editor = true;
							}else{
								file.for_editor = false;
							}
							_self.mediaForm.html(tmpl('template-media-form', file));

							if(settings.multipleSelect != true){
								$(ui.selected).addClass("ui-selected").siblings().removeClass("ui-selected").each(
									function(key,value){
										$(value).find('*').removeClass("ui-selected");
									}
								);
								_self.selectedItems = {};						
							}
							_self.selectedItems[$(ui.selected).data("id")] = _self.container.find("#media-form-inner").first().serializeObject();

						}

					});
				},
				unselected: function (event, ui) {
					delete _self.selectedItems[$(ui.unselected).data('id')];
				}
			});
		};
		
		/* UPDATE SELECTED */
		var handleUpdateSelected = function(){
			_self.container.on("blur", "#media-form-inner [id^='media-']", function () {
				var parent = $(this).parents('#media-form-inner'),
					id = parent.data("id");
				_self.selectedItems[id] = parent.serializeObject();
			});
		};
		
		/* UPDATE TITLE, EXCERPT, CONTENT OF MEDIA VIA AJAX CALL */
		var handleUpdateItem = function(){
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
						$.each(_self.mediaItems.files, function (index, file) {
							if(file.id == mId){
								_self.mediaItems.files[index][attribute] = response[attribute];					
								_self.mediaForm.html(tmpl('template-media-form', _self.mediaItems.files[index]));
								_self.mediaDetail.html(tmpl('template-media-detail', _self.mediaItems.files[index]));
								return false;
							}
						});				
					}
				});
			});
		};
		
		/* UPDATE LINK TO */
		var handleChangeLinkTo = function(){
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
		};
		
		/* DELETE MEDIA ITEM ON MEDIA POP UP */
		var handleDelete = function(){
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
							_self.mediaDetail.html('');
							_self.mediaForm.html('');
							delete _self.selectedItems[$this.data('id')];
						}
					});
				}

			});
		};
			
		 /* MEDIA FILTER SUBMIT */
		var handleFilter = function(){
			_self.container.on("submit", "#media-filter", function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				var $this = $(this),
					data  = $(this).serialize();
				_self.getData(data);
			});
		};
		
		/* INSERT INTO CONTAINER */
		var handleInsert = function(){
			_self.container.on("click", "#insert-media", function (e) {
				e.preventDefault();
				if(Object.keys(_self.selectedItems).length == 0){
					return false;
				}
				/* INSERT INTO TINY MCE */
				if(typeof settings.editor == 'object' && $(this).data('editor') == 1){
					$.ajax({
						url: $(this).data('insert-url'),
						data: {media: _self.selectedItems, _csrf: yii.getCsrfToken()},
						type: 'POST',
						dataType : 'json',
						success: function(response){
							if(response.success){
								settings.editor.activeEditor.execCommand("mceInsertContent", false, response.data);
								_self.modalContainer.modal('hide');
								if(typeof _self.selectCallback == 'function'){
									_self.selectCallback(response);
								}
							}
						}
					});
				}else{
					$.ajax({
						url: $(this).data('insert-url'),
						data: {media: _self.selectedItems, _csrf: yii.getCsrfToken()},
						type: 'POST',
						dataType : 'json',
						success: function(response){
							_self.modalContainer.modal('hide');
							if(typeof _self.selectCallback == 'function'){
								_self.selectCallback(response);
							}
						}
					});
				}
			});
		};
		
	   this.init();
   };
   
   $.fn.mediabrowser = function(options)
   {
       return this.each(function()
       {
           var element = $(this);
          
           // Return early if this element already has a plugin instance
           if (element.data('mediabrowser')) return;

           var mediabrowser = new MediaBrowser(this,options);

           // Store plugin object in this element's data
           element.data('mediabrowser', mediabrowser);
       });
   };
}(jQuery));