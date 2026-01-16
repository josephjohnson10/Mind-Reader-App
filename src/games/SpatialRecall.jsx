import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { analyzePerformance } from '../engine/GameEngine';
import { useNavigate } from 'react-router-dom';

const SpatialRecall = () => {
    const { updateGameResult, userProfile } = useGame();
    const navigate = useNavigate();
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [pattern, setPattern] = useState([]);
    const [userPattern, setUserPattern] = useState([]);
    const [phase, setPhase] = useState('start'); // start, memorize, recall, result, ended
    const [dim, setDim] = useState(3); // 3x3 grid initially
    const [metrics, setMetrics] = useState({ correct: 0, incorrect: 0, maxLevel: 1 });

    const generatePattern = (gridSize, count) => {
        const newPattern = [];
        while (newPattern.length < count) {
            const idx = Math.floor(Math.random() * (gridSize * gridSize));
            if (!newPattern.includes(idx)) newPattern.push(idx);
        }
        return newPattern;
    };

    const startLevel = () => {
        const count = 3 + Math.floor(level / 2);
        const gridSize = level > 3 ? 4 : 3;
        setDim(gridSize);
        const newP = generatePattern(gridSize, count);
        setPattern(newP);
        setUserPattern([]);
        setPhase('memorize');

        // Show for 2 seconds then hide
        setTimeout(() => {
            setPhase('recall');
        }, 2000);
    };

    const handleCellClick = (idx) => {
        if (phase !== 'recall') return;

        const newSelection = [...userPattern, idx];
        setUserPattern(newSelection);

        // Check immediate validity if strict, or wait for full submission?
        // Let's do partial check for better feedback
        if (!pattern.includes(idx)) {
            // Wrong cell clicked immediately
            handleFailure();
            return;
        }

        if (newSelection.length === pattern.length) {
            handleSuccess();
        }
    };

    const handleSuccess = () => {
        setScore(s => s + (level * 100));
        setMetrics(m => ({ ...m, correct: m.correct + 1, maxLevel: level }));

        if (level >= 5) {
            endGame();
        } else {
            setLevel(l => l + 1);
            setPhase('result');
            setTimeout(startLevel, 1000);
        }
    };

    const handleFailure = () => {
        setMetrics(m => ({ ...m, incorrect: m.incorrect + 1 }));
        endGame();
    };

    const endGame = () => {
        setPhase('ended');
        const analysis = analyzePerformance('spatial-recall', metrics, userProfile.age);
        updateGameResult('spatialRecall', analysis);
        setTimeout(() => navigate('/results'), 2000); // Go to results finally
    };

    return (
        <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
            <header className="mb-8 w-full flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <h2 className="text-2xl font-bold text-white neon-text">Visual Memory</h2>
                <div className="text-primary font-mono text-xl">Lvl: {level}</div>
            </header>

            {phase === 'start' && (
                <div className="text-center space-y-6">
                    <p className="text-gray-300 text-lg">Memorize the highlighted tiles.</p>
                    <button
                        onClick={startLevel}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                        START MEMORY
                    </button>
                </div>
            )}

            {(phase === 'memorize' || phase === 'recall' || phase === 'result') && (
                <div
                    className="grid gap-4 w-full aspect-square"
                    style={{ gridTemplateColumns: `repeat(${dim}, 1fr)` }}
                >
                    {Array.from({ length: dim * dim }).map((_, i) => (
                        <motion.div
                            key={i}
                            whileTap={phase === 'recall' ? { scale: 0.9 } : {}}
                            onClick={() => handleCellClick(i)}
                            className={`
                                rounded-xl cursor-pointer border-2 transition-all duration-300
                                ${phase === 'memorize' && pattern.includes(i) ? 'bg-primary border-primary shadow-[0_0_15px_rgba(79,70,229,0.6)]' : ''}
                                ${phase === 'recall' && userPattern.includes(i) ? 'bg-green-500 border-green-500' : ''}
                                ${phase === 'recall' && !userPattern.includes(i) ? 'bg-white/5 border-white/10 hover:bg-white/10' : ''}
                            `}
                        />
                    ))}
                </div>
            )}

            {phase === 'ended' && (
                <div className="text-center">
                    <h2 className="text-3xl text-white mb-4">Assessment Complete</h2>
                    <p className="text-primary text-4xl font-bold">{score} pts</p>
                    <p className="text-gray-400 animate-pulse mt-4">Generating Final Report...</p>
                </div>
            )}
        </div>
    );
};

export default SpatialRecall;
