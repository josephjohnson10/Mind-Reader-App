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
        memoryQuest: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        warpExplorer: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        bridgeGame: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        treasureHunter: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
        defenderChallenge: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
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

    const updateGameResult = (gameId, resultData) => {
        setGameStats(prev => {
            const newStats = {
                ...prev,
                [gameId]: {
                    played: true,
                    score: resultData.score,
                    grade: resultData.grade,
                    riskLevel: resultData.riskLevel || 'Low',
                    riskScore: resultData.riskScore || 0,
                    feedback: resultData.feedback || '',
                    emotionMetrics: emotionData.metrics,
                    history: [...prev[gameId].history, { 
                        date: new Date(), 
                        ...resultData,
                        emotionData: emotionData.metrics 
                    }]
                }
            };

            // After updating game stats, check if attention games show high performance
            // and reduce ADHD risk accordingly
            if (gameId === 'focusFlight' || gameId === 'voidChallenge') {
                const focusScore = gameId === 'focusFlight' ? resultData.score : prev.focusFlight.score;
                const voidScore = gameId === 'voidChallenge' ? resultData.score : prev.voidChallenge.score;
                
                if (focusScore > 300 || voidScore > 200) {
                    // High attention performance detected - reduce ADHD risk
                    setLearningDisabilityRisk(prevRisk => ({
                        ...prevRisk,
                        adhd: Math.min(prevRisk.adhd, 20) // Cap at 20% if attention is good
                    }));
                }
            }

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
