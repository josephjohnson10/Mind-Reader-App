// Read from uploaded HTML files and converted to strings
export const voidChallengeHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Void Challenge: 2 Lives</title>
    <style>
        body { margin: 0; background: #000; overflow: hidden; color: white; font-family: 'Segoe UI', Arial; }
        #info { position: absolute; top: 20px; left: 20px; font-size: 22px; font-weight: bold; }
        canvas { display: block; margin: auto; background: #0a0a0a; border-bottom: 5px solid #222; }
    </style>
</head>
<body>

<div id="info">Lives: 2 | Black Holes: 0 / 3</div>
<canvas id="gameCanvas" width="800" height="500"></canvas>

<script>
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: 100, y: 200, width: 35, height: 35,
    velocityY: 0, gravity: 0.25, lift: -5.5,
};

let blocks = [], blackHoles = [], holesEntered = 0;
let lives = 2, gamePaused = false, gameOver = false, gameWon = false;
let invincibilityFrames = 0;

window.addEventListener("keydown", e => {
    if (e.code === "Space" && !gameOver && !gameWon && !gamePaused) {
        player.velocityY = player.lift;
    }
});

function handleHit() {
    if (invincibilityFrames > 0) return;
    lives--;
    updateUI();
    if (lives <= 0) {
        gameOver = true;
        window.parent.postMessage({ 
            type: 'gameComplete', 
            score: holesEntered * 100, 
            correct: holesEntered, 
            incorrect: 3 - holesEntered,
            grade: holesEntered >= 3 ? 'A' : holesEntered >= 2 ? 'B' : holesEntered >= 1 ? 'C' : 'F'
        }, '*');
    } else {
        invincibilityFrames = 60;
        player.velocityY = -2;
    }
}

function updateUI() {
    document.getElementById("info").innerText = "Lives: " + lives + " | Black Holes: " + holesEntered + " / 3";
}

function askQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const answer = prompt("VOID CHALLENGE: What is " + a + " + " + b + "?");
    return parseInt(answer) === (a + b);
}

