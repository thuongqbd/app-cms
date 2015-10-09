<?php
/* @var $this yii\web\View */
/* @var $widget backend\widgets\mediaBrowser\MediaBrowser */

use yii\helpers\Html;
use yii\helpers\Url;
use yii\bootstrap\Nav;
use yii\bootstrap\ActiveForm;

?>
<script id="template-modal-<?= $widget->id?>" type="text/x-tmpl">
	<div class="modal fade media-modal nomargin nopadding" id="<?= $widget->id?>-modal" tabindex="-1" role="dialog">
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
					<div id="media-popup" class="media-popup">
						<div id="sidebar-left" class="sidebar-left">
							<?php
							$items[] = ['label' => 'All Media', 'url' => '#', 'options' => ['class' => 'active'], 'linkOptions' => ['class' => 'media-popup-nav all']];
							echo Nav::widget([
								'activateItems' => false,
								'options'       => ['class' => 'nav nav-pills nav-stacked'],
								'items'         => $items
							]);
							?>
						</div>
						<!-- END SIDEBAR LEFT -->

						<div id=content-wrapper">
							<div id="nav-tabs-custom" class="nav-tabs-custom">
								<?= Nav::widget([
									'items'        => [
										[
											'label'       => '<i class="fa fa-plus"></i> <span>' . Yii::t('writesdown', 'Add New Media') . '</span>',
											'url'         => '#add-new-media-'.$widget->id,
											'linkOptions' => [
												'aria-controls' => 'add-new-media',
												'role'          => 'tab',
												'data-toggle'   => 'tab'
											],
											'options'     => [
												'role' => 'presentation',
											]
										],
										[
											'label'       => '<i class="fa fa-folder-open"></i> <span>' . Yii::t('writesdown', 'Media Library') . '</span>',
											'url'         => '#media-library-'.$widget->id,
											'linkOptions' => [
												'aria-controls' => 'media-library-'.$widget->id,
												'role'          => 'tab',
												'data-toggle'   => 'tab'
											],
											'options'     => [
												'role'  => 'presentation',
												'class' => 'active'
											]
										],
									],
									'encodeLabels' => false,
									'options'      => [
										'class' => 'nav-tabs nav-primary',
										'id'    => 'nav-primary'
									],
								]); ?>
							</div>

							<div id="content" class="tab-content">
								<div id="add-new-media-<?= $widget->id?>" class="tab-pane">

									<?php $form = ActiveForm::begin([
										'options' => [
											'enctype'  => 'multipart/form-data',
											'id'       => 'media-upload',
											'data-url' => Url::to(['/media/ajax-upload',
												'post_id' => isset($post) ? $post->id : null
											])
										],
										'action'  => Url::to(['/site/forbidden']),
									]); ?>

									<noscript>
										<?= Html::hiddenInput('redirect', Url::to(['/site/forbidden'])); ?>
									</noscript>

									<div class="dropzone fade">
										<div class="dropzone-inner">
											<?= Yii::t('writesdown', 'Drop files here'); ?> <br/>
											<?= Yii::t('writesdown', 'OR'); ?><br/>
										<span class="btn btn-default btn-flat fileinput-button">
											<i class="glyphicon glyphicon-plus"></i>
											<span><?= Yii::t('writesdown', 'Add files...'); ?></span>
											<?= $form->field($model, 'file', ['template' => '{input}', 'options' => ['class' => '']])->fileInput(['multiple' => 'multiple']); ?>
										</span>
										</div>
									</div>

									<?php ActiveForm::end(); ?>

								</div>
								<div id="media-library-<?= $widget->id?>" class="tab-pane active media-library">
									<div class="content-left col-xs-8 nopadding">

										<form id="media-filter" class="media-filter"
											data-url="<?= Url::to('/media/get-json'); ?>"
											method="post" action="<?= Url::to(['/site/forbidden']); ?>">
											<div class="row">
												<div class="col-xs-5 form-group">
													<?= Html::dropDownList('type', null, $widget->getTypeFilter(), [
														'id'=>'type-filter',
														'prompt' => Yii::t('writesdown', 'All media items'),
														'class'=>'type-filter input-sm form-control'
														])?>
												</div>
												<div class="col-xs-5 input-group input-group-sm">
												<?= Html::textInput('title', null, [
														'placeholder' => Yii::t('writesdown', 'Search'),
														'class'       => 'input-sm form-control flat',
													]); ?>
													<span class="input-group-btn">
														<?= Html::submitButton('<i class="fa fa-search"></i>', [
															'class' => 'btn btn-sm btn-default btn-flat flat'])
														?>
													</span>
												</div>
											</div>
										</form>
										<div class="content-container">
											<ul id="media-container" class="media-container clearfix" data-multiple="<?= $widget->multiple?1:0?>" data-editor="<?= $widget->editor?1:0?>"></ul>
											<div id="media-pagination" class="media-pagination clearfix"></div>
										</div>
									</div>

									<div class="content-right col-xs-4">
										<div id="media-detail" class="media-detail"></div>
										<div id="media-form" class="media-form"></div>
									</div>

									<div id="content-footer" class="content-footer">

										<?= Html::button(Yii::t('writesdown', 'Insert Media'), [
											'id'              => 'insert-media',
											'class'           => 'insert-media btn btn-primary pull-right btn-flat',
											'data-insert-url' => $widget->editor ?
												Url::to(['/media/editor-insert']) :
												Url::to(['/media/field-insert']),
											'data-editor' => $widget->editor ?'1':'0'
										]); ?>

									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</script>

