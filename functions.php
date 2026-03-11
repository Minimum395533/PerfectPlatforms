<!-- L3-WN-Data Storage-3/10/26 -->
<?php
function saveGameData($newData) {
    $filePath = 'data/gamePlay.json';

    // Make sure the data folder exists
    if (!file_exists('data')) {
        mkdir('data', 0777, true);
    }

    // Make sure the file exists; if not, create an empty array
    if (!file_exists($filePath)) {
        file_put_contents($filePath, '[]');
    }

    // Read the existing JSON file
    $jsonString = file_get_contents($filePath);
    $currentData = json_decode($jsonString, true);

    // If it's broken or empty, ensure it's an array
    if (!is_array($currentData)) {
        $currentData = [];
    }

    // Add the new record
    $currentData[] = $newData;

    // Save it back nicely formatted
    file_put_contents($filePath, json_encode($currentData, JSON_PRETTY_PRINT));
}
?>