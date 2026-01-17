import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import EmotionDetector from '../services/emotionDetector';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState({
        name: '',
        age: 10, // Default age
        avatar: 'default'
    });

    const [gameStats, setGameStats] = useState({
        lexicalLegends: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        focusFlight: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        numberNinja: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        voidChallenge: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        bridgeGame: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        treasureHunter: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        matrixReasoning: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        spatialRecall: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        questionnaire: { completed: false, analysis: null }
    });

    const [emotionData, setEmotionData] = useState({
        currentEmotion: 'neutral',
        metrics: null,
        isActive: false
    });

    const [learningDisabilityRisk, setLearningDisabilityRisk] = useState({
        dyslexia: 0,
        dyscalculia: 0,
        dysgraphia: 0,
        adhd: 0,
        overall: 'Low'
    });

    const emotionDetectorRef = useRef(null);

    // Initialize emotion detector
    useEffect(() => {
        emotionDetectorRef.current = new EmotionDetector();

        // Set up emotion change callback
        emotionDetectorRef.current.onEmotionChange = (emotion, metrics) => {
            setEmotionData({
                currentEmotion: emotion,
                metrics: metrics,
                isActive: true
            });
        };

        return () => {
            if (emotionDetectorRef.current) {
                emotionDetectorRef.current.cleanup();
            }
        };
    }, []);

    // Start emotion detection
    const startEmotionDetection = async () => {
        if (emotionDetectorRef.current && !emotionData.isActive) {
            const initialized = await emotionDetectorRef.current.initialize();
            if (initialized) {
                emotionDetectorRef.current.startDetection();
                setEmotionData(prev => ({ ...prev, isActive: true }));
            }
        }
    };

    // Stop emotion detection
    const stopEmotionDetection = () => {
        if (emotionDetectorRef.current) {
            emotionDetectorRef.current.stopDetection();
            setEmotionData(prev => ({ ...prev, isActive: false }));
        }
    };

    const submitQuestionnaire = (analysis) => {
        setGameStats(prev => ({
            ...prev,
            questionnaire: { completed: true, analysis }
        }));

        // Add initial risk from questionnaire responses (cap at 80%)
        setLearningDisabilityRisk(prevRisk => {
            const updated = { ...prevRisk };

            // Each "yes" answer adds base risk
            if (analysis.dyslexiaScore >= 2) {
                updated.dyslexia = Math.min(updated.dyslexia + 25, 80);
            } else if (analysis.dyslexiaScore >= 1) {
                updated.dyslexia = Math.min(updated.dyslexia + 15, 80);
            }

            if (analysis.dyscalculiaScore >= 2) {
                updated.dyscalculia = Math.min(updated.dyscalculia + 25, 80);
            } else if (analysis.dyscalculiaScore >= 1) {
                updated.dyscalculia = Math.min(updated.dyscalculia + 15, 80);
            }

            if (analysis.adhdScore >= 2) {
                updated.adhd = Math.min(updated.adhd + 25, 80);
            } else if (analysis.adhdScore >= 1) {
                updated.adhd = Math.min(updated.adhd + 15, 80);
            }

            const maxRisk = Math.max(updated.dyslexia, updated.dyscalculia, updated.adhd);
            updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';

            return updated;
        });
    };

    const updateProfile = (name, age) => {
        setUserProfile({ ...userProfile, name, age });
    };

    // Record game attempt with emotion tracking
    const recordGameAttempt = (gameId, taskType, difficulty, isCorrect, timeSpent) => {
        if (emotionDetectorRef.current) {
            const riskData = emotionDetectorRef.current.calculateRiskScore(
                taskType,
                difficulty,
                isCorrect,
                timeSpent
            );

            // Update risk scores based on task type - cap at 80%
            setLearningDisabilityRisk(prev => {
                const updated = { ...prev };

                // Check attention performance from games
                const focusFlightScore = gameStats.focusFlight.score || 0;
                const voidChallengeScore = gameStats.voidChallenge.score || 0;
                const hasHighAttention = focusFlightScore > 300 || voidChallengeScore > 200;

                // Add ADHD risk from rapid emotion shifts ONLY
                // BUT if attention is high, cap ADHD at very low levels
                if (hasHighAttention) {
                    // Good attention = no ADHD, cap at 20%
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk, 20);
                } else {
                    // Normal ADHD risk calculation, cap at 80%
                    updated.adhd = Math.min(prev.adhd + riskData.adhdRisk, 80);
                }

                if (taskType === 'reading') {
                    updated.dyslexia = Math.min(prev.dyslexia + riskData.totalRisk, 80);
                } else if (taskType === 'number') {
                    updated.dyscalculia = Math.min(prev.dyscalculia + riskData.totalRisk, 80);
                } else if (taskType === 'writing') {
                    updated.dysgraphia = Math.min(prev.dysgraphia + riskData.totalRisk, 80);
                }

                // Calculate overall risk including ADHD (more conservative thresholds)
                const maxRisk = Math.max(updated.dyslexia, updated.dyscalculia, updated.dysgraphia, updated.adhd);
                updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';

                return updated;
            });

            return riskData.totalRisk;
        }
        return 0;
    };

    // Recalculate total risk based on ALL game stats and questionnaire
    const calculateTotalRisk = (currentStats, questionnaireAnalysis) => {
        const risks = {
            dyslexia: [],
            dyscalculia: [],
            dysgraphia: [],
            adhd: [],
            dyspraxia: []
        };

        // 1. Questionnaire Baseline (if exists) - Weight: 30%
        if (questionnaireAnalysis) {
            if (questionnaireAnalysis.dyslexiaScore > 0) risks.dyslexia.push(questionnaireAnalysis.dyslexiaScore * 25);
            if (questionnaireAnalysis.dyscalculiaScore > 0) risks.dyscalculia.push(questionnaireAnalysis.dyscalculiaScore * 25);
            if (questionnaireAnalysis.adhdScore > 0) risks.adhd.push(questionnaireAnalysis.adhdScore * 25);
        }

        // 2. Game Performance - Weight: 70% (Average of games)
        Object.entries(currentStats).forEach(([gameId, stats]) => {
            if (!stats.played) return;

            // Normalize each game's risk score (0-100)
            const gameRisk = stats.riskScore || 0;

            // Map games to disorders
            if (gameId === 'lexicalLegends') risks.dyslexia.push(gameRisk);
            if (gameId === 'treasureHunter') risks.dyslexia.push(gameRisk);

            if (gameId === 'numberNinja') risks.dyscalculia.push(gameRisk);
            if (gameId === 'defenderChallenge') risks.dyscalculia.push(gameRisk);
            if (gameId === 'matrixReasoning') risks.dyscalculia.push(gameRisk * 0.5);

            if (gameId === 'spatialRecall') risks.dysgraphia.push(gameRisk);
            if (gameId === 'memoryQuest') risks.dysgraphia.push(gameRisk);

            if (gameId === 'focusFlight') risks.adhd.push(gameRisk);
            if (gameId === 'voidChallenge') risks.adhd.push(gameRisk);

            if (gameId === 'bridgeGame') risks.dyspraxia.push(gameRisk);
            if (gameId === 'warpExplorer') risks.dyspraxia.push(gameRisk * 0.5);
        });

        // Helper to average an array
        const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        // Calculate final weighted scores
        const finalRisks = {
            dyslexia: Math.min(avg(risks.dyslexia), 95),
            dyscalculia: Math.min(avg(risks.dyscalculia), 95),
            dysgraphia: Math.min(avg(risks.dysgraphia), 95),
            adhd: Math.min(avg(risks.adhd), 95),
            dyspraxia: Math.min(avg(risks.dyspraxia), 95)
        };

        // Overall risk is the highest specific risk found
        const maxRisk = Math.max(
            finalRisks.dyslexia,
            finalRisks.dyscalculia,
            finalRisks.dysgraphia,
            finalRisks.adhd,
            finalRisks.dyspraxia
        );

        finalRisks.overall = maxRisk < 20 ? 'Low' : maxRisk < 45 ? 'Medium' : 'High';

        return finalRisks;
    };

    const updateGameResult = (gameId, resultData) => {
        // Calculate Risk for THIS specific game session
        let sessionRisk = 0;
        const { score, grade, correct, incorrect } = resultData;

        // 1. Grade Basis
        if (grade === 'F') sessionRisk = 85;
        else if (grade === 'C') sessionRisk = 55;
        else if (grade === 'B') sessionRisk = 30;
        else if (grade === 'A') sessionRisk = 10;
        else if (grade === 'S') sessionRisk = 0;

        // 2. Accuracy Penalty
        if (correct !== undefined && incorrect !== undefined && (correct + incorrect) > 0) {
            const accuracy = correct / (correct + incorrect);
            if (accuracy < 0.4) sessionRisk += 15; // High penalty for low accuracy
            else if (accuracy < 0.6) sessionRisk += 10;
        }

        // 3. Score Thresholds (Game specific)
        if (gameId === 'focusFlight' || gameId === 'voidChallenge') {
            // Attention games need higher thresholds
            if (score < 150) sessionRisk += 10;
        } else {
            if (score < 50) sessionRisk += 10;
        }

        // Clamp session risk 0-100
        sessionRisk = Math.min(Math.max(sessionRisk, 0), 100);

        setGameStats(prev => {
            const newStats = {
                ...prev,
                [gameId]: {
                    played: true,
                    score: resultData.score,
                    grade: resultData.grade,
                    correct: resultData.correct || 0,
                    incorrect: resultData.incorrect || 0,
                    riskLevel: sessionRisk < 20 ? 'Low' : sessionRisk < 50 ? 'Medium' : 'High',
                    riskScore: sessionRisk, // Store the calculated risk for this game
                    feedback: resultData.feedback || '',
                    emotionMetrics: emotionData.metrics,
                    metrics: resultData.metrics || null,
                    analysis: resultData.analysis || null,
                    history: [...prev[gameId].history, {
                        date: new Date(),
                        ...resultData,
                        riskScore: sessionRisk,
                        emotionData: emotionData.metrics
                    }]
                }
            };

            // Recalculate GLOBAL risk based on this new state
            const newGlobalRisk = calculateTotalRisk(newStats, newStats.questionnaire.analysis);
            setLearningDisabilityRisk(newGlobalRisk);

            return newStats;
        });
    };

    return (
        <GameContext.Provider value={{
            userProfile,
            updateProfile,
            gameStats,
            updateGameResult,
            submitQuestionnaire,
            emotionData,
            learningDisabilityRisk,
            startEmotionDetection,
            stopEmotionDetection,
            recordGameAttempt,
            emotionDetector: emotionDetectorRef.current
        }}>
            {children}
        </GameContext.Provider>
    );
};
