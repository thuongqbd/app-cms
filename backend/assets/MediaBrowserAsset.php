<?php
/**
 * @file      MediaBrowserAsset.php.
 * @date    6/4/2015
 * @time    6:09 AM
 * @author  Thuong Quang <thuongqbd@gmail.com>
 * @copyright Copyright (c) 2015 WritesDown
 */

namespace backend\assets;

use yii\web\AssetBundle;

/**
 * Asset bundle for popup media.
 *
 * @package backend\assets
 * @author  Thuong Quang <thuongqbd@gmail.com>
 * @since   0.1.0
 */
class MediaBrowserAsset extends AssetBundle
{
    /**
     * @var string
     */
    public $basePath = '@webroot';
    /**
     * @var string
     */
    public $baseUrl = '@web';
    /**
     * @var array
     */
    public $css = [
        'css/media-browser.css'
    ];
    /**
     * @var array
     */
    public $js = [
        'js/media-browser.js'
    ];
    /**
     * @var array
     */
    public $depends = [
        'backend\assets\AppAsset',
        'yii\jui\JuiAsset',
        'dosamigos\fileupload\FileUploadUIAsset'
    ];
} 