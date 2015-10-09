<?php
/**
 * @file      _form.php.
 * @date      6/4/2015
 * @time      6:13 AM
 * @author    Agiel K. Saputra <13nightevil@gmail.com>
 * @copyright Copyright (c) 2015 WritesDown
 * @license   http://www.writesdown.com/license/
 */

use yii\helpers\Html;
use yii\helpers\Url;
use codezeen\yii2\tinymce\TinyMce;

/* @var $this yii\web\View */
/* @var $model common\models\Post */
/* @var $form yii\widgets\ActiveForm */
?>

    <div class="post-form">

        <?= $form->field($model, 'post_title', ['template' => '{input}{error}'])->textInput([
            'placeholder' => $model->getAttributeLabel('post_title')
        ]) ?>

        <?= $form->field($model, 'post_slug', [
            'template' => '<span class="input-group-addon">' . $model->getAttributeLabel('post_slug') . '</span>{input}',
            'options'  => [
                'class' => 'input-group form-group input-group-sm'
            ],
        ])->textInput(['maxlength' => 255, 'placeholder' => $model->getAttributeLabel('post_slug')]) ?>

        <?php if (Yii::$app->user->can('author')) {
            echo '<div class="form-group">';
			echo backend\widgets\mediaBrowser\MediaBrowser::widget([
					'id' => 'media_browser_content',
					'postId'=>$model->id,
					'editor' => true,
					'buttonOptions' => [
						'class' => 'btn btn-default btn-flat',
					],
					'pluginOptions' => [
						'multipleSelect' => true,
						'editor' => new \yii\web\JsExpression('top.tinymce')
					]
				]);
            echo '</div>';				
        } ?>

        <?= $form->field($model, 'post_content', ["template" => "{input}\n{error}"])->widget(
            TinyMce::className(),
            [
                'compressorRoute' => 'helper/tiny-mce-compressor',
                'settings'        => [
					'plugins'                => [
						"advlist autolink lists link image charmap print preview hr anchor pagebreak",
						"searchreplace visualblocks visualchars code fullscreen",
						"insertdatetime media nonbreaking save table contextmenu directionality",
						"template paste textcolor youtube"
					],
//					'toolbar'                => "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image youtube media| print preview media | forecolor backcolor | code fullscreen",
                    'menubar'            => false,
                    'skin_url'           => Yii::$app->urlManager->baseUrl . '/editor-skins/writesdown',
                    'toolbar_items_size' => 'medium',
                    'toolbar'            => "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | code fullscreen",
                    'formats'            => [
                        'alignleft'   => ['selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', 'classes' => 'align-left'],
                        'aligncenter' => ['selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', 'classes' => 'align-center'],
                        'alignright'  => ['selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', 'classes' => 'align-right'],
                        'alignfull'   => ['selector' => 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', 'classes' => 'align-full']
                    ],
					'extended_valid_elements' => "iframe[src|width|height|name|align]"
                ],
                'options'         => [
                    'style' => 'height:400px;'
                ],
            ]
        ) ?>

    </div>

<?php $this->registerJs('
//$(function () {
//    "use strict";
//    $(".open-editor-media ").click(function (e) {
//        e.preventDefault();
//        var w = window,
//            d = document,
//            e = d.documentElement,
//            g = d.getElementsByTagName("body")[0],
//            x = w.innerWidth || e.clientWidth || g.clientWidth,
//            y = w.innerHeight|| e.clientHeight|| g.clientHeight;
//
//        tinyMCE.activeEditor.windowManager.open({
//            file : $(this).data("url"),
//            title : "'.Yii::t('writesdown', 'Filemanager').'",
//            width : x * 0.95,
//            height : y * 0.9,
//            resizable : "yes",
//            inline : "yes",
//            close_previous : "no"
//        });
//    });
//});
');