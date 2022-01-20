<?php
    // Ref. https://qiita.com/satoshi-nishinaka/items/f15ccbcf8b8f91c1e2dd
    function endsWith($haystack, $needle) {
        return (strlen($haystack) > strlen($needle)) ? (substr($haystack, -strlen($needle)) == $needle) : false;
    }
    function startsWith($haystack, $needle) {
        return (strpos($haystack, $needle) === 0);
    }

    ini_set('error_log', 'php://stderr');

    if(count($argv) < 2) {
        error_log('Not enough arguments.' . PHP_EOL . 'history.php <commit_message>');
        exit(1);
    }

    if(empty($argv[1])) {
        error_log('Empty argument.');
        exit(1);
    }

    // コミットメッセージからメタ情報を取得する
    echo "Extracting meta..." . PHP_EOL;
    $msg = $argv[1];
    $msg = str_replace("\r\n", "\n", $msg);
    $msg = str_replace("\r", "\n", $msg);
    $msg = str_replace("\n", "<br>", $msg);

    preg_match('/\[meta\](.*)\[\/meta\]/', $msg, $match);
    if(!$match) {
        error_log('No meta field.');
        exit(1);
    }

    preg_match('/\[version\](.*)\[\/version\]/', $msg, $match_v);
    preg_match('/\[contents\](.*)\[\/contents\]/', $msg, $match_c);

    echo "Extracted info: ". PHP_EOL;
    echo ">> Version: " . $match_v[1] . PHP_EOL;
    $title = "### " . $match_v[1] . PHP_EOL;
    $contents = "";
    foreach(explode("<br>", $match_c[1]) as $c) {
        if($c != "") {
            $contents = $contents . "- " . $c . PHP_EOL;
            echo ">> - " . $c . PHP_EOL;
        }
    }
    
    $out = $title . PHP_EOL . $contents . PHP_EOL . PHP_EOL;

    // 既存の更新履歴ファイルからバージョンリストを取り出しVersionにα/βが含まれるものを削除する
    echo PHP_EOL;
    echo "Removing alpha/beta information..." . PHP_EOL;
    $path = __DIR__ . '/../../public/history.md';
    if(!file_exists($path)) {
        error_log("Could not open file: history.md");
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
            $contents = $version;
            while(endsWith($contents, "<br>")) {
                $contents = substr($contents, 0, strlen($contents) - 4);
            }
            $cnts = "";
            foreach(explode('<br>- ', $contents) as $cnt) {
                if(!startsWith($cnt, "###") && $cnt != "") {
                    $cnts = $cnts . "- " . $cnt . PHP_EOL;
                }
            }

            $alpha_or_beta = false;
            $alpha_beta_strings = ["α", "β"];
            foreach($alpha_beta_strings as $abs) {
                if(strpos($match[1], $abs) !== false) {
                    $alpha_or_beta = true;
                    break;
                }
            }
            if(!$alpha_or_beta) {
                $new_version = "### " . $match[1] . PHP_EOL . PHP_EOL . $cnts . PHP_EOL . PHP_EOL;
                $new_version = str_replace("<br>", PHP_EOL, $new_version);
                $new_versions = $new_versions . $new_version;
            }
        }
    }

    echo "Writing to history.md..." . PHP_EOL;
    file_put_contents($path, $out . $new_versions);

    echo "Done." . PHP_EOL;