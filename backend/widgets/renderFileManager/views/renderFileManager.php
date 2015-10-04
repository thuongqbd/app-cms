<?php
/* @var $this yii\web\View */
/* @var $widget backend\widgets\renderFileManager\RenderFileManager */

use yii\helpers\Url;
use yii\helpers\Html;

?>
<div class="form-group">
	<?= $button?>
	<div class="modal fade" id="<?= $widget->id?>_modal" tabindex="-1" role="dialog" data-url="<?= $iframeUrl?>">
		<div class="modal-dialog modal-lg" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h4 class="modal-title" id="myModalLabel"><?= Yii::t('writesdown', 'Media Browser')?></h4>
				</div>
				<div class="modal-body nopadding overlay-wrapper">
					<div class="overlay">
						<i class="fa fa-refresh fa-spin"></i>
					</div>
					<iframe id="<?= $widget->id?>_iframe" frameBorder="0"></iframe>
				</div>
			</div>
		</div>
	</div>
</div>

<?php $this->registerJs('
$(function () {
    "use strict";
	var '.$widget->id.'_iframe = $("#'.$widget->id.'_iframe");
	'.$widget->id.'_iframe.load(function(){
		$(this).closest(".modal").find(".overlay").remove();
        $(this).contents().on("click","#insert-media",function(){
			$("#'.$widget->id.'_modal").modal("hide");
		});
    });
	$("#'.$widget->id.'_modal").on("shown.bs.modal", function (e) {
		e.preventDefault();
		var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName("body")[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight;
		if(typeof  '.$widget->id.'_iframe.attr("src") == "undefined"){
			'.$widget->id.'_iframe.attr("width",x * 0.95).attr("height",y * 0.95).attr("src",$(this).data("url"));
			var dialog = $(this).find(".modal-dialog").first();
			dialog.css({"width":(x * 0.95)+"px","height":(y * 0.95)+"px"});
		}
	});
	
});
');