function update() {
    if (gameOver || gameWon || gamePaused) return;

    player.velocityY += player.gravity;
    player.y += player.velocityY;
    if (invincibilityFrames > 0) invincibilityFrames--;

    if (player.y + player.height > 465 || player.y < 0) {
        handleHit();
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > 465) player.y = 465 - player.height;
    }

    if (Math.random() < 0.012) {
        blocks.push({ x: canvas.width, y: Math.random() * 380 + 20, width: 40, height: 40 });
    }
    if (Math.random() < 0.006 && holesEntered < 3) {
        blackHoles.push({ x: canvas.width, y: Math.random() * 300 + 100, radius: 28 });
    }

    blocks.forEach(b => b.x -= 3.5);
    blackHoles.forEach(h => h.x -= 3.5);

    blocks.forEach(b => {
        if (player.x < b.x + b.width &&
            player.x + player.width > b.x &&
            player.y < b.y + b.height &&
            player.y + player.height > b.y) {
            handleHit();
        }
    });

    blackHoles.forEach((h, index) => {
        const distX = Math.abs(h.x - player.x - player.width / 2);
        const distY = Math.abs(h.y - player.y - player.height / 2);
        if (distX < player.width / 2 + h.radius && distY < player.height / 2 + h.radius) {
            gamePaused = true;
            setTimeout(() => {
                if (askQuestion()) {
                    holesEntered++;
                    updateUI();
                    blackHoles.splice(index, 1);
                    gamePaused = false;
                    if (holesEntered >= 3) {
                        gameWon = true;
                        window.parent.postMessage({ 
                            type: 'gameComplete', 
                            score: 300, 
                            correct: 3, 
                            incorrect: 0,
                            grade: 'S'
                        }, '*');
                    }
                } else {
                    handleHit();
                    blackHoles.splice(index, 1);
                    gamePaused = false;
                }
            }, 50);
        }
    });

    blocks = blocks.filter(b => b.x > -50);
    blackHoles = blackHoles.filter(h => h.x > -100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 465, canvas.width, 35);

    if (invincibilityFrames % 10 < 5) {
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = "black";
        ctx.fillRect(player.x + 22, player.y + 8, 6, 6);
    }

    ctx.fillStyle = "#ff3333";
    blocks.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    blackHoles.forEach(h => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.strokeStyle = "#bc00ff";
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    if (gameOver || gameWon) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 40px Arial";
        ctx.fillText(gameWon ? "MISSION COMPLETE!" : "GAME OVER", canvas.width/2, 230);
        ctx.font = "20px Arial";
        ctx.fillText("Redirecting...", canvas.width/2, 280);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
</script>
</body>
</html>`;

export const memoryQuestHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Quest</title>
    <style>
        :root {
            --bg: #0f172a;
            --card-back: #1e293b;
            --card-front: #38bdf8;
            --accent: #f43f5e;
        }
        body {
            background-color: var(--bg);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .stats-container { display: flex; gap: 30px; font-size: 1.2rem; margin-bottom: 10px; }
        .highlight { color: var(--accent); font-weight: bold; }
        .grid {
            display: grid;
            gap: 10px;
            background: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 12px;
        }
        .card {
            width: 70px;
            height: 70px;
            background-color: var(--card-back);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .card.hidden { color: transparent; }
        .card.matched { opacity: 0.3; cursor: default; }
        #modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        .modal-content {
            background: #1e293b;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            border: 2px solid var(--accent);
            max-width: 400px;
        }
        button {
            padding: 10px 20px;
            margin: 10px;
            cursor: pointer;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Memory Quest</h1>
        <div class="stats-container">
            <div>Level: <span id="level-display" class="highlight">3x3</span></div>
            <div>Lives: <span id="lives-display" class="highlight">10</span></div>
        </div>
    </div>
    <div class="grid" id="game-grid"></div>
    <div id="modal">
        <div class="modal-content">
            <h2>Refuel!</h2>
            <p id="question-text">Loading question...</p>
            <div id="options"></div>
        </div>
    </div>
    <script>
        let currentSize = 3;
        let lives = 10;
        let mistakesInLevel = 0;
        let flipped = [];
        let matchedCount = 0;
        let isProcessing = false;
        const icons = ['💾', '💻', '🔌', '🖱️', '📱', '🕹️', '📡', '💡', '🔋', '⚙️', '🔒', '🔑', '📁', '📊', '🌐', '🚀', '🤖', '👾'];
        const questions = [
            { q: "Which one is a Linear Data Structure?", a: ["Stack", "Tree"], correct: "Stack" },
            { q: "Logic Gate that outputs 1 only if both inputs are 1?", a: ["OR", "AND"], correct: "AND" },
            { q: "Memory that is volatile?", a: ["ROM", "RAM"], correct: "RAM" }
        ];
        
        function initLevel() {
            const grid = document.getElementById('game-grid');
            const totalTiles = currentSize * currentSize;
            const pairsNeeded = Math.floor(totalTiles / 2);
            let levelIcons = [];
            for(let i=0; i<pairsNeeded; i++) {
                levelIcons.push(icons[i % icons.length], icons[i % icons.length]);
            }
            if(totalTiles % 2 !== 0) levelIcons.push('⭐');
            levelIcons.sort(() => Math.random() - 0.5);
            grid.style.gridTemplateColumns = "repeat(" + currentSize + ", 70px)";
            grid.innerHTML = '';
            matchedCount = 0;
            levelIcons.forEach((icon, i) => {
                const div = document.createElement('div');
                div.className = 'card hidden';
                div.textContent = icon;
                div.onclick = () => handleFlip(div);
                grid.appendChild(div);
            });
            document.getElementById('level-display').innerText = currentSize + "x" + currentSize;
        }
        
        function handleFlip(card) {
            if (isProcessing || flipped.includes(card) || card.classList.contains('matched')) return;
            card.classList.remove('hidden');
            flipped.push(card);
            if (flipped.length === 2) {
                isProcessing = true;
                setTimeout(checkMatch, 600);
            }
        }
        
        function checkMatch() {
            const [c1, c2] = flipped;
            if (c1.textContent === c2.textContent) {
                c1.classList.add('matched');
                c2.classList.add('matched');
                matchedCount += 2;
                checkWin();
            } else {
                c1.classList.add('hidden');
                c2.classList.add('hidden');
                lives--;
                mistakesInLevel++;
                updateStats();
                if (lives <= 0) {
                    window.parent.postMessage({ 
                        type: 'gameComplete', 
                        score: currentSize * 50, 
                        correct: matchedCount / 2, 
                        incorrect: mistakesInLevel,
                        grade: 'F'
                    }, '*');
                    return;
                }
                if (mistakesInLevel % 2 === 0) showModal();
            }
            flipped = [];
            isProcessing = false;
        }
        
        function checkWin() {
            const totalTiles = currentSize * currentSize;
            const winTarget = (totalTiles % 2 === 0) ? totalTiles : totalTiles - 1;
            if (matchedCount >= winTarget) {
                setTimeout(() => {
                    if (currentSize < 4) {
                        currentSize++;
                        initLevel();
                    } else {
                        window.parent.postMessage({ 
                            type: 'gameComplete', 
                            score: 400, 
                            correct: matchedCount / 2, 
                            incorrect: mistakesInLevel,
                            grade: 'S'
                        }, '*');
                    }
                }, 500);
            }
        }
        
        function updateStats() {
            document.getElementById('lives-display').innerText = lives;
        }
        
        function showModal() {
            const modal = document.getElementById('modal');
            const qObj = questions[Math.floor(Math.random() * questions.length)];
            document.getElementById('question-text').innerText = qObj.q;
            const optionsDiv = document.getElementById('options');
            optionsDiv.innerHTML = '';
            qObj.a.forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.onclick = () => {
                    if (opt === qObj.correct) {
                        lives += 2;
                    }
                    updateStats();
                    modal.style.display = 'none';
                };
                optionsDiv.appendChild(btn);
            });
            modal.style.display = 'flex';
        }
        
        initLevel();
    </script>
</body>
</html>`;

export const warpExplorerHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Warp-Gate Explorer</title>
    <style>
        body { margin: 0; background: #050505; overflow: hidden; color: #fff; font-family: 'Courier New', Courier, monospace; }
        #ui { position: absolute; top: 20px; left: 20px; z-index: 10; font-size: 18px; background: rgba(0,0,0,0.5); padding: 10px; border: 1px solid #0ff; }
        canvas { display: block; margin: auto; background: radial-gradient(circle, #1b2735 0%, #090a0f 100%); }
        .fuel-bar { width: 200px; height: 15px; border: 1px solid #fff; margin-top: 5px; }
        #fuel-fill { width: 100%; height: 100%; background: #0f0; transition: width 0.3s; }
    </style>
</head>
<body>
<div id="ui">
    Warp Gates: <span id="gates">0</span> / 3<br>
    FUEL SYSTEM:
    <div class="fuel-bar"><div id="fuel-fill"></div></div>
</div>
<canvas id="spaceCanvas" width="600" height="700"></canvas>
<script>
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
let fuel = 100, gatesPassed = 0, gameActive = true, gamePaused = false, gameWon = false;
const ship = { x: 275, y: 550, w: 50, h: 60, speed: 7 };
let asteroids = [], warpGates = [];
const keys = {};
window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

function spawnObjects() {
    if (Math.random() < 0.03) {
        asteroids.push({
            x: Math.random() * (canvas.width - 40), y: -50,
            w: 40 + Math.random() * 30, h: 40 + Math.random() * 30,
            speed: 3 + Math.random() * 3
        });
    }
    if (Math.random() < 0.005 && warpGates.length === 0 && gatesPassed < 3) {
        warpGates.push({ x: 0, y: -100, w: canvas.width, h: 40, speed: 2 });
    }
}

function askQuestion() {
    const n1 = Math.floor(Math.random() * 15) + 2;
    const n2 = Math.floor(Math.random() * 15) + 2;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let correct;
    if(op === '+') correct = n1 + n2;
    if(op === '-') correct = n1 - n2;
    if(op === '*') correct = n1 * n2;
    const ans = prompt("WARP-GATE STABILIZING... \\nWhat is " + n1 + " " + op + " " + n2 + "?");
    return parseInt(ans) === correct;
}

function update() {
    if (!gameActive || gamePaused || gameWon) return;
    if (keys["ArrowLeft"] && ship.x > 0) ship.x -= ship.speed;
    if (keys["ArrowRight"] && ship.x < canvas.width - ship.w) ship.x += ship.speed;
    fuel -= 0.08;
    document.getElementById("fuel-fill").style.width = fuel + "%";
    if (fuel <= 0) {
        gameActive = false;
        window.parent.postMessage({ 
            type: 'gameComplete', 
            score: gatesPassed * 100, 
            correct: gatesPassed, 
            incorrect: 3 - gatesPassed,
            grade: gatesPassed >= 3 ? 'S' : gatesPassed >= 2 ? 'B' : gatesPassed >= 1 ? 'C' : 'F'
        }, '*');
    }
    
    asteroids.forEach((ast, i) => {
        ast.y += ast.speed;
        if (checkColl(ship, ast)) {
            fuel -= 15;
            asteroids.splice(i, 1);
            if (fuel <= 0) gameActive = false;
        }
    });
    
    warpGates.forEach((gate, i) => {
        gate.y += gate.speed;
        if (checkColl(ship, gate)) {
            gamePaused = true;
            warpGates.splice(i, 1);
            setTimeout(() => {
                if (askQuestion()) {
                    gatesPassed++;
                    fuel = Math.min(100, fuel + 40);
                    document.getElementById("gates").innerText = gatesPassed;
                    if (gatesPassed >= 3) {
                        gameWon = true;
                        window.parent.postMessage({ 
                            type: 'gameComplete', 
                            score: 300, 
                            correct: 3, 
                            incorrect: 0,
                            grade: 'S'
                        }, '*');
                    }
                } else {
                    fuel -= 20;
                }
                gamePaused = false;
            }, 100);
        }
    });
    
    spawnObjects();
    asteroids = asteroids.filter(a => a.y < canvas.height);
}

function checkColl(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    for(let i=0; i<10; i++) ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
    ctx.fillStyle = "#0ff";
    ctx.beginPath();
    ctx.moveTo(ship.x + ship.w/2, ship.y);
    ctx.lineTo(ship.x, ship.y + ship.h);
    ctx.lineTo(ship.x + ship.w, ship.y + ship.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.fillRect(ship.x + ship.w/2 - 5, ship.y + ship.h, 10, 10 + Math.random()*10);
    ctx.fillStyle = "#777";
    asteroids.forEach(ast => {
        ctx.beginPath();
        ctx.rect(ast.x, ast.y, ast.w, ast.h);
        ctx.fill();
        ctx.strokeStyle = "#444";
        ctx.stroke();
    });
    ctx.strokeStyle = "#b0f";
    ctx.lineWidth = 5;
    warpGates.forEach(gate => {
        ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
        ctx.fillStyle = "rgba(180, 0, 255, 0.2)";
        ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
    });
    if (!gameActive || gameWon) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.fillText(gameWon ? "CELESTIAL VICTORY!" : "STRANDED IN SPACE", 300, 300);
        ctx.font = "18px Arial";
        ctx.fillText("Redirecting...", 300, 350);
    }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
</script>
</body>
</html>`;

// Additional games can be added here - using placeholders for now
export const bridgeGameHTML = voidChallengeHTML;

export const treasureHunterHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Treasure Hunter: Skill Challenge</title>
    <style>
        body { background: #0f172a; color: #f8fafc; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        #gameGrid { display: grid; grid-template-columns: repeat(3, 120px); grid-gap: 15px; background: #1e293b; padding: 25px; border-radius: 20px; border: 4px solid #38bdf8; position: relative; box-shadow: 0 0 20px rgba(56, 189, 248, 0.2); }
        .hole { width: 120px; height: 120px; background: #334155; border-radius: 50%; position: relative; overflow: hidden; border: 4px solid #0f172a; }
        .orb { width: 85px; height: 85px; background: radial-gradient(circle at 30% 30%, #4cc9f0, #4361ee); border-radius: 50%; position: absolute; top: 120px; left: 18px; transition: top 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; box-shadow: 0 0 15px #4cc9f0; }
        .orb.up { top: 18px; }
        #stats { margin-bottom: 15px; font-weight: bold; width: 420px; display: flex; justify-content: space-between; color: #38bdf8; font-size: 18px; }
        .energy-icon { color: #4cc9f0; letter-spacing: 5px; }
    </style>
</head>
<body>
    <div id="stats">
        <span>Energy: <span class="energy-icon">⚡⚡</span></span>
        <span>Treasure: <span id="score">0</span></span>
    </div>
    <div id="gameGrid">
        <div class="hole"><div class="orb"></div></div>
        <div class="hole"><div class="orb"></div></div>
        <div class="hole"><div class="orb"></div></div>
        <div class="hole"><div class="orb"></div></div>
        <div class="hole"><div class="orb"></div></div>
        <div class="hole"><div class="orb"></div></div>
    </div>
    <script>
        const orbs = document.querySelectorAll('.orb');
        const scoreDisplay = document.getElementById('score');
        const energyDisplay = document.querySelector('.energy-icon');
        let lastHole, isPaused = false, score = 0, energy = 2, missedCount = 0, peepTime = 1100;

        function randomHole(holes) {
            const idx = Math.floor(Math.random() * holes.length);
            const hole = holes[idx];
            if (hole === lastHole) return randomHole(holes);
            lastHole = hole;
            return hole;
        }

        function peep() {
            if (isPaused) return;
            const orb = randomHole(orbs);
            orb.classList.add('up');
            let hit = false;
            orb.onclick = () => {
                if(!hit && !isPaused) {
                    score++;
                    scoreDisplay.innerText = score;
                    hit = true;
                    orb.classList.remove('up');
                }
            };
            setTimeout(() => {
                if (!hit && !isPaused) {
                    missedCount++;
                    if (missedCount >= 3) {
                        missedCount = 0;
                        handleEnergyLoss();
                    }
                }
                orb.classList.remove('up');
                if (!isPaused && energy > 0) peep();
                if (peepTime > 500) peepTime -= 10; 
            }, peepTime);
        }

        function handleEnergyLoss() {
            isPaused = true;
            energy--;
            energyDisplay.innerText = "⚡".repeat(energy) + (energy < 2 ? "⚪" : "");
            if (energy <= 0) {
                window.parent.postMessage({ 
                    type: 'gameComplete', 
                    score: score * 10, 
                    correct: score, 
                    incorrect: missedCount,
                    grade: score >= 30 ? 'A' : score >= 20 ? 'B' : score >= 10 ? 'C' : 'F'
                }, '*');
            } else {
                setTimeout(() => {
                    isPaused = false;
                    peep();
                }, 1000);
            }
        }

        peep();
    </script>
</body>
</html>`;

export const defenderChallengeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Defender Challenge: Skill Mastery</title>
    <style>
        body { background: #020617; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
        #gameWindow { position: relative; width: 420px; height: 620px; background: #0f172a; border: 4px solid #38bdf8; border-radius: 15px; overflow: hidden; }
        #bomber { position: absolute; bottom: 20px; left: 180px; font-size: 50px; transition: transform 0.2s, left 0.1s; z-index: 10; user-select: none; }
        .ball { position: absolute; width: 35px; height: 35px; background: radial-gradient(circle, #f43f5e, #881337); border-radius: 50%; box-shadow: 0 0 10px #f43f5e; }
        .bullet { position: absolute; width: 5px; height: 15px; background: #22d3ee; border-radius: 2px; box-shadow: 0 0 8px #22d3ee; }
        #stats { position: absolute; top: 10px; width: 100%; display: flex; justify-content: space-around; color: #38bdf8; font-weight: bold; z-index: 20; }
        .life-icon { color: #f43f5e; font-size: 20px; }
    </style>
</head>
<body>
    <div id="gameWindow">
        <div id="stats">
            <span id="livesText">Energy: <span class="life-icon">⚡⚡</span></span>
            <span id="score">Score: 0</span>
        </div>
        <div id="bomber">🚀</div>
    </div>
    <script>
        const game = document.getElementById('gameWindow');
        const bomber = document.getElementById('bomber');
        const livesDisplay = document.querySelector('.life-icon');
        let bX = 180, isPaused = false, score = 0, lives = 2, spawnRate = 2000;

        window.addEventListener('keydown', (e) => {
            if (isPaused) return;
            if (e.key === "ArrowLeft" && bX > 10) { bX -= 25; bomber.style.transform = "rotate(-20deg)"; }
            if (e.key === "ArrowRight" && bX < 350) { bX += 25; bomber.style.transform = "rotate(20deg)"; }
            bomber.style.left = bX + "px";
        });
        window.addEventListener('keyup', () => bomber.style.transform = "rotate(0deg)");

        setInterval(() => {
            if (isPaused) return;
            const bullet = document.createElement('div');
            bullet.className = 'bullet';
            bullet.style.left = (bX + 22) + "px"; bullet.style.bottom = "70px";
            game.appendChild(bullet);
            let m = setInterval(() => {
                if (isPaused) return;
                let b = parseInt(bullet.style.bottom); bullet.style.bottom = (b + 10) + "px";
                if (b > 620) { clearInterval(m); bullet.remove(); }
                document.querySelectorAll('.ball').forEach(ball => {
                    if (isColliding(bullet, ball)) { 
                        ball.remove(); bullet.remove(); score += 10; 
                        document.getElementById('score').innerText = "Score: " + score;
                        clearInterval(m); 
                    }
                });
            }, 20);
        }, 400);

        function spawnLoop() {
            if (!isPaused) {
                const ball = document.createElement('div');
                ball.className = 'ball';
                ball.style.left = Math.random() * 370 + "px"; ball.style.top = "-40px";
                game.appendChild(ball);
                let f = setInterval(() => {
                    if (isPaused) return;
                    let t = parseInt(ball.style.top); ball.style.top = (t + 4) + "px";
                    if (isColliding(ball, bomber)) { 
                        ball.remove(); clearInterval(f); 
                        handleLifeLoss(); 
                    }
                    if (t > 620) { clearInterval(f); ball.remove(); }
                }, 30);
            }
            setTimeout(spawnLoop, spawnRate);
        }
        spawnLoop();

        function isColliding(a, b) {
            let aR = a.getBoundingClientRect(), bR = b.getBoundingClientRect();
            return !(aR.top > bR.bottom || aR.bottom < bR.top || aR.right < bR.left || aR.left > bR.right);
        }

        function handleLifeLoss() {
            isPaused = true;
            lives--;
            livesDisplay.innerText = "⚡".repeat(lives) + (lives < 2 ? "⚪" : "");
            if (lives <= 0) {
                window.parent.postMessage({ 
                    type: 'gameComplete', 
                    score: score, 
                    correct: Math.floor(score / 10), 
                    incorrect: 2,
                    grade: score >= 200 ? 'A' : score >= 150 ? 'B' : score >= 100 ? 'C' : 'F'
                }, '*');
            } else {
                setTimeout(() => { isPaused = false; }, 1000);
            }
        }
    </script>
</body>
</html>`;
