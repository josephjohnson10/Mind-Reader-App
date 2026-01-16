import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VoidChallenge = () => {
    const { updateGameResult, userProfile, recordGameAttempt } = useGame();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    
    const [gameState, setGameState] = useState('playing');
    const [lives, setLives] = useState(2);
    const [holesEntered, setHolesEntered] = useState(0);
    const [score, setScore] = useState(0);
    
    const gameDataRef = useRef({
        player: { x: 100, y: 200, width: 35, height: 35, velocityY: 0, gravity: 0.25, lift: -5.5 },
        blocks: [],
        blackHoles: [],
        invincibilityFrames: 0,
        metrics: { correct: 0, incorrect: 0, timeTaken: [] }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && gameState === 'playing') {
                gameDataRef.current.player.velocityY = gameDataRef.current.player.lift;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);

        const gameLoop = () => {
            if (gameState !== 'playing') return;
            
            update();
            draw(ctx);
            animationId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(animationId);
        };
    }, [gameState, lives, holesEntered]);

    const update = () => {
        const data = gameDataRef.current;
        const player = data.player;

        // Physics
        player.velocityY += player.gravity;
        player.y += player.velocityY;

        if (data.invincibilityFrames > 0) data.invincibilityFrames--;

        // Boundaries
        if (player.y + player.height > 465 || player.y < 0) {
            handleHit();
            if (player.y < 0) player.y = 0;
            if (player.y + player.height > 465) player.y = 465 - player.height;
        }

        // Spawning
        if (Math.random() < 0.012) {
            data.blocks.push({ x: 800, y: Math.random() * 380 + 20, width: 40, height: 40 });
        }
        if (Math.random() < 0.006 && holesEntered < 3) {
            data.blackHoles.push({ x: 800, y: Math.random() * 300 + 100, radius: 28 });
        }

        // Movement
        data.blocks.forEach(b => b.x -= 3.5);
        data.blackHoles.forEach(h => h.x -= 3.5);

        // Collision: Blocks
        data.blocks.forEach(b => {
            if (player.x < b.x + b.width &&
                player.x + player.width > b.x &&
                player.y < b.y + b.height &&
                player.y + player.height > b.y) {
                handleHit();
            }
        });

        // Collision: Black Holes
        data.blackHoles.forEach((h, index) => {
            if (rectCircleCollision(player, h)) {
                setGameState('question');
                askQuestion(index);
            }
        });

        data.blocks = data.blocks.filter(b => b.x > -50);
        data.blackHoles = data.blackHoles.filter(h => h.x > -100);
    };

    const draw = (ctx) => {
        ctx.clearRect(0, 0, 800, 500);

        // Ground
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 465, 800, 35);

        const data = gameDataRef.current;
        const player = data.player;

        // Player with flicker
        if (data.invincibilityFrames % 10 < 5) {
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // Blocks
        ctx.fillStyle = '#ff3333';
        data.blocks.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

        // Black Holes
        data.blackHoles.forEach(h => {
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.strokeStyle = '#bc00ff';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    };

    const rectCircleCollision = (rect, circle) => {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);
        if (distX > (rect.width / 2 + circle.radius)) return false;
        if (distY > (rect.height / 2 + circle.radius)) return false;
        return true;
    };

    const handleHit = () => {
        if (gameDataRef.current.invincibilityFrames > 0) return;
        
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                endGame();
            } else {
                gameDataRef.current.invincibilityFrames = 60;
            }
            return newLives;
        });
    };

    const askQuestion = (holeIndex) => {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const startTime = Date.now();
        
        setTimeout(() => {
            const answer = prompt(`VOID CHALLENGE: What is ${a} + ${b}?`);
            const timeSpent = (Date.now() - startTime) / 1000;
            const isCorrect = parseInt(answer) === (a + b);
            
            recordGameAttempt('void-challenge', 'number', 1, isCorrect, timeSpent);
            
            if (isCorrect) {
                setHolesEntered(prev => prev + 1);
                setScore(prev => prev + 100);
                gameDataRef.current.metrics.correct++;
                
                if (holesEntered + 1 >= 3) {
                    endGame();
                }
            } else {
                handleHit();
                gameDataRef.current.metrics.incorrect++;
            }
            
            gameDataRef.current.blackHoles.splice(holeIndex, 1);
            setGameState('playing');
        }, 50);
    };

    const endGame = () => {
        setGameState('ended');
        const data = gameDataRef.current;
        const analysis = {
            score: score,
            grade: holesEntered >= 3 ? 'A' : lives <= 0 ? 'C' : 'B',
            correct: data.metrics.correct,
            incorrect: data.metrics.incorrect,
            riskLevel: lives <= 0 ? 'Medium' : 'Low'
        };
        
        updateGameResult('voidChallenge', analysis);
        setTimeout(() => navigate('/play/warp-explorer'), 2000);
    };

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <div className="absolute top-4 left-4 text-white font-bold text-xl z-20">
                Lives: {lives} | Black Holes: {holesEntered} / 3
            </div>
            
            <canvas ref={canvasRef} width={800} height={500} className="bg-black/90 rounded-lg" />
            
            {gameState === 'ended' && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        {holesEntered >= 3 ? 'MISSION COMPLETE!' : 'GAME OVER'}
                    </h2>
                    <p className="text-gray-400 animate-pulse">Loading next challenge...</p>
                </div>
            )}
        </div>
    );
};

export default VoidChallenge;
