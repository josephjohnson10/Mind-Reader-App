export const bridgeGameHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Bridge Game: Neural Path</title>
    <style>
        body { margin: 0; background-color: #0f172a; overflow: hidden; font-family: 'Segoe UI', Arial; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        #game-container { position: relative; width: 600px; height: 400px; background: linear-gradient(to bottom, #1e293b, #0f172a); border-radius: 12px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.5); border: 2px solid #334155; }
        .pillar { position: absolute; bottom: 0; background-color: #38bdf8; border-top: 4px solid #7dd3fc; box-shadow: inset -5px 0 10px rgba(0,0,0,0.2); transition: left 0.3s; }
        .start-pillar { left: 0; width: 60px; height: 200px; z-index: 2; }
        #hero { position: absolute; bottom: 200px; left: 40px; width: 20px; height: 20px; background-color: #f43f5e; border-radius: 4px; box-shadow: 0 0 10px #f43f5e; z-index: 10; transition: transform 0.2s; }
        #stick { position: absolute; bottom: 200px; left: 60px; width: 4px; background-color: #a78bfa; transform-origin: bottom center; transform: rotate(0deg); display: none; z-index: 5; }
        #score { position: absolute; top: 20px; right: 20px; font-size: 24px; font-weight: bold; color: #38bdf8; z-index: 20; }
        #info { position: absolute; top: 50px; left: 0; width: 100%; text-align: center; color: #94a3b8; font-size: 16px; pointer-events: none; }
        .success-flash { position: absolute; inset: 0; background: rgba(56, 189, 248, 0.2); opacity: 0; pointer-events: none; transition: opacity 0.2s; }
    </style>
</head>
<body>
    <div id="game-container">
        <div id="score">0</div>
        <div id="info">Hold SPACE or CLICK to build bridge<br>Release to drop</div>
        <div id="hero"></div>
        <div id="stick"></div>
        <div class="pillar start-pillar"></div>
        <div class="success-flash"></div>
    </div>

    <script>
        const container = document.getElementById('game-container');
        const hero = document.getElementById('hero');
        const stick = document.getElementById('stick');
        const scoreEl = document.getElementById('score');
        const flash = document.querySelector('.success-flash');
        
        let state = 'waiting'; 
        let score = 0;
        let stickHeight = 0;
        let growInterval;
        let heroX = 40;
        let lives = 3;

        // Initialize state variables without offset
        let currentPillar = { el: document.querySelector('.start-pillar'), x: 0, w: 60 };
        let targetPillar = null; // Will be set by initGame

        function spawnPillar(startX) {
            const width = 40 + Math.random() * 50;
            const distance = 40 + Math.random() * (Math.min(250, 100 + score));
            const left = startX + distance; 
            
            const pillar = document.createElement('div');
            pillar.className = 'pillar';
            pillar.style.width = width + 'px';
            pillar.style.height = '200px';
            pillar.style.left = left + 'px';
            container.appendChild(pillar);
            return { el: pillar, x: left, w: width };
        }

        function initGame() {
            // Spawn first target
             targetPillar = spawnPillar(60);
        }

        initGame();

        function startGrow(e) {
            if (state !== 'waiting') return;
            if (e.type === 'keydown' && e.code !== 'Space') return;
            e.preventDefault();
            
            state = 'growing';
            stick.style.display = 'block';
            stick.style.height = '0px';
            stick.style.transform = 'rotate(0deg)';
            // Stick starts at the right edge of current pillar (screen coord)
            stick.style.left = (currentPillar.x + currentPillar.w) + 'px';
            stickHeight = 0;
            document.getElementById('info').style.opacity = '0';

            growInterval = setInterval(() => {
                stickHeight += 3;
                stick.style.height = stickHeight + 'px';
                if (stickHeight > 400) stopGrow(); 
            }, 10);
        }

        function stopGrow() {
            if (state !== 'growing') return;
            clearInterval(growInterval);
            state = 'falling';
            stick.style.transition = 'transform 0.4s ease-in';
            stick.style.transform = 'rotate(90deg)';
            setTimeout(() => walk(), 450);
        }

        function walk() {
            state = 'walking';
            let stickLen = stickHeight;
            // Calculations in screen coordinates
            const reach = (currentPillar.x + currentPillar.w) + stickLen;
            const targetStart = targetPillar.x;
            const targetEnd = targetPillar.x + targetPillar.w;
            
            const success = reach >= targetStart && reach <= targetEnd;
            const finalX = success ? targetEnd - 20 : (currentPillar.x + currentPillar.w + stickLen);
            
            hero.style.transition = \`left \${(finalX - heroX) / 200}s linear\`;
            heroX = finalX;
            hero.style.left = heroX + 'px'; // heroX is screen coord

            setTimeout(() => {
                if (success) {
                    levelUp();
                } else {
                    fall();
                }
            }, (finalX - (currentPillar.x + currentPillar.w - 20))*5 + 100);
        }

        function fall() {
            hero.style.transition = 'top 0.4s ease-in';
            hero.style.top = '400px';
            setTimeout(() => {
                lives--;
                if (lives <= 0) gameOver();
                else resetHero();
            }, 500);
        }

        function levelUp() {
            score += 10;
            scoreEl.innerText = score;
            flash.style.opacity = '1';
            setTimeout(() => flash.style.opacity = '0', 200);

            // Shift everything left so targetPillar becomes new currentPillar at x=0? 
            // Better: Shift so updated currentPillar is at x=0
            const moveBy = targetPillar.x - 0; // Move target to 0? No, current is 0.
            // Actually, we want to move the "Camera" so that the new current pillar (old target) is at the left.
            // CurrentPillar is at 0. Target is at X.
            // We want Target to be at 0. So we shift by Target.X.
            
            // However, visually we might want to keep some margin? 
            // Original code: currentPillar.x is 0. Target at X.
            // We want Target to move to Current's spot? Or just slide left?
            // Usually in these games, the character walks to the right, then the world slides left so the character is back on the left.
            
            const shiftAmount = targetPillar.x; 

            container.querySelectorAll('.pillar').forEach(p => {
                p.style.left = (parseFloat(p.style.left) - shiftAmount) + 'px';
            });
            
            hero.style.transition = 'none';
            heroX -= shiftAmount;
            hero.style.left = heroX + 'px';
            stick.style.display = 'none';

            currentPillar.el.remove();
            currentPillar = targetPillar;
            // Update the logical coordinate of the new current pillar
            currentPillar.x -= shiftAmount; 
            
            // Spawn new target
            setTimeout(() => {
               targetPillar = spawnPillar(currentPillar.x + currentPillar.w);
               state = 'waiting';
               if (score >= 100) gameComplete(true);
            }, 300);
        }

        function resetHero() {
            hero.style.transition = 'none';
            hero.style.top = '200px'; 
            heroX = currentPillar.x + 10;
            hero.style.left = heroX + 'px';
            stick.style.display = 'none';
            state = 'waiting';
        }

        function gameOver() {
            window.parent.postMessage({ 
                type: 'gameComplete', 
                score: score, 
                grade: score >= 100 ? 'S' : score >= 70 ? 'A' : score >= 40 ? 'B' : 'C',
                correct: score/10,
                incorrect: 3-lives
            }, '*');
        }

        function gameComplete(won) {
            window.parent.postMessage({ 
                type: 'gameComplete', 
                score: score, 
                grade: 'S',
                correct: score/10,
                incorrect: 3-lives
            }, '*');
        }

        window.addEventListener('mousedown', startGrow);
        window.addEventListener('mouseup', stopGrow);
        window.addEventListener('keydown', startGrow);
        window.addEventListener('keyup', stopGrow);
    </script>
</body>
</html>`;
