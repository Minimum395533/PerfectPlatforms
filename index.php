<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfect Platforms</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <style>
        /* Force pure white text everywhere, overriding any Bootstrap default grays */
        body, .nav-link, .navbar-brand, .card-header, canvas {
            color: #ffffff !important; 
        }

        /* Ensures canvases scale down nicely while maintaining their shape */
        canvas {
            display: block;
            max-width: 100%;
            height: auto;
        }

        /* Enforce the exact 20:12 ratio for the game field */
        #myCanvas {
            aspect-ratio: 20 / 12;
        }
        
        /* Forces the card to only be as wide as its contents */
        .fit-content {
            width: max-content;
            max-width: 100%;
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
                        <a class="nav-link" href="about.php">About me</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container">
        <div class="d-flex flex-wrap justify-content-center align-items-start gap-4">
            
            <div class="card fit-content border-primary shadow">
                <div class="card-header border-primary fw-bold text-center">
                    Game
                </div>
                <div class="card-body p-0">
                    <canvas id="myCanvas" width="800" height="480" class="rounded-bottom">
                        Upgrade your browser to support HTML5 canvas.
                    </canvas> 
                </div>
            </div>

            <div class="card fit-content border-primary shadow">
                <div class="card-header border-primary fw-bold text-center">
                    Leaderboard
                </div>
                <div class="card-body p-0">
                    <canvas id="leaderboard" width="160" height="480" class="rounded-bottom">
                        Upgrade your browser to support HTML5 canvas.
                    </canvas> 
                </div>
            </div>

        </div>
    </div>

    <script src="gamescreen.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