<script id="template-upload" type="text/x-tmpl">
{% if (o.files) { %}
    {% for (var i=0, file; file=o.files[i]; i++) { %}
        <li class="fade media-item">
            <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div class="progress-bar progress-bar-success" style="width:0%;"></div>
            </div>
        </li>
    {% } %}
{% } %}
</script>

<script id="template-download" type="text/x-tmpl">
{% if (o.files) { %}
    {% for (var i=0, file; file=o.files[i]; i++) { %}
        {% if (file.media_icon_url) { %}
            <li class="media-item" data-id={%=file.id%} id={%=file.id%}>
                <div class="item">
                    <img src="{%=file.media_icon_url%}">
                    {% if(file.render_type != 'image') { %}<span class="media-description">{%=file.media_title%}</span>{% } %}
                    <span class="selected-check"><i class="fa fa-check"></i><span>
                </div>
            </li>
        {% } %}
    {% } %}
{% } %}
</script>

<script id="template-media-detail" type="text/x-tmpl">
    <h3><?= Yii::t('writesdown', 'MEDIA DETAILS') ?></h3>
    <div class="media">
        <div class="media-left">
            <img alt="{%=o.media_title%}" style="width: 80px; height: 80px;" src="{%=o.media_icon_url%}">
        </div>
        <div class="media-body">
            <h4 class="media-heading">{%=o.media_filename%}</h4>
            <div class="date">{%=o.media_date_formatted%}</div>
            <div class="file-size">{%=o.media_readable_size%}</div>
            <a id="delete-media" class="text-danger delete-media" href="#" data-url="{%=o.media_delete_url%}" data-id="{%=o.id%}"
                data-confirm="<?= Yii::t('writesdown', 'Are you sure want to do this?'); ?>">
                <i class="glyphicon glyphicon-trash"></i> <?= Yii::t('writesdown', 'Delete'); ?>
            </a>
        </div>
    </div>
</script>

