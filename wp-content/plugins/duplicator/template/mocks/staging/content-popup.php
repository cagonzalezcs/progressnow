<?php

defined("ABSPATH") || exit;

/**
 * Variables
 *
 * @var \Duplicator\Core\Views\TplMng  $tplMng
 * @var array<string, mixed> $tplData
 */
?>
<p>
    <?php
    esc_html_e(
        'Staging sites let you create a full copy of your WordPress site to safely test updates, new plugins, theme changes ' .
        'and other modifications without affecting your live site.',
        'duplicator'
    );
    ?>
</p>
<p>
    <?php
    esc_html_e(
        'Duplicator Pro creates an isolated staging site from a backup so you can freely test changes without any risk to your live site.',
        'duplicator'
    );
    ?>
</p>
