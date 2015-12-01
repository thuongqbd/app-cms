<?php
use Yii;
use \yii\web\Request;

// Replace url
$request = new Request();

$baseUrlFront = str_replace('/backend/web', '/frontend/web', $request->getBaseUrl());
$scriptUrlFront = str_replace('/backend/web', '/frontend/web', $request->getScriptUrl());

return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'components' => [
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'urlManagerFront' => [
            'class'     => 'yii\web\urlManager',
//            'scriptUrl' => $scriptUrlFront,
//            'baseUrl'   => $baseUrlFront,
            'hostInfo' => Yii::getAlias('@frontendUrl')
        ],
        'urlManagerBack'  => [
            'class' => 'yii\web\urlManager',
            'hostInfo' => Yii::getAlias('@backendUrl')
        ],
        'urlManager' =>[
            'class'=>'yii\web\UrlManager',
            'enablePrettyUrl'=>true,
            'showScriptName'=>false,
        ],
    ],
];
