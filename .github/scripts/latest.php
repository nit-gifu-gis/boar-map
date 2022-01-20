<?php
    $path = __DIR__ . '/../../public/history.md';
    if(!file_exists($path)) {
        echo "N/A";
        exit(1);
    }

    $old_history = file_get_contents($path);
    $old_history = str_replace("\r\n", "\n", $old_history);
    $old_history = str_replace("\r", "\n", $old_history);
    $old_history = str_replace("\n", "<br>", $old_history);
    // <br><br><br>###がバージョンの区切りになるのでそれで行ごとに区切る
    $old_history = str_replace("<br><br>###", PHP_EOL . "###", $old_history);

    $new_versions = "";
    foreach(explode(PHP_EOL, $old_history) as $version) {
        preg_match('/###\s([^(<!--)(-->)]+)<br><br>/', $version,  $match);
        if($match) {
            echo str_replace('Version ', "", str_replace("α", "-alpha", str_replace("β", "-beta", $match[1])));
            exit;
        }
    }
    echo "N/A";
    exit(1);