import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { analyzePerformance } from '../engine/GameEngine';
import { useNavigate } from 'react-router-dom';
import { Zap, AlertTriangle } from 'lucide-react';

const FocusFlight = () => {
    const { updateGameResult, userProfile } = useGame();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('start');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [obstacles, setObstacles] = useState([]); // {id, type: 'wall' | 'coin', x}
    const [playerY, setPlayerY] = useState(0); // 0 = ground, 1 = air
    const [metrics, setMetrics] = useState({ jumps: 0, crashes: 0, collected: 0, falseAlarms: 0 });

    // Game Loop Refs
    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    const playerYRef = useRef(0); // For immediate collision logic access

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(45);
        setObstacles([]);
        setMetrics({ jumps: 0, crashes: 0, collected: 0, falseAlarms: 0 });
        setPlayerY(0);
        playerYRef.current = 0;
        lastSpawnTime.current = Date.now();
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const jump = () => {
        if (gameState !== 'playing' || playerYRef.current > 0) return;
        setPlayerY(1);
        playerYRef.current = 1;
        setMetrics(prev => ({ ...prev, jumps: prev.jumps + 1 }));

        setTimeout(() => {
            setPlayerY(0);
            playerYRef.current = 0;
        }, 600);
    };

    const gameLoop = (time) => {
        if (gameState !== 'playing') {
            cancelAnimationFrame(requestRef.current);
            return;
        }

        // Spawn logic
        const now = Date.now();
        if (now - lastSpawnTime.current > 1500) { // Spawn every 1.5s
            if (Math.random() > 0.3) {
                const type = Math.random() > 0.6 ? 'coin' : 'wall';
                setObstacles(prev => [...prev, { id: now, type, x: 100 }]); // Start at 100% width
            }
            lastSpawnTime.current = now;
        }

        // Move obstacles & Collision
        setObstacles(prev => {
            return prev.map(obs => {
                const newX = obs.x - 1; // Speed

                // Collision Detection (Approximate)
                // Player is at x ~ 10-20%
                if (newX > 10 && newX < 20) {
                    if (obs.type === 'wall') {
                        if (playerYRef.current === 0 && !obs.hit) {
                            // CRASH
                            obs.hit = true;
                            setScore(s => Math.max(0, s - 50));
                            setMetrics(m => ({ ...m, crashes: m.crashes + 1 }));
                        }
                    } else if (obs.type === 'coin') {
                        if (playerYRef.current === 1 && !obs.hit) {
                            // COLLECT
                            obs.hit = true;
                            setScore(s => s + 100);
                            setMetrics(m => ({ ...m, collected: m.collected + 1 }));
                        }
                    }
                }
                return { ...obs, x: newX };
            }).filter(obs => obs.x > -10);
        });

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [gameState]);

    const endGame = () => {
        setGameState('ended');
        cancelAnimationFrame(requestRef.current);
        const analysis = analyzePerformance('focus-flight', metrics, userProfile.age);
        updateGameResult('focusFlight', score, analysis.grade, metrics);
        setTimeout(() => navigate('/play/number-ninja'), 2000);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') jump();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-xl border border-white/10 shadow-inner" onClick={jump}>
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-black/20 backdrop-blur-sm">
                <div className="text-white font-mono text-xl">SCORE: <span className="text-primary">{score}</span></div>
                <div className="text-white font-mono text-xl text-red-400">{timeLeft}s</div>
            </div>

            {/* Ground */}
            <div className="absolute bottom-0 w-full h-1/4 bg-gray-800 border-t border-white/20"></div>

            {/* Player */}
            <div
                className={`absolute left-[15%] w-12 h-12 bg-primary rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300 ease-in-out flex items-center justify-center`}
                style={{ bottom: playerY ? '40%' : '25%' }} // Jump height
            >
                <div className="w-8 h-1 bg-white/50 rounded-full"></div>
            </div>

            {/* Obstacles */}
            {obstacles.map(obs => (
                <div
                    key={obs.id}
                    className={`absolute w-10 h-10 flex items-center justify-center rounded transition-opacity duration-75 ${obs.hit ? 'opacity-0' : 'opacity-100'}`}
                    style={{ left: `${obs.x}%`, bottom: obs.type === 'coin' ? '45%' : '25%' }}
                >
                    {obs.type === 'wall' ? (
                        <div className="h-full w-4 bg-red-500 shadow-[0_0_10px_red]"></div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_yellow]"></div>
                    )}
                </div>
            ))}

            {/* Start Overlay */}
            {gameState === 'start' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <h2 className="text-4xl font-bold text-white mb-4 neon-text">Focus Flight</h2>
                    <p className="text-gray-300 mb-8 max-w-md text-center">Press <span className="font-bold border px-2 py-1 rounded mx-1">SPACE</span> to Jump.</p>
                    <ul className="text-sm text-gray-400 mb-8 list-disc text-left">
                        <li>Jump over <span className="text-red-500">Red Walls</span></li>
                        <li>Jump to catch <span className="text-yellow-400">Coins</span></li>
                    </ul>
                    <button
                        onClick={(e) => { e.stopPropagation(); startGame(); }}
                        className="px-8 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg transform hover:scale-105 transition-all"
                    >
                        LAUNCH
                    </button>
                </div>
            )}
            {gameState === 'ended' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <h2 className="text-white text-3xl mb-4">Level 1 Complete</h2>
                    <p className="text-primary text-4xl font-bold">{score} pts</p>
                    <p className="text-gray-400 animate-pulse">Initializing Number Ninja...</p>
                </div>
            )}
        </div>
    );
};

export default FocusFlight;
