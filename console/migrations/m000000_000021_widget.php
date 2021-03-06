<?php

use yii\db\Schema;

class m000000_000021_widget extends \yii\db\Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            $tableOptions = 'CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%widget}}', [
            'id'              => Schema::TYPE_PK,
            'widget_title'    => Schema::TYPE_STRING . '(255) NOT NULL',
            'widget_config'   => Schema::TYPE_TEXT . ' NOT NULL',
            'widget_location' => Schema::TYPE_STRING . '(128) NOT NULL',
            'widget_order'    => Schema::TYPE_INTEGER . '(11) NOT NULL DEFAULT 0',
            'widget_dir'      => Schema::TYPE_STRING . '(128) NOT NULL',
            'widget_date'     => Schema::TYPE_DATETIME . ' NOT NULL',
            'widget_modified' => Schema::TYPE_DATETIME . ' NOT NULL',
        ], $tableOptions);
    }

    public function down()
    {
        $this->dropTable('{{%widget}}');
    }
}
