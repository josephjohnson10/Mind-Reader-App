import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { analyzePerformance } from '../engine/GameEngine';
import { useNavigate } from 'react-router-dom';

const MatrixReasoning = () => {
    const { updateGameResult, userProfile, gameStats } = useGame();
    const navigate = useNavigate();
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [metrics, setMetrics] = useState({ correct: 0, incorrect: 0, timeTaken: [] });
    const [startTime, setStartTime] = useState(Date.now());
    const [gameState, setGameState] = useState('start');

    // Simple pattern logic: 
    // 1. Color matching
    // 2. Shape rotation
    // 3. Number/Count progression
    const questions = [
        {
            id: 1,
            grid: [
                '🟦', '🟦', '🟦',
                '🟥', '🟥', '🟥',
                '🟩', '🟩', '?'
            ],
            options: ['🟦', '🟥', '🟩', '🟨'],
            answer: '🟩',
            logic: 'Row color consistency'
        },
        {
            id: 2,
            grid: [
                '⬆️', '➡️', '⬇️',
                '⬅️', '⬆️', '➡️',
                '⬇️', '⬅️', '?'
            ],
            options: ['⬆️', '➡️', '⬇️', '⬅️'],
            answer: '⬆️',
            logic: 'Rotation sequence'
        },
        {
            id: 3,
            grid: [
                '●', '●●', '●●●',
                '■', '■■', '■■■',
                '▲', '▲▲', '?'
            ],
            options: ['▲', '▲▲', '▲▲▲', '▲▲▲▲'],
            answer: '▲▲▲',
            logic: 'Quantity progression'
        }
    ];

    const handleAnswer = (option) => {
        const timeSpent = (Date.now() - startTime) / 1000;
        setMetrics(prev => ({
            ...prev,
            timeTaken: [...prev.timeTaken, timeSpent],
            correct: option === questions[qIndex].answer ? prev.correct + 1 : prev.correct,
            incorrect: option !== questions[qIndex].answer ? prev.incorrect + 1 : prev.incorrect
        }));

        if (option === questions[qIndex].answer) {
            setScore(prev => prev + 150);
        }

        if (qIndex < questions.length - 1) {
            setQIndex(prev => prev + 1);
            setStartTime(Date.now());
        } else {
            endGame();
        }
    };

    const endGame = () => {
        setGameState('ended');
        const avgTime = metrics.timeTaken.reduce((a, b) => a + b, 0) / metrics.timeTaken.length;
        const finalMetrics = { ...metrics, speed: avgTime }; // reuse metric structure

        const analysis = analyzePerformance('matrix-reasoning', finalMetrics, userProfile.age);
        updateGameResult('matrixReasoning', analysis);

        // Chain to next game
        setTimeout(() => navigate('/play/spatial-recall'), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
            <header className="mb-8 w-full flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <h2 className="text-2xl font-bold text-white neon-text">Matrix Logic</h2>
                <div className="text-primary font-mono text-xl">Score: {score}</div>
            </header>

            {gameState === 'start' ? (
                <div className="text-center space-y-6">
                    <p className="text-gray-300 text-lg">Identify the missing piece to complete the pattern.</p>
                    <button
                        onClick={() => { setGameState('playing'); setStartTime(Date.now()); }}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                        START PUZZLE
                    </button>
                </div>
            ) : gameState === 'playing' ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* The Grid */}
                    <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-3 gap-4 bg-white/10 p-6 rounded-2xl aspect-square"
                    >
                        {questions[qIndex].grid.map((cell, i) => (
                            <div key={i} className={`flex items-center justify-center text-4xl bg-black/40 rounded-lg aspect-square border ${cell === '?' ? 'border-primary border-dashed animate-pulse' : 'border-white/10'}`}>
                                {cell}
                            </div>
                        ))}
                    </motion.div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-4">
                        {questions[qIndex].options.map((opt, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(79, 70, 229, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer(opt)}
                                className="h-32 bg-card border border-white/20 rounded-xl text-5xl flex items-center justify-center hover:border-primary transition-colors"
                            >
                                {opt}
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h2 className="text-3xl text-white mb-4">Module Complete</h2>
                    <p className="text-primary text-4xl font-bold">{score} pts</p>
                    <p className="text-gray-400 animate-pulse mt-4">Loading Spatial Memory...</p>
                </div>
            )}
        </div>
    );
};

export default MatrixReasoning;