<script id="template-media-form" type="text/x-tmpl">
    <form class="form-horizontal" action="<?= Url::to(['/site/forbidden']) ?>"
        data-id="{%=o.id%}" id="media-form-inner" method="post"
        data-update-url="<?php echo Url::to(['/media/ajax-update']) ?>">
        <input type="hidden" id="media-id" value="{%=o.id%}" name="id">
        <input type="hidden" id="media-media_type" value="{%=o.media_render_type%}" name="media_type">

        <div class="form-group">
            <label for="media-media_url" class="col-sm-4 control-label"><?= Yii::t('writesdown', 'URL'); ?></label>
            <div class="col-sm-8">
                <input type="text" class="form-control input-sm" id="media-media_url" placeholder="url"
                    value="{%=o.media_versions.full.url%}" readonly="true" name="media_url">
            </div>
        </div>

        <div class="form-group">
            <label for="media-media_title" class="col-sm-4 control-label"><?= Yii::t('writesdown', 'Title'); ?></label>
            <div class="col-sm-8">
                <input type="text" class="form-control input-sm" id="media-media_title" data-attr="media_title"
                    placeholder="Title" value="{%=o.media_title%}" name="media_title">
            </div>
        </div>

        <div class="form-group">
            <label for="media-media_excerpt" class="col-sm-4 control-label"><?= Yii::t('writesdown', 'Caption'); ?></label>
            <div class="col-sm-8">
                <textarea class="form-control input-sm" id="media-media_excerpt" data-attr="media_excerpt"
                    placeholder="Caption" name="media_excerpt">{%=o.media_excerpt%}</textarea>
            </div>
        </div>

        <div class="form-group">
            <label for="media-media_content" class="col-sm-4 control-label"><?= Yii::t('writesdown', 'Description'); ?></label>
            <div class="col-sm-8">
                <textarea class="form-control input-sm" id="media-media_content" data-attr="media_content"
                    placeholder="Descrption" name="media_content">{%=o.media_content%}</textarea>
            </div>
        </div>
		
		{% if (o.for_editor == true) { %}
			<h4><?= Yii::t('writesdown', 'MEDIA DISPLAY SETTINGS'); ?></h4>

			{% if (o.media_render_type == 'image') { %}
				<div class="form-group">
					<label for="media-media_alignment" class="col-sm-4 control-label">
						<?= Yii::t('writesdown', 'Alignment'); ?>
					</label>
					<div class="col-sm-8">
						<select class="form-control input-sm" id="media-media_alignment" name="media_alignment">
							<option value="align-left"><?= Yii::t('writesdown', 'Left'); ?></option>
							<option value="align-center"><?= Yii::t('writesdown', 'Center'); ?></option>
							<option value="align-right"><?= Yii::t('writesdown', 'Right'); ?></option>
							<option value="align-none"><?= Yii::t('writesdown', 'None'); ?></option>
						</select>
					</div>
				</div>
			{% } %}

			<div class="form-group">
				<label for="media-media_link_to" class="col-sm-4 control-label">
					<?= Yii::t('writesdown', 'Link To'); ?>
				</label>
				<div class="col-sm-8">
					<select class="form-control input-sm" id="media-media_link_to" name="media_link_to">
						<option value="{%=o.media_view_url%}"><?= Yii::t('writesdown', 'Media') ?></option>
						<option value="<?= Yii::$app->urlManagerFront->baseUrl . '/uploads/'; ?>{%=o.media_versions.full.url%}">File</option>

						{% if (o.media_render_type == 'image') { %}
							<option value="custom"><?= Yii::t('writesdown', 'Custom URL') ?></option>
							<option value="none"><?= Yii::t('writesdown', 'None') ?></option>
						{% } %}

					</select>
					<input type="text" class="form-control input-sm" id="media-media_link_to_value" placeholder="Link to"
						value="{%=o.media_view_url%}" style="margin-top: 2px;" readonly="true" name="media_link_to_value">
				</div>
			</div>

			{% if (o.media_render_type == 'image') { %}
				<div class="form-group">
					<label for="media-media_size" class="col-sm-4 control-label"><?= Yii::t('writesdown', 'Size'); ?></label>
					<div class="col-sm-8">
						<select class="form-control input-sm" id="media-media_size" name="media_size">
							{% for (var i=0; i<o.media_size.length; i++) { %}
								<option value="{%=o.media_size[i].version%}">{%=o.media_size[i].version%} {%=o.media_size[i].width%}x{%=o.media_size[i].height%}</option>
							{% } %}
						</select>
					</div>
				</div>
			{% } %}
		{% } %}
    </form>
</script>
