<?php
// L3-WN-Leaderboard Data-3/10/26 
header('Content-Type: application/json');

$dataFile = 'data/gamePlay.json'; 

if (file_exists($dataFile)) {
    // 1. Get the raw JSON text from the file
    $json_data = file_get_contents($dataFile);

    // 2. Convert that text into a PHP array so we can manipulate it
    $scoresArray = json_decode($json_data, true);

    // 3. Sort the array using our custom rules
    if (is_array($scoresArray)) {
        usort($scoresArray, function($playerA, $playerB) {
            $scoreA = $playerA['score'];
            $scoreB = $playerB['score'];

            // Rule 1: Compare the Scores (Levels), treating 0 as the absolute highest!
            if ($scoreA !== $scoreB) {

                // If Player A beat the game (Level 0), they automatically win this matchup
                if ($scoreA === 0) return -1;

                // If Player B beat the game (Level 0), they automatically win this matchup
                if ($scoreB === 0) return 1;

                // If neither player has a 0, sort normally (Highest level wins)
                return $scoreB - $scoreA; 
            }

            // Rule 2: If it's a tie (both got 0, or both got the same level), fastest time wins
            return $playerA['Time'] - $playerB['Time']; 
        });

        // Keep only the top 10 players
        $scoresArray = array_slice($scoresArray, 0, 10);
    }

    // 4. Convert the freshly sorted array back into JSON and send it to the game
    echo json_encode($scoresArray);
} else {
    echo '[]';
}
?>