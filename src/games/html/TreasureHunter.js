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
