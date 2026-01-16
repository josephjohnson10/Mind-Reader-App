import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { analyzePerformance } from '../engine/GameEngine';
import { useNavigate } from 'react-router-dom';

const LETTERS = [
    { char: 'b', pair: 'd' },
    { char: 'p', pair: 'q' },
    { char: 'm', pair: 'w' },
    { char: 'n', pair: 'u' }
];

const LexicalLegends = () => {
    const { updateGameResult, userProfile, recordGameAttempt, emotionData } = useGame();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('start'); // start, playing, ended
    const [target, setTarget] = useState(LETTERS[0]);
    const [fallingItems, setFallingItems] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [difficulty, setDifficulty] = useState(1);
    const [metrics, setMetrics] = useState({ correct: 0, incorrect: 0, missed: 0, speed: 0, riskScores: [] });

    const spawnItem = useCallback(() => {
        const isTarget = Math.random() > 0.5;
        const char = isTarget ? target.char : target.pair;
        const id = Date.now() + Math.random();
        const x = Math.random() * 80 + 10; // 10% to 90% width

        setFallingItems(prev => [...prev, { id, char, x, isTarget, spawnTime: Date.now() }]);
    }, [target]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const ageFactor = (userProfile.age || 10) * 20;
        const intervalMs = Math.max(300, 1000 - ageFactor); // Min 300ms speed
        const spawnInterval = setInterval(spawnItem, intervalMs);
        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(spawnInterval);
            clearInterval(timerInterval);
        };
    }, [gameState, userProfile.age, spawnItem]);

    const handleItemClick = (id, isTarget) => {
        if (gameState !== 'playing') return;

        const item = fallingItems.find(i => i.id === id);
        const time = item ? (Date.now() - item.spawnTime) / 1000 : 1;
        
        // Record attempt with emotion tracking
        const riskScore = recordGameAttempt('lexical-legends', 'reading', difficulty, isTarget, time);
        
        setFallingItems(prev => prev.filter(item => item.id !== id));

        if (isTarget) {
            setScore(prev => prev + 100);
            setMetrics(prev => ({ 
                ...prev, 
                correct: prev.correct + 1,
                riskScores: [...prev.riskScores, riskScore]
            }));
        } else {
            setScore(prev => Math.max(0, prev - 50));
            setMetrics(prev => ({ 
                ...prev, 
                incorrect: prev.incorrect + 1,
                riskScores: [...prev.riskScores, riskScore]
            }));
        }
    };

    const endGame = () => {
        setGameState('ended');
        const avgRisk = metrics.riskScores.reduce((a, b) => a + b, 0) / (metrics.riskScores.length || 1);
        const analysis = analyzePerformance('lexical-legends', { ...metrics, riskScore: avgRisk }, userProfile.age);
        
        // Add emotion data
        analysis.riskScore = avgRisk;
        analysis.emotionData = emotionData.metrics;
        
        updateGameResult('lexicalLegends', { ...analysis, score });
        // Navigate to next game
        setTimeout(() => navigate('/play/focus-flight'), 2000);
    };

    const startGame = () => {
        const randomSet = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        setTarget(randomSet);
        setGameState('playing');
        setFallingItems([]);
        setScore(0);
        setTimeLeft(30);
        setMetrics({ correct: 0, incorrect: 0, missed: 0, speed: 0 });
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-xl border border-white/10 shadow-inner">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-black/20 backdrop-blur-sm">
                <div className="text-white font-mono text-xl">SCORE: <span className="text-primary">{score}</span></div>
                <div className="text-white font-bold text-2xl">TARGET: <span className="text-accent text-4xl mx-2">{target.char}</span></div>
                <div className="text-white font-mono text-xl text-red-400">{timeLeft}s</div>
            </div>

            {/* Game Area */}
            <AnimatePresence>
                {fallingItems.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 500, opacity: 1 }} // Assuming container height approx 500px, need to calibrate
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="absolute cursor-pointer flex items-center justify-center w-12 h-12 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 backdrop-blur"
                        style={{ left: `${item.x}%` }}
                        onClick={() => handleItemClick(item.id, item.isTarget)}
                        onAnimationComplete={() => {
                            if (item.isTarget) {
                                // Missed a target
                                setMetrics(prev => ({ ...prev, missed: prev.missed + 1 }));
                            }
                            setFallingItems(prev => prev.filter(i => i.id !== item.id));
                        }}
                    >
                        <span className="text-2xl font-bold text-white">{item.char}</span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Start Overlay */}
            {gameState === 'start' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <h2 className="text-4xl font-bold text-white mb-4 neon-text">Lexical Legends</h2>
                    <p className="text-gray-300 mb-8 max-w-md text-center">Tap only the letter <span className="text-accent font-bold text-2xl mx-1">{target.char}</span>. Ignore the others.</p>
                    <button
                        onClick={startGame}
                        className="px-8 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg transform hover:scale-105 transition-all"
                    >
                        START MISSION
                    </button>
                </div>
            )}

            {/* End Overlay */}
            {gameState === 'ended' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <h2 className="text-4xl font-bold text-white mb-4">Level 1 Complete</h2>
                    <p className="text-2xl text-primary font-mono mb-4">Score: {score}</p>
                    <p className="text-gray-400 animate-pulse">Initializing Focus Flight...</p>
                </div>
            )}
        </div>
    );
};

export default LexicalLegends;
