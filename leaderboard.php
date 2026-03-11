<?php
// Handle AJAX requests to save leaderboard data
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'addPlayer') {
        $playerName = isset($_POST['playerName']) ? trim($_POST['playerName']) : '';
        
        // Validate name (7 letters only)
        if (strlen($playerName) === 7 && preg_match('/^[a-zA-Z]{7}$/', $playerName)) {
            $filePath = 'data/gamePlay.json';
            
            // Ensure data folder exists
            if (!file_exists('data')) {
                mkdir('data', 0777, true);
            }
            
            // Read existing data
            if (!file_exists($filePath)) {
                file_put_contents($filePath, '[]');
            }
            
            $jsonString = file_get_contents($filePath);
            $currentData = json_decode($jsonString, true);
            
            if (!is_array($currentData)) {
                $currentData = [];
            }
            
            // Add new player entry
            $newPlayer = [
                'playerName' => $playerName,
                'score' => 0,
                'Time' => 0,
                'dateTime' => time(),
                'Livesremaining' => 3,
                'TotalJumps' => 0
            ];
            
            $currentData[] = $newPlayer;
            file_put_contents($filePath, json_encode($currentData, JSON_PRETTY_PRINT));
            
            echo json_encode(['success' => true, 'message' => 'Player added successfully!']);
            exit;
        } else {
            echo json_encode(['success' => false, 'message' => 'Player name must be exactly 7 letters.']);
            exit;
        }
    }
}
?>

<!-- L3-WN-Leaderboard Page-3/11/26 -->

