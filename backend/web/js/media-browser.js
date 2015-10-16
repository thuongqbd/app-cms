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
			jsonUrl : 'media/get-json', // Url to get media items with format json
			selectCallback : '', // callback function after click insert
			multipleSelect : false, // Select multi or single item
			editor: false,  // If true, selected items will be insert to edior(tinyMCE) content. If false will return json object of selected items
			canChooseFileSize : true,  // Autoload more media when sroll to bottom. If false, show link
		}, options || {});
				
		this.container = $(container);
		this.modalContainer = this.container.find('#'+containerId+'-modal');
		this.mediaUpload = this.container.find('#media-upload');
        this.mediaContainer = this.container.find('#media-container');
		this.mediaSideBar = this.container.find('#media-sidebar');
        this.mediaDetail = this.container.find('#media-detail');
        this.mediaForm = this.container.find('#media-form');	
		this.mediaItems = {
			"files": [], // JSON OBJECT OF MEDIA ITEM
			"paging":{
				"next_url":"",
				"current_page":1,
				"per_page":10
			}
		}; 
		this.selectedItems = {}; // JSON OBJECT OF SELECTED ITEM
		if (typeof settings.selectCallback == 'function') {
		  this.selectCallback = settings.selectCallback;
		}
		var _self = this;
		var firstLoaded = false;
		var init = function (){
			/* INIT*/
				
			_self.modalContainer.on("shown.bs.modal", function (e) {
				e.preventDefault();
				if(firstLoaded == false){
					_self.getData();
					firstLoaded = true;
				}			
			});
									
			initFileupload();
						
			handleSidebar();			
			handleSrolling();		
			handleSelectItem();			
			handleUpdateSelected();
			handleUpdateItem();			
			handleChangeLinkTo();
			handleDelete();
			handleFilter();
			handleInsert();
		};
				
		/* INIT FILE UPLOAD*/
		var initFileupload = function(){	
			var dropZone = _self.container.find(".dropzone");
			
			/* FILE UPLOAD CONFIGURATION */
			_self.mediaUpload.fileupload({
				url: _self.mediaUpload.data("url"),
				dropZone: dropZone,
				autoUpload: true,
				filesContainer: _self.mediaContainer,
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
		
		/* GET MEDIA DATA THAT APPEAR ON MEDIA WITHOUT FILTERING OR GET MORE*/
		this.getData = function(data,paging){
			if(paging === true){
				var url = _self.mediaItems.paging.next_url;
			}else{
				var url = settings.jsonUrl;
			}
			$.ajax({
				url: url,
				data: data || {},
				dataType: "json",
				success: function (response) {
					if(paging === true){
						_self.mediaItems.files = _self.mediaItems.files.concat(response.files);
						_self.mediaItems.paging = response.paging;
						_self.mediaContainer.append(tmpl("template-download", response));
					}else{
						_self.mediaItems = response;
						_self.modalContainer.find('.overlay').remove();
						_self.mediaContainer.html(tmpl("template-download", _self.mediaItems));
					}										
					
				}
			});
		};
		
		/* ADD ITEM TO SELECTED LIST*/
		this.addSelectedItem = function(id,data){
			this.selectedItems[id] = data;
		};
		
		var handleAddSelectedItem = function(id,ui){
			console.log('handleAddSelectedItem');
			$.each(_self.mediaItems.files, function (i, file) {
				if (id === file.id) {
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
					var data = _self.container.find("#media-form-inner").first().serializeObject();
					
					_self.addSelectedItem(id,data);
					
					_self.mediaSideBar.addClass('visible');
					
					return false;
				}
			});
		};
		
		/* REMOVE ITEM FROM SELECTED LIST*/
		this.removeSelectedItem = function(id){
			delete this.selectedItems[id];
		};
		
		var handleRemoveSelectedItem = function(id){
			_self.mediaDetail.html("");
			_self.mediaForm.html("");
			_self.removeSelectedItem(id);
			var selectedItemsIndex = Object.keys(_self.selectedItems);
			if(selectedItemsIndex.length > 0){
				var fileIndex = selectedItemsIndex[selectedItemsIndex.length - 1];
				$.each(_self.mediaItems.files, function (index, file) {
					if(file.id == fileIndex){				
						_self.mediaForm.html(tmpl('template-media-form', file));
						_self.mediaDetail.html(tmpl('template-media-detail', file));
						return false;
					}
				});	
			}else{
				_self.mediaSideBar.removeClass('visible');
			}
		};
		
		/* SHOW DETAIL ITEM */
		var handleSelectItem = function(){	
			_self.mediaContainer.on("touchstart mousedown","li", function(event, ui) {
				event.metaKey = true;
				if($(this).hasClass('ui-selected')){
					$(this).removeClass('ui-selected');
					handleRemoveSelectedItem($(this).data('id'));
					return false;
				}
			}).selectable({
				filter: "li",
				tolerance: "touch",
				selected: function (event, ui) {
					var id = $(ui.selected).data('id');
					handleAddSelectedItem(id,ui);					
				},
				unselected: function (event, ui) {
					var id = $(ui.selected).data('id');
					handleRemoveSelectedItem(id);
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
		
		/* SCROLLING */
		var handleSrolling = function(){
			var scrollContainer = _self.container.find('#media-scroll-container');
			if( ( _self.mediaContainer.height() <= scrollContainer.height() ) && _self.mediaItems.paging.next_url ){
				 _self.getData( {post_id: _self.mediaItems.post_id}, true);
			}
			scrollContainer.scroll(function(){
				if( ( ( $(this).height() * (3/2)) >= ( (this).scrollHeight - $(this).scrollTop()) ) && _self.mediaItems.paging.next_url ){
					_self.getData( {post_id: _self.mediaItems.post_id}, true);
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
				var	data  = $(this).serialize();
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
		
		init();
	   
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