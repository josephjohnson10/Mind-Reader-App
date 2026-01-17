export const voidChallengeHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Void Challenge: Asteroid Dodge</title>
    <style>
        body { margin: 0; background: #000; overflow: hidden; color: white; font-family: 'Segoe UI', Arial; }
        #info { position: absolute; top: 20px; left: 20px; font-size: 22px; font-weight: bold; z-index: 10; font-family: 'Courier New', monospace; text-shadow: 0 0 5px #38bdf8; }
        canvas { display: block; margin: auto; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); border: 2px solid #1e293b; box-shadow: 0 0 50px rgba(56, 189, 248, 0.1); }
        .key-hint { position: absolute; bottom: 20px; width: 100%; text-align: center; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
        #overlay { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.8); justify-content: center; align-items: center; flex-direction: column; z-index: 20; }
        h1 { margin: 0 0 20px 0; font-size: 48px; color: #f43f5e; text-shadow: 0 0 20px rgba(244, 63, 94, 0.5); }
    </style>
</head>
<body>

<div id="info">SCORE: 0 | LIVES: 3</div>
<div id="overlay">
    <h1>GAME OVER</h1>
    <div style="color: #94a3b8; font-size: 24px;">REDIRECTING...</div>
</div>
<canvas id="gameCanvas" width="800" height="500"></canvas>
<div class="key-hint">Use &lt; LEFT / RIGHT &gt; or MOUSE to Dodge Debris</div>

<script>
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const infoEl = document.getElementById("info");
const overlay = document.getElementById("overlay");

const player = {
    x: 400, y: 440, width: 40, height: 50,
    speed: 8, color: '#38bdf8',
    shield: false
};

let obstacles = [];
let particles = [];
let stars = [];
let score = 0;
let lives = 3;
let gameOver = false;
let frameCount = 0;
let difficulty = 1;

// Starfield background
for(let i=0; i<150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.2,
        alpha: Math.random()
    });
}

// Input handling
let keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

canvas.addEventListener("mousemove", e => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    player.x = mouseX - player.width/2;
});

canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    player.x = touchX - player.width/2;
}, { passive: false });

function spawnObstacle() {
    const size = 30 + Math.random() * 50;
    const type = Math.random();
    let color = '#94a3b8'; // Rock
    let speed = 3 + Math.random() * 3 + difficulty;
    
    if (type > 0.9) {
        color = '#ef4444'; // Red comet (fast)
        speed *= 1.5;
    } else if (type > 0.7) {
        color = '#a8a29e'; // Iron (tough)
    }

    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: speed,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        color: color,
        vertices: createAsteroidVertices(size)
    });
}

function createAsteroidVertices(size) {
    const verts = [];
    const points = 8;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = (size/2) * (0.8 + Math.random() * 0.4);
        verts.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        });
    }
    return verts;
}

function createParticles(x, y, color, count = 10) {
    for(let i=0; i<count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03,
            color: color
        });
    }
}

function update() {
    if (gameOver) return;
    
    // Player movement with keys (smooth)
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;

    // Clamp player
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // Stars background
    stars.forEach(star => {
        star.y += star.speed;
        if(star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // Obstacles spawning
    if (frameCount % Math.max(15, 60 - Math.floor(difficulty * 8)) === 0) {
        spawnObstacle();
    }
    
    // Ramp up difficulty
    if (score > 0 && score % 200 === 0) {
        difficulty = Math.min(6, difficulty + 0.1);
    }

    obstacles.forEach((obs, index) => {
        obs.y += obs.speed;
        obs.rot += obs.rotSpeed;
        
        // Simple AABB Collision for gameplay feel
        const hitX = obs.x + obs.width * 0.2;
        const hitY = obs.y + obs.height * 0.2;
        const hitW = obs.width * 0.6;
        const hitH = obs.height * 0.6;

        if (player.x < hitX + hitW &&
            player.x + player.width > hitX &&
            player.y < hitY + hitH &&
            player.y + player.height > hitY) {
            
            // Hit!
            createParticles(player.x + player.width/2, player.y + player.height/2, '#f43f5e', 20);
            createParticles(obs.x + obs.width/2, obs.y + obs.height/2, obs.color, 10);
            
            lives--;
            obstacles.splice(index, 1);
            
            infoEl.innerHTML = \`SCORE: \${score} | <span style="color: \${lives < 2 ? '#ef4444' : '#fff'}">LIVES: \${lives}</span>\`;

            if (lives <= 0) {
                endGame();
            }
        }
        
        // Remove if off screen
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score += 10;
            infoEl.innerText = 'SCORE: ' + score + ' | LIVES: ' + lives;
        }
    });

    // Particles
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if(p.life <= 0) particles.splice(i, 1);
    });

    frameCount++;
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    stars.forEach(star => {
        ctx.fillStyle = \`rgba(255, 255, 255, \${star.alpha})\`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Player (Ship)
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    
    // Engine flame
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-5, 15);
    ctx.lineTo(5, 15);
    ctx.lineTo(0, 25 + Math.random() * 15);
    ctx.fill();

    // Ship Body
    ctx.fillStyle = lives < 2 ? '#fca5a5' : '#38bdf8';
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -25); // Tip
    ctx.lineTo(20, 15); // Right Wing
    ctx.lineTo(0, 5);   // Center indentation
    ctx.lineTo(-20, 15); // Left Wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.ellipse(0, -5, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Obstacles
    obstacles.forEach(obs => {
        ctx.save();
        ctx.translate(obs.x + obs.width/2, obs.y + obs.height/2);
        ctx.rotate(obs.rot);
        
        ctx.fillStyle = obs.color;
        
        ctx.beginPath();
        obs.vertices.forEach((v, i) => {
            if (i === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(obs.width*0.2, -obs.height*0.2, obs.width*0.15, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    });

    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

function endGame() {
    gameOver = true;
    overlay.style.display = 'flex';
    const grade = score >= 1000 ? 'S' : score >= 700 ? 'A' : score >= 400 ? 'B' : 'C';
    window.parent.postMessage({ 
        type: 'gameComplete', 
        score: score, 
        grade: grade,
        correct: Math.floor(score/100),
        incorrect: 3-lives
    }, '*');
}

requestAnimationFrame(update);
</script>
</body>
</html>`;