<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaderboard - Perfect Platforms</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <style>
        body, .nav-link, .navbar-brand, .card-header {
            color: #ffffff !important; 
        }

        .leaderboard-table {
            color: #ffffff;
            margin-top: 20px;
        }

        .leaderboard-table thead {
            background-color: #0d6efd;
            font-weight: bold;
        }

        .leaderboard-table tbody tr {
            border-bottom: 1px solid #495057;
        }

        .leaderboard-table tbody tr:hover {
            background-color: #495057;
        }

        .rank-badge {
            background-color: #0d6efd;
            color: white;
            padding: 5px 10px;
            border-radius: 50%;
            font-weight: bold;
            min-width: 40px;
            text-align: center;
        }

        .rank-1 {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
        }

        .rank-2 {
            background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
            color: #000;
        }

        .rank-3 {
            background: linear-gradient(135deg, #cd7f32 0%, #e6a36e 100%);
            color: #fff;
        }

        .input-group {
            margin-bottom: 30px;
        }

        .form-control {
            background-color: #495057;
            border-color: #0d6efd;
            color: #ffffff;
        }

        .form-control::placeholder {
            color: #adb5bd;
        }

        .form-control:focus {
            background-color: #495057;
            border-color: #0d6efd;
            color: #ffffff;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }

        .btn-primary {
            background-color: #0d6efd;
            border-color: #0d6efd;
        }

        .btn-primary:hover {
            background-color: #0b5ed7;
            border-color: #0a58ca;
        }

        .card {
            border-color: #0d6efd;
        }

        .card-header {
            background-color: #0d6efd;
            border-color: #0d6efd;
        }

        .error-message {
            color: #dc3545;
            font-weight: bold;
            margin-top: 10px;
        }

        .success-message {
            color: #28a745;
            font-weight: bold;
            margin-top: 10px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }

        .stat-card {
            background-color: #495057;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #0d6efd;
        }

        .stat-label {
            font-size: 0.85rem;
            color: #adb5bd;
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #0d6efd;
        }
    </style>
</head>
<body class="bg-body">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-5 border-bottom border-primary shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="/">Perfect Platforms</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="about.php">About me</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container">
        <div class="card border-primary shadow">
            <div class="card-header border-primary fw-bold text-center">
                Leaderboard
            </div>
            <div class="card-body">
                <!-- Add Player Form -->
                <form id="addPlayerForm" method="POST">
                    <div class="input-group">
                        <input type="text" class="form-control" id="playerNameInput" name="playerName" placeholder="Enter 7-letter name" maxlength="7" required>
                        <button class="btn btn-primary" type="submit">Add Player</button>
                    </div>
                </form>
                <div id="messageContainer"></div>

                <!-- Stats Overview -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Players</div>
                        <div class="stat-value" id="totalPlayers">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Highest Level</div>
                        <div class="stat-value" id="highestLevel">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Best Time</div>
                        <div class="stat-value" id="bestTime">0s</div>
                    </div>
                </div>

                <!-- Leaderboard Table -->
                <div class="table-responsive">
                    <table class="table table-dark leaderboard-table">
                        <thead>
                            <tr>
                                <th style="width: 60px;">Rank</th>
                                <th>Player Name</th>
                                <th style="width: 100px;">Level</th>
                                <th style="width: 100px;">Time (s)</th>
                                <th style="width: 120px;">Lives Remaining</th>
                                <th style="width: 100px;">Total Jumps</th>
                                <th style="width: 150px;">Date</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboardBody">
                            <!-- Populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Load and display leaderboard data
        async function loadLeaderboard() {
            try {
                const response = await fetch('data/gamePlay.json');
                const players = await response.json();

                // Sort by score (descending), then by time (ascending)
                const sorted = players.sort((a, b) => {
                    if (b.score !== a.score) {
                        return b.score - a.score; // Higher score first
                    }
                    return a.Time - b.Time; // Lower time first for same score
                });

                // Update stats
                document.getElementById('totalPlayers').textContent = sorted.length;
                
                if (sorted.length > 0) {
                    document.getElementById('highestLevel').textContent = sorted[0].score;
                    
                    // Find best time (lowest time value, excluding 0)
                    const nonZeroTimes = sorted.filter(p => p.Time > 0).map(p => p.Time);
                    const bestTime = nonZeroTimes.length > 0 ? Math.min(...nonZeroTimes) : 0;
                    document.getElementById('bestTime').textContent = bestTime + 's';
                }

                // Populate table
                const tbody = document.getElementById('leaderboardBody');
                tbody.innerHTML = '';

                sorted.forEach((player, index) => {
                    const rank = index + 1;
                    const row = document.createElement('tr');
                    
                    const dateObj = new Date(player.dateTime * 1000);
                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    let rankClass = 'rank-badge';
                    if (rank === 1) rankClass += ' rank-1';
                    else if (rank === 2) rankClass += ' rank-2';
                    else if (rank === 3) rankClass += ' rank-3';

                    row.innerHTML = `
                        <td><span class="${rankClass}">${rank}</span></td>
                        <td><strong>${escapeHtml(player.playerName)}</strong></td>
                        <td>${player.score}</td>
                        <td>${player.Time}</td>
                        <td>${player.Livesremaining}</td>
                        <td>${player.TotalJumps}</td>
                        <td>${formattedDate}</td>
                    `;
                    tbody.appendChild(row);
                });
            } catch (error) {
                console.error('Error loading leaderboard:', error);
                document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading leaderboard data</td></tr>';
            }
        }

        // Handle form submission
        document.getElementById('addPlayerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const playerName = document.getElementById('playerNameInput').value.trim();
            const messageContainer = document.getElementById('messageContainer');

            messageContainer.innerHTML = '';

            // Client-side validation
            if (!playerName) {
                messageContainer.innerHTML = '<div class="error-message">Please enter a player name.</div>';
                return;
            }

            if (playerName.length !== 7) {
                messageContainer.innerHTML = '<div class="error-message">Player name must be exactly 7 letters.</div>';
                return;
            }

            if (!/^[a-zA-Z]{7}$/.test(playerName)) {
                messageContainer.innerHTML = '<div class="error-message">Player name must contain only letters.</div>';
                return;
            }

            try {
                // Send form data via POST
                const formData = new FormData();
                formData.append('action', 'addPlayer');
                formData.append('playerName', playerName);

                const response = await fetch('leaderboard.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    messageContainer.innerHTML = '<div class="success-message">Player added successfully!</div>';
                    document.getElementById('playerNameInput').value = '';
                    setTimeout(() => {
                        loadLeaderboard();
                    }, 500);
                } else {
                    messageContainer.innerHTML = `<div class="error-message">${result.message}</div>`;
                }
            } catch (error) {
                console.error('Error adding player:', error);
                messageContainer.innerHTML = '<div class="error-message">Error adding player. Please try again.</div>';
            }
        });

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        // Load leaderboard on page load
        loadLeaderboard();
    </script>

</body>
</html>
