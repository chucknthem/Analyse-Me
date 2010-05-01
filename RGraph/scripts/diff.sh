#!/usr/bin/php -q
<?php
    passthru('clear');

    if (!empty($argv[1])) {
        passthru('svn diff -r {' . $argv[1] . '}');
    } else {
        echo "  Show changes since...\n";
        echo " =======================\n\n";
        echo "This command should be used like so:\n";
        echo "\n";
        echo "      {$argv[0]} 2010-03-06\n";
        echo "\n";
    }
?>