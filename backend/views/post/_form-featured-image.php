<?php
/**
 * @file    _form-term.php.
 * @date    6/4/2015
 * @time    6:14 AM
 * @author  Agiel K. Saputra <13nightevil@gmail.com>
 * @copyright Copyright (c) 2015 WritesDown
 * @license http://www.writesdown.com/license/
 */

use yii\helpers\Url;
use yii\helpers\Html;
use common\models\Media;

/* @var $this yii\web\View */
/* @var $model common\models\Post */
/* @var $form yii\widgets\ActiveForm */
$buttonContent = Yii::t('writesdown', 'Set featured image');
if($media = $model->postFeaturedImage){
	$metadata = $media->getMeta('metadata');
	$ImageUrl = $media->getUploadUrl() . $metadata['media_versions']['medium']['url'];
	$buttonContent = Html::img($ImageUrl,['class'=>'img-thumbnail','id'=>'post-thumbnail']);
}

?>
<div class="box box-primary">
	<div class="box-header with-border">
		<h3 class="box-title"><?= Yii::t('writesdown', 'Featured Image'); ?></h3>

		<div class="box-tools pull-right">
			<button data-widget="collapse" class="btn btn-box-tool"><i class="fa fa-minus"></i></button>
		</div>
	</div>

	<div class="box-body">
		<?php if (Yii::$app->user->can('author')) {
			echo backend\widgets\mediaBrowser\MediaBrowser::widget([
				'id' => 'media_browser_featured',
				'postId'=>$model->id,
				'editor' => false,
				'multiple'=>false,
				'buttonTag' => 'a',
				'buttonContent' => $buttonContent,
				'buttonOptions' => [
					'id' => 'set-post-thumbnail'
				],
				'pluginOptions' => [
					'selectCallback' => new \yii\web\JsExpression('function(response){
					var uploadUrl = "'.Media::getUploadUrl().'";
					console.log(response);
					if(response.data){
						var media = response.data[0];
						$("#post-post_featured").val(media.id);
						$("#set-post-thumbnail").html("<img class=\'img-thumbnail\' id=\'post-thumbnail\' src=\'"+uploadUrl+media.media_versions.medium.url+"\'/>");
						$("#remove-post-thumbnail").show();
					}
				}')
				]
				]);
        } ?>
		<?= $form->field($model, 'post_featured')->label(false)->hiddenInput() ?>
		
	</div>
	<div class="box-footer">&nbsp;
		<a href="#" id="remove-post-thumbnail" style="<?= $media?'':'display: none'?>"><?= Yii::t('writesdown', 'Remove featured image')?></a>
	</div>
</div>
<?php $this->registerJs('
$(function () {
    "use strict";
	$("#remove-post-thumbnail").on("click", function (e) {
		e.preventDefault();
		$("#post-post_featured").val("");
		$("#set-post-thumbnail").html("'.Yii::t('writesdown', 'Set featured image').'");
		$(this).hide();
	})
});
');