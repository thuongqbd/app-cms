<?php
/**
 * @file      view-image.php.
 * @date      6/4/2015
 * @time      10:32 PM
 * @author    Agiel K. Saputra <13nightevil@gmail.com>
 * @copyright Copyright (c) 2015 WritesDown
 * @license   http://www.writesdown.com/license/
 */

use frontend\assets\CommentAsset;
use yii\helpers\Html;

/* @var $this yii\web\View */
/* @var $media common\models\Media */
/* @var $metadata [] */
/* @var $comment common\models\MediaComment */

$this->title = $media->media_title;
$this->params['breadcrumbs'][] = ['label' => Yii::t('writesdown', 'Media'), 'url' => ['index']];
if ($media->mediaPost) {
    $this->params['breadcrumbs'][] = ['label' => $media->mediaPost->post_title, 'url' => $media->mediaPost->url];
}
$this->params['breadcrumbs'][] = $this->title;

CommentAsset::register($this);
?>
<div class="single media-view">

    <article class="hentry">
        <header class="entry-header">
            <h1 class="entry-title"><?= $media->media_title ?></h1>
            <?php $updated = new \DateTime($media->media_modified, new DateTimeZone(Yii::$app->timeZone)); ?>
            <div class="entry-meta">
                <span class="entry-date">
                    <a rel="bookmark" href="<?= $media->url; ?>">
                        <time datetime="<?= $updated->format('r'); ?>"
                              class="entry-date"><?= Yii::$app->formatter->asDate($media->media_date); ?></time>
                    </a>
                </span>
                <span class="byline">
                    <span class="author vcard">
                        <a rel="author" href="<?= $media->mediaAuthor->url; ?>"
                           class="url fn"><?= $media->mediaAuthor->display_name; ?></a>
                    </span>
                </span>
                <span class="comments-link">
                    <a title="<?= Yii::t('writesdown', 'Comment on Kombikongo Post 1'); ?>"
                       href="<?= $media->url ?>#respond"><?= Yii::t('writesdown', 'Leave a comment'); ?></a>
                </span>
            </div>
        </header>
        <div class="entry-content">
            <div class="media-caption">
                <?= Html::a(
                    Html::img($media->uploadUrl . $metadata['media_versions']['full']['url'], [
                        'alt'    => $media->media_title,
                        'class'  => 'thumbnail',
                        'width'  => $metadata['media_versions']['full']['width'],
                        'height' => $metadata['media_versions']['full']['height'],
                    ]), $media->uploadUrl . $metadata['media_versions']['full']['url']);
                ?>
                <div class="media-caption-text">
                    <?= $media->media_excerpt; ?>
                </div>
                <div class="media-content">
                    <?= $media->media_content; ?>
                </div>
            </div>
            <?= $media->mediaPost ? Html::tag('h3', Html::a(Yii::t('writesdown', 'Back to ') . $media->mediaPost->post_title, $media->mediaPost->url)) : ''; ?>
        </div>
    </article>
    <?= $this->render('/media-comment/comments', ['media' => $media, 'comment' => $comment]); ?>
</div>
