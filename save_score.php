<?php
require_once 'functions.php';
//<!-- L3-WN-run functions.php-3/10/26 -->
// Get the raw JSON beamed over from JavaScript
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// If data exists, pass it to our function
if ($data) {
    saveGameData($data);
    echo json_encode(["status" => "success", "message" => "Score saved successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "No data received."]);
}
?>