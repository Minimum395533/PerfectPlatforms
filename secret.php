<?php
// Handle save to levels.json
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'saveLevel') {
    $filePath = 'assets/levels.json';

    $levelId   = isset($_POST['levelId'])   ? intval($_POST['levelId'])        : null;
    $levelData = isset($_POST['levelData']) ? trim($_POST['levelData'])         : null;
    $levelHint = isset($_POST['levelHint']) ? trim($_POST['levelHint'])         : '';

    if ($levelId === null || $levelData === null || strlen($levelData) !== 240) {
        echo json_encode(['success' => false, 'message' => 'Invalid level data. Data string must be 240 characters.']);
        exit;
    }

    // Read existing levels
    $json = file_exists($filePath) ? file_get_contents($filePath) : '[]';
    $levels = json_decode($json, true);
    if (!is_array($levels)) {
        $levels = [];
    }

    // Build the new entry
    $newEntry = ['level' => $levelId, 'data' => $levelData];
    if ($levelHint !== '') {
        $newEntry['hint'] = $levelHint;
    }

    // Replace matching level number, or append if not found
    $found = false;
    foreach ($levels as &$entry) {
        if (isset($entry['level']) && $entry['level'] === $levelId) {
            $entry = $newEntry;
            $found = true;
            break;
        }
    }
    unset($entry);

    if (!$found) {
        $levels[] = $newEntry;
        // Keep levels sorted by level number
        usort($levels, fn($a, $b) => $a['level'] <=> $b['level']);
    }

    file_put_contents($filePath, json_encode($levels, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => "Level {$levelId} saved to levels.json."]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platformer Level Editor</title>
    <style>
        :root {
            --bg-color: #1a1a1a;
            --panel-bg: #2d2d2d;
            --text-color: #e0e0e0;
            --accent: #4a90e2;
            --grid-border: #444;

            /* Tile Colors */
            --tile-0: #000000; /* Empty */
            --tile-G: #808080; /* Ground */
            --tile-P: #4a90e2; /* Platform */
            --tile-S: #ffd700; /* Start */
            --tile-F: #32cd32; /* Finish */
            --tile-X: #ff4444; /* Kill */
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100vh;
        }

        h1 { margin-top: 0; font-size: 1.5rem; }

        .editor-container {
            display: flex;
            gap: 20px;
            max-width: 1200px;
            width: 100%;
            height: 100%;
        }

        /* Left Panel: Tools & Settings */
        .controls {
            flex: 0 0 250px;
            background: var(--panel-bg);
            padding: 20px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
        }

        .section {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        label { font-weight: bold; font-size: 0.9rem; }

        input, textarea {
            background: #444;
            border: 1px solid #555;
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-family: monospace;
        }

        /* Tile Palette */
        .palette {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .tool-btn {
            background: #444;
            border: 2px solid transparent;
            color: white;
            padding: 10px;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .tool-btn:hover { background: #555; }
        .tool-btn.active { 
            border-color: var(--accent); 
            background: #3d3d3d;
        }

        .color-preview {
            width: 16px;
            height: 16px;
            border-radius: 2px;
            border: 1px solid #fff;
        }

        /* Middle Panel: The Grid */
        .canvas-area {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #222;
            border-radius: 8px;
            padding: 20px;
            overflow: auto;
        }

        #level-grid {
            display: grid;
            grid-template-columns: repeat(20, 32px);
            grid-template-rows: repeat(12, 32px);
            gap: 1px;
            background-color: var(--grid-border);
            border: 2px solid var(--grid-border);
            user-select: none;
        }

        .cell {
            width: 32px;
            height: 32px;
            background-color: var(--tile-0);
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 10px;
            color: rgba(255,255,255,0.5);
        }

        .cell:hover { opacity: 0.8; }

        /* Tile classes for visualization */
        .tile-0 { background-color: var(--tile-0); }
        .tile-G { background-color: var(--tile-G); }
        .tile-P { background-color: var(--tile-P); }
        .tile-S { background-color: var(--tile-S); color: black !important; font-weight: bold; }
        .tile-F { background-color: var(--tile-F); color: black !important; font-weight: bold; }
        .tile-X { background-color: var(--tile-X); }

        /* Right Panel: Output */
        .output-panel {
            flex: 0 0 300px;
            background: var(--panel-bg);
            padding: 20px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .action-btn {
            background: var(--accent);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .action-btn:hover { opacity: 0.9; }
        .action-btn.secondary { background: #555; }
        .action-btn.save { background: #27ae60; }
        .action-btn.save:hover { background: #219a52; }

        #json-output {
            flex: 1;
            resize: vertical;
            min-height: 200px;
            font-size: 12px;
        }

        .stats {
            font-size: 0.8rem;
            color: #888;
            margin-top: auto;
        }

        .divider {
            border-top: 1px solid #444;
            margin: 5px 0;
        }

    </style>
</head>
<body>

    <div class="editor-container">
        <!-- TOOLS -->
        <div class="controls">
            <h2>Level Settings</h2>

            <div class="section">
                <label for="level-id">Level Number</label>
                <input type="number" id="level-id" value="1" min="-1">
            </div>

            <div class="section">
                <label for="level-hint">Hint Text (Optional)</label>
                <textarea id="level-hint" rows="3" placeholder="e.g. Watch out for the red tiles!"></textarea>
            </div>

            <h3>Tile Palette</h3>
            <div class="palette">
                <button class="tool-btn active" onclick="selectTool('G')">
                    <div class="color-preview" style="background:var(--tile-G)"></div> Ground
                </button>
                <button class="tool-btn" onclick="selectTool('P')">
                    <div class="color-preview" style="background:var(--tile-P)"></div> Platform
                </button>
                <button class="tool-btn" onclick="selectTool('X')">
                    <div class="color-preview" style="background:var(--tile-X)"></div> Hazard
                </button>
                <button class="tool-btn" onclick="selectTool('0')">
                    <div class="color-preview" style="background:var(--tile-0)"></div> Empty
                </button>
                <button class="tool-btn" onclick="selectTool('S')">
                    <div class="color-preview" style="background:var(--tile-S)"></div> Start
                </button>
                <button class="tool-btn" onclick="selectTool('F')">
                    <div class="color-preview" style="background:var(--tile-F)"></div> Finish
                </button>
            </div>

            <div class="section">
                <button class="action-btn secondary" onclick="clearGrid()">Clear Grid</button>
            </div>
        </div>

        <!-- GRID -->
        <div class="canvas-area">
            <div id="level-grid" onmouseleave="isDrawing = false">
                <!-- Cells generated by JS -->
            </div>
        </div>

        <!-- OUTPUT -->
        <div class="output-panel">
            <h2>JSON Output</h2>
            <button class="action-btn" onclick="generateJSON()">Generate JSON</button>
            <textarea id="json-output" placeholder="Click 'Generate' to create level data..."></textarea>
            <button class="action-btn secondary" onclick="copyToClipboard()">Copy to Clipboard</button>

            <div class="divider"></div>

            <button class="action-btn save" onclick="saveToFile()">Save to levels.json</button>

            <div class="divider"></div>

            <button class="action-btn secondary" onclick="loadFromJSON()">Load from JSON</button>
            <p class="stats" id="status-msg">Ready.</p>
        </div>
    </div>

    <script>
        const ROWS = 12;
        const COLS = 20;
        let gridData = new Array(ROWS * COLS).fill('0');
        let currentTool = 'G';
        let isDrawing = false;

        // Initialize Grid
        const gridElement = document.getElementById('level-grid');

        function initGrid() {
            gridElement.innerHTML = '';
            for (let i = 0; i < ROWS * COLS; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell tile-0';
                cell.dataset.index = i;

                // Interaction Events
                cell.addEventListener('mousedown', (e) => {
                    isDrawing = true;
                    paintCell(i);
                });

                cell.addEventListener('mouseenter', (e) => {
                    if (isDrawing) paintCell(i);
                });

                cell.addEventListener('mouseup', () => {
                    isDrawing = false;
                });

                gridElement.appendChild(cell);
            }
        }

        // Paint Logic
        function paintCell(index) {
            if (currentTool === 'S') {
                const oldStart = gridData.indexOf('S');
                if (oldStart !== -1 && oldStart !== index) {
                    gridData[oldStart] = '0';
                    updateVisuals(oldStart);
                }
            }

            gridData[index] = currentTool;
            updateVisuals(index);
        }

        function updateVisuals(index) {
            const cell = gridElement.children[index];
            cell.className = 'cell';
            cell.classList.add(`tile-${gridData[index]}`);
            cell.innerText = gridData[index] === '0' ? '' : gridData[index];
        }

        function selectTool(tool) {
            currentTool = tool;
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.innerText.includes(getToolName(tool))) {
                    btn.classList.add('active');
                }
            });
        }

        function getToolName(code) {
            const map = {
                'G': 'Ground', 'P': 'Platform', 'X': 'Hazard', 
                '0': 'Empty', 'S': 'Start', 'F': 'Finish'
            };
            return map[code];
        }

        function clearGrid() {
            if(confirm("Are you sure you want to clear the grid?")) {
                gridData.fill('0');
                gridData.forEach((_, i) => updateVisuals(i));
            }
        }

        // Generate JSON
        function generateJSON() {
            const levelId   = parseInt(document.getElementById('level-id').value) || 0;
            const hintText  = document.getElementById('level-hint').value;
            const flatData  = gridData.join('');

            const levelObj = { level: levelId, data: flatData };
            if (hintText.trim() !== "") {
                levelObj.hint = hintText;
            }

            document.getElementById('json-output').value = JSON.stringify(levelObj, null, 2);

            if (!flatData.includes('S')) showStatus('Warning: No Start (S) tile placed!');
            else if (!flatData.includes('F')) showStatus('Warning: No Finish (F) tile placed!');
            else showStatus(`Generated JSON for Level ${levelId}.`);
        }

        // Save directly to assets/levels.json
        async function saveToFile() {
            const levelId  = parseInt(document.getElementById('level-id').value);
            const hintText = document.getElementById('level-hint').value.trim();
            const flatData = gridData.join('');

            if (!flatData.includes('S')) {
                showStatus('Cannot save: No Start (S) tile placed!');
                return;
            }
            if (!flatData.includes('F')) {
                showStatus('Cannot save: No Finish (F) tile placed!');
                return;
            }

            if (!confirm(`Save level ${levelId} to levels.json? This will overwrite the existing level ${levelId} if it exists.`)) {
                return;
            }

            const formData = new FormData();
            formData.append('action',    'saveLevel');
            formData.append('levelId',   levelId);
            formData.append('levelData', flatData);
            formData.append('levelHint', hintText);

            try {
                const response = await fetch('secret.php', { method: 'POST', body: formData });
                const result   = await response.json();
                showStatus(result.message);
            } catch (err) {
                showStatus('Error: Could not save to file.');
                console.error(err);
            }
        }

        // Load JSON
        function loadFromJSON() {
            try {
                const input = document.getElementById('json-output').value;
                const obj   = JSON.parse(input);

                if (obj.data && obj.data.length === 240) {
                    gridData = obj.data.split('');
                    gridData.forEach((_, i) => updateVisuals(i));
                    if (obj.level !== undefined) document.getElementById('level-id').value = obj.level;
                    document.getElementById('level-hint').value = obj.hint || "";
                    showStatus("Level loaded successfully.");
                } else {
                    alert("Invalid data string length. Must be 240 characters.");
                }
            } catch (e) {
                alert("Invalid JSON format.");
            }
        }

        function copyToClipboard() {
            const copyText = document.getElementById("json-output");
            copyText.select();
            document.execCommand("copy");
            showStatus("Copied to clipboard!");
        }

        function showStatus(msg) {
            const el = document.getElementById('status-msg');
            el.innerText = msg;
            setTimeout(() => { el.innerText = 'Ready.'; }, 3000);
        }

        window.addEventListener('mouseup', () => isDrawing = false);
        initGrid();

    </script>
</body>
</html>
