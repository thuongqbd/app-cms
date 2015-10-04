<?php
/**
 * @file    RenderFileManager.
 * @date    6/4/2015
 * @time    6:09 AM
 * @author  Thuong Quang <thuongqbd@gmail.com>
 * @copyright Copyright (c) 2015 WritesDown
 * @license http://www.writesdown.com/license/
 */

namespace backend\widgets\renderFileManager;

use Yii;
use yii\base\Widget;
use yii\helpers\Html;
use yii\helpers\Url;

/**
 * Class RenderFileManager to render popup file manager.
 *
 * @package backend\widgets\menubuilder
 */
class RenderFileManager extends Widget
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
    public $json = false;
	
	/**
     * @var boolean
     */
    public $multiple = true;
	
	public $buttonTag = 'button';
	
	public $buttonContent = null;
	
	public $buttonOptions = [];
	
	private $iframeUrl = null;
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
		}elseif($this->buttonTag == 'a'){
			$this->buttonOptions['href'] = 'javascript:void(0)';
		}
		$this->buttonOptions['data-toggle'] = 'modal';
		$this->buttonOptions['data-target'] = '#'.$this->id.'_modal';
		
		$rule = ['/media/popup','editor'=>$this->editor,'json'=>$this->json,'multiple'=>$this->multiple,];
		if(!empty($this->postId)){
			$rule['post_id'] =  $this->postId;
		}
		$this->iframeUrl = Url::to($rule,true);
		
		$this->buttonOptions['data-url'] = $this->iframeUrl;
	}
    /**
     * @inheritdoc
     */
    public function run()
    {
		$button = Html::tag($this->buttonTag, $this->buttonContent, $this->buttonOptions);
//		$button = Html::button('<i class="fa fa-folder-open"></i> ' . Yii::t('writesdown', 'Open Media'), ['id' => $widgetId.'_button','data-url' => $url, 'class' => 'btn btn-default btn-flat','data-toggle'=>'modal','data-target'=> '#'.$widgetId.'_modal']);
		return $this->render('renderFileManager',[
			'button' => $button,
			'iframeUrl' => $this->iframeUrl,
			'widget' => $this
		]);
    }

}