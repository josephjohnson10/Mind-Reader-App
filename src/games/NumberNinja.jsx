import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { analyzePerformance } from '../engine/GameEngine';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { generateMissionBriefing } from '../services/openai';

const NumberNinja = () => {
    const { updateGameResult, userProfile, recordGameAttempt, emotionData } = useGame();
    const navigate = useNavigate();

    // State
    const [gameState, setGameState] = useState('briefing');
    const [briefing, setBriefing] = useState("Initializing mission parameters...");
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(40);
    const [problem, setProblem] = useState(null);
    const [difficulty, setDifficulty] = useState(1); // 1=easy, 2=medium, 3=hard
    const [metrics, setMetrics] = useState({ correct: 0, incorrect: 0, timeTaken: [], riskScores: [] });

    // Load Briefing
    useEffect(() => {
        const fetchBriefing = async () => {
            const story = await generateMissionBriefing(userProfile.name, "Number Ninja");
            setBriefing(story);
            setLoading(false);
        };
        fetchBriefing();
    }, [userProfile.name]);

    const generateProblem = () => {
        const op = Math.random() > 0.5 ? '+' : '-';
        const range = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 50;
        const a = Math.floor(Math.random() * range) + 1;
        const b = Math.floor(Math.random() * range) + 1;
        let ans = op === '+' ? a + b : a - b;

        let eq = `${a} ${op} ${b}`;
        if (ans < 0) {
            ans = b - a;
            eq = `${b} ${op} ${a}`;
        }

        const options = [ans];
        while (options.length < 3) {
            const wrong = ans + Math.floor(Math.random() * 5) - 2;
            if (wrong !== ans && wrong >= 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }

        setProblem({
            eq,
            ans,
            options: options.sort(() => Math.random() - 0.5),
            spawnTime: Date.now(),
            difficulty: difficulty
        });
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(25);
        setMetrics({ correct: 0, incorrect: 0, timeTaken: [], riskScores: [] });
        generateProblem();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOptionClick = (val) => {
        if (gameState !== 'playing') return;

        const time = (Date.now() - problem.spawnTime) / 1000;
        const isCorrect = val === problem.ans;
        
        // Record attempt with emotion tracking
        const riskScore = recordGameAttempt('number-ninja', 'number', problem.difficulty, isCorrect, time);
        
        setMetrics(prev => ({ 
            ...prev, 
            timeTaken: [...prev.timeTaken, time],
            riskScores: [...prev.riskScores, riskScore]
        }));

        if (isCorrect) {
            setScore(s => s + 100 + Math.floor(Math.max(0, 5 - time) * 10));
            setMetrics(prev => ({ 
                ...prev, 
                correct: prev.correct + 1 
            }));
            
            // Increase difficulty after 3 correct answers
            if (metrics.correct > 0 && metrics.correct % 3 === 0 && difficulty < 3) {
                setDifficulty(d => d + 1);
            }
        } else {
            setScore(s => Math.max(0, s - 50));
            setMetrics(prev => ({ 
                ...prev, 
                incorrect: prev.incorrect + 1 
            }));
        }
        
        generateProblem();
    };

    const endGame = () => {
        setGameState('ended');
        const avgTime = metrics.timeTaken.reduce((a, b) => a + b, 0) / (metrics.timeTaken.length || 1);
        const avgRisk = metrics.riskScores.reduce((a, b) => a + b, 0) / (metrics.riskScores.length || 1);
        const analysisMetrics = { ...metrics, speed: avgTime, riskScore: avgRisk };
        const analysis = analyzePerformance('number-ninja', analysisMetrics, userProfile.age);
        
        analysis.riskScore = avgRisk;
        analysis.emotionData = emotionData.metrics;
        
        updateGameResult('numberNinja', analysis);
        setTimeout(() => navigate('/play/void-challenge'), 2000);
    };

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-xl border border-white/10 shadow-inner flex flex-col items-center justify-center pt-20">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="glass-panel px-6 py-2 rounded-full">
                    <span className="text-gray-400 font-mono text-sm mr-2">SCORE</span>
                    <span className="text-primary font-bold text-2xl">{score}</span>
                </div>
                <div className="glass-panel px-6 py-2 rounded-full border-red-500/30">
                    <span className="text-red-400 font-mono text-xl font-bold">{timeLeft}s</span>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {gameState === 'playing' && problem && (
                    <motion.div
                        key={problem.eq}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <h2 className="text-7xl font-bold text-white neon-text">{problem.eq} = ?</h2>

                        <div className="flex gap-6">
                            {problem.options.map((opt, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(124, 58, 237, 0.4)" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleOptionClick(opt)}
                                    className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 text-4xl font-bold text-white flex items-center justify-center hover:border-primary transition-all"
                                >
                                    {opt}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Briefing Overlay */}
            {gameState === 'briefing' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-30 p-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6 neon-text">Mission: Number Ninja</h2>

                    <div className="max-w-xl w-full bg-white/5 p-8 rounded-xl border-l-4 border-primary mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse" />

                        <h3 className="text-primary font-bold mb-4 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Incoming Transmission
                        </h3>

                        {loading ? (
                            <p className="text-gray-400 font-mono animate-pulse">Deciphering encrypted signal...</p>
                        ) : (
                            <p className="text-lg text-gray-100 leading-relaxed font-mono typing-effect">
                                "{briefing}"
                            </p>
                        )}
                    </div>

                    {!loading && (
                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl transform hover:scale-105 transition-all flex items-center gap-3 text-lg shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                        >
                            ACCEPT MISSION <ArrowRight size={24} />
                        </button>
                    )}
                </div>
            )}

            {gameState === 'ended' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                    <h2 className="text-white text-3xl mb-4">Level 2 Complete</h2>
                    <p className="text-primary text-4xl font-bold">{score} pts</p>
                    <p className="text-gray-400 animate-pulse">Initializing Matrix Logic...</p>
                </div>
            )}
        </div>
    );
};

export default NumberNinja;
