<?php
/**
 * @file    MediaBrowser.
 * @date    6/4/2015
 * @time    6:09 AM
 * @author  Thuong Quang <thuongqbd@gmail.com>
 * @copyright Copyright (c) 2015 WritesDown
 */

namespace backend\widgets\mediaBrowser;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use yii\helpers\Url;
use common\models\Media;
use common\models\Post;
use backend\assets\MediaBrowserAsset;

/**
 * Class MediaBrowser to render popup file manager.
 *
 * @package backend\widgets\mediaBrowser
 */
class MediaBrowser extends Widget
{
    /**
     * @var integer
     */
    public $postId = null;
	
	/**
     * @var boolean
     */
    public $editor = false;
	
	/**
     * @var boolean
     */
    public $multiple = true;
	
	public $buttonTag = 'button';
	
	public $buttonContent = null;
	
	public $buttonOptions = [];
	
	public $pluginOptions = [];
	
	public $selectCallback = null;
	/**
     * @inheritdoc
     */
    public function init()
	{
		if(empty($this->buttonContent)){
			$this->buttonContent = '<i class="fa fa-folder-open"></i> ' . Yii::t('writesdown', 'Open Media');
		}
		if($this->buttonTag == 'button'){
			$this->buttonOptions['type'] = 'button';
		}elseif($this->buttonTag == 'a' && empty ($this->buttonOptions['href'])){
			$this->buttonOptions['href'] = '#';
		}
		$this->buttonOptions['data-toggle'] = 'modal';
		$this->buttonOptions['data-target'] = '#'.$this->id.'-modal';
		
		if(empty($this->pluginOptions['jsonUrl'])){
			$this->pluginOptions['jsonUrl'] = Url::to(['media/get-json']);
		}

		if(empty($this->pluginOptions['containerId'])){
			$this->pluginOptions['containerId'] = $this->id;
		}
		if(empty($this->pluginOptions['containerId'])){
			$this->pluginOptions['containerId'] = $this->id;
		}
	}
    /**
     * @inheritdoc
     */
    public function run()
    {
		$model = new Media(['scenario' => 'upload']);
						
		$renderData = [
			'model'  => $model,
			'widget' => $this,
		];
        if ($this->postId) {
            if ($post = Post::findOne($this->postId)) {
                $renderData['post'] = $post;
            } else {
                return '';
            }
        }
		
		$view = $this->getView();
		MediaBrowserAsset::register($view);
		
		$jsOptions = \yii\helpers\Json::encode($this->pluginOptions);
		
//		$js = <<<EOD
//			$('body').append(tmpl("template-modal", {}));
//			var $this->id = $('#$this->id').mediabrowser({
//				containerId:'$this->id',
//				jsonUrl : '$getJson',
//				paginationUrl : '$getPagin',
//				selectCallback : function(data){
//					console.log(data);
//				},
//				editor : top.tinymce
//			});
//			console.log($this->id);	
//EOD;
		$js = <<<EOD
			$('body').append('<div id="$this->id">'+tmpl("template-modal-$this->id", {})+'</div>');
			var $this->id = $('#$this->id').mediabrowser($jsOptions);
			console.log($this->id);	
EOD;
		$view->registerJs($js);
		
		$button = Html::tag($this->buttonTag, $this->buttonContent, $this->buttonOptions);
		$result = $button.$this->render('_media-browser',$renderData);
        return $result;

    }
	
	public function getTypeFilter(){
		$listType =  [
			'uploaded' => Yii::t('writesdown', 'Uploaded to this page'),
            'image'			=> Yii::t('writesdown', 'Image'),
            'audio'			=> Yii::t('writesdown', 'Audio'),
            'video'			=> Yii::t('writesdown', 'Video'),
            'pdf'			=> Yii::t('writesdown', 'Pdf'),
            'spreadsheet'	=> Yii::t('writesdown', 'Spreadsheet'),
            'document'		=> Yii::t('writesdown', 'Document'),
            'archive'		=> Yii::t('writesdown', 'Archive'),
            'code'			=> Yii::t('writesdown', 'Code'),
            'interactive'	=> Yii::t('writesdown', 'Interactive'),
            'text'			 => Yii::t('writesdown', 'Text'),
        ];
		if($this->postId){
			$listType = ['uploaded' => Yii::t('writesdown', 'Uploaded to this page')] + $listType;
		}
		
		return $listType;
	}

}