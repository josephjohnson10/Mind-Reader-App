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

    const updateGameResult = (gameId, resultData) => {
        setGameStats(prev => {
            const newStats = {
                ...prev,
                [gameId]: {
                    played: true,
                    score: resultData.score,
                    grade: resultData.grade,
                    correct: resultData.correct || 0,
                    incorrect: resultData.incorrect || 0,
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

            // Calculate comprehensive risk based on game performance
            const { score, grade, correct, incorrect } = resultData;
            
            // Base risk calculation from game performance
            let gameRisk = 0;
            
            // Grade-based risk (max 80%)
            if (grade === 'F') gameRisk = 60;
            else if (grade === 'C') gameRisk = 40;
            else if (grade === 'B') gameRisk = 20;
            else if (grade === 'A') gameRisk = 10;
            else if (grade === 'S') gameRisk = 5;
            
            // Adjust by accuracy if available
            if (correct !== undefined && incorrect !== undefined) {
                const total = correct + incorrect;
                if (total > 0) {
                    const accuracy = correct / total;
                    if (accuracy < 0.3) gameRisk += 20;
                    else if (accuracy < 0.5) gameRisk += 15;
                    else if (accuracy < 0.7) gameRisk += 10;
                }
            }
            
            // Score-based adjustment
            if (score < 50) gameRisk += 15;
            else if (score < 100) gameRisk += 10;
            else if (score < 150) gameRisk += 5;
            
            // Apply game-specific risk to appropriate disorders (cap at 80%)
            setLearningDisabilityRisk(prevRisk => {
                const updated = { ...prevRisk };
                
                // Map games to disorder types
                if (gameId === 'lexicalLegends' || gameId === 'treasureHunter') {
                    updated.dyslexia = Math.min(updated.dyslexia + gameRisk, 80);
                } else if (gameId === 'numberNinja' || gameId === 'defenderChallenge') {
                    updated.dyscalculia = Math.min(updated.dyscalculia + gameRisk, 80);
                } else if (gameId === 'spatialRecall' || gameId === 'memoryQuest') {
                    updated.dysgraphia = Math.min(updated.dysgraphia + gameRisk, 80);
                } else if (gameId === 'focusFlight' || gameId === 'voidChallenge') {
                    // Attention games - LOW score = HIGH ADHD risk
                    if (score < 200) {
                        updated.adhd = Math.min(updated.adhd + gameRisk, 80);
                    } else if (score > 300) {
                        // HIGH attention score = REDUCE ADHD
                        updated.adhd = Math.min(updated.adhd, 15);
                    }
                } else if (gameId === 'matrixReasoning' || gameId === 'warpExplorer') {
                    // Logic/reasoning affects multiple areas
                    updated.dyslexia = Math.min(updated.dyslexia + gameRisk * 0.3, 80);
                    updated.dyscalculia = Math.min(updated.dyscalculia + gameRisk * 0.3, 80);
                } else if (gameId === 'bridgeGame') {
                    updated.dyspraxia = Math.min((updated.dyspraxia || 0) + gameRisk, 80);
                }
                
                // Calculate overall risk
                const maxRisk = Math.max(
                    updated.dyslexia, 
                    updated.dyscalculia, 
                    updated.dysgraphia, 
                    updated.adhd,
                    updated.dyspraxia || 0,
                    updated.auditoryProcessing || 0
                );
                updated.overall = maxRisk < 25 ? 'Low' : maxRisk < 50 ? 'Medium' : 'High';
                
                return updated;
            });

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
