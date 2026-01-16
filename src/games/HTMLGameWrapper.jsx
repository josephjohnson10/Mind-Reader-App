import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const HTMLGameWrapper = ({ gameId, htmlContent, nextGame }) => {
    const iframeRef = useRef(null);
    const navigate = useNavigate();
    const { updateGameResult, recordGameAttempt } = useGame();
    const [showFailQuestions, setShowFailQuestions] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [gameFailed, setGameFailed] = useState(false);
    const [gameScore, setGameScore] = useState(0);

    // Reset all question states when gameId changes
    useEffect(() => {
        setShowFailQuestions(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setGameFailed(false);
        setGameScore(0);
    }, [gameId]);

    // Generate 2 questions from original games when HTML game fails
    const generateFailQuestions = (gameType) => {
        const questionSets = {
            voidChallenge: [
                {
                    type: 'reading',
                    instruction: 'Look carefully at each letter. The letters "b" and "d" are mirror images',
                    question: 'Which letter is different?\nb  b  d  b',
                    options: ['1st position', '2nd position', '3rd position', '4th position'],
                    answer: '3rd position',
                    taskType: 'reading',
                    difficulty: 1,
                    startTime: Date.now()
                },
                {
                    type: 'number',
                    instruction: 'Solve this addition problem quickly',
                    question: '15 + 23 = ?',
                    options: ['36', '38', '40', '42'],
                    answer: '38',
                    taskType: 'number',
                    difficulty: 2,
                    startTime: Date.now()
                }
            ],
            memoryQuest: [
                {
                    type: 'attention',
                    instruction: 'Focus on the moving objects and identify what you see most',
                    question: 'Which shape appears most frequently?\n●●●   ■■   ▲▲▲▲   ★★',
                    options: ['● (3 times)', '■ (2 times)', '▲ (4 times)', '★ (2 times)'],
                    answer: '▲ (4 times)',
                    taskType: 'attention',
                    difficulty: 1,
                    startTime: Date.now()
                },
                {
                    type: 'number',
                    instruction: 'Solve this multiplication problem',
                    question: '8 × 6 = ?',
                    options: ['42', '48', '54', '56'],
                    answer: '48',
                    taskType: 'number',
                    difficulty: 2,
                    startTime: Date.now()
                }
            ],
            warpExplorer: [
                {
                    type: 'reading',
                    instruction: 'These letters look similar. Pay attention to which way they face',
                    question: 'Find the letter "p":\np  q  b  d',
                    options: ['1st position', '2nd position', '3rd position', '4th position'],
                    answer: '1st position',
                    taskType: 'reading',
                    difficulty: 1,
                    startTime: Date.now()
                },
                {
                    type: 'number',
                    instruction: 'Solve this subtraction problem',
                    question: '45 - 17 = ?',
                    options: ['26', '28', '30', '32'],
                    answer: '28',
                    taskType: 'number',
                    difficulty: 2,
                    startTime: Date.now()
                }
            ],
            bridgeGame: [
                {
                    type: 'attention',
                    instruction: 'Jumping requires split-second timing. Test your quick reaction',
                    question: 'Press the correct button as fast as possible!\nWhich is GREEN?',
                    options: ['🔴 RED', '🔵 BLUE', '🟢 GREEN', '🟡 YELLOW'],
                    answer: '🟢 GREEN',
                    taskType: 'attention',
                    difficulty: 1,
                    startTime: Date.now()
                },
                {
                    type: 'number',
                    instruction: 'Count the dots carefully',
                    question: 'Which option has MORE dots?',
                    options: ['●●●● (4 dots)', '●●● (3 dots)', '●●●●● (5 dots)', '●● (2 dots)'],
                    answer: '●●●●● (5 dots)',
                    taskType: 'number',
                    difficulty: 1,
                    startTime: Date.now()
                }
            ],
            treasureHunter: [
                {
                    type: 'reading',
                    instruction: 'Reading speed test. Identify words quickly',
                    question: 'Which word is spelled correctly?',
                    options: ['teh', 'the', 'hte', 'eht'],
                    answer: 'the',
                    taskType: 'reading',
                    difficulty: 1,
                    startTime: Date.now()
                },
                {
                    type: 'number',
                    instruction: 'Quick math - speed and accuracy matter',
                    question: '7 + 9 = ?',
                    options: ['14', '15', '16', '17'],
                    answer: '16',
                    taskType: 'number',
                    difficulty: 1,
                    startTime: Date.now()
                }
            ],
            defenderChallenge: [
                {
                    type: 'attention',
                    instruction: 'Focus on specific targets among distractions',
                    question: 'Count only the red circles (🔴):\n🔴 🔵 🔴 🔵 🔴 🔵',
                    options: ['2', '3', '4', '6'],
                    answer: '3',
                    taskType: 'attention',
                    difficulty: 1,
                    startTime: Date.now()
                },
                {
                    type: 'number',
                    instruction: 'Solve this division problem',
                    question: '12 ÷ 3 = ?',
                    options: ['3', '4', '5', '6'],
                    answer: '4',
                    taskType: 'number',
                    difficulty: 1,
                    startTime: Date.now()
                }
            ]
        };

        return questionSets[gameType] || questionSets.voidChallenge;
    };

    const handleQuestionAnswer = (answer) => {
        const question = questions[currentQuestionIndex];
        const timeSpent = (Date.now() - question.startTime) / 1000;
        const isCorrect = answer === question.answer;
        
        // Calculate difficulty based on speed and correctness
        let adjustedDifficulty = question.difficulty;
        
        // If very fast (< 2 sec) and wrong = impulsive/careless (increase risk)
        if (timeSpent < 2 && !isCorrect) {
            adjustedDifficulty = Math.min(question.difficulty + 1, 3);
        }
        // If very slow (> 10 sec) and wrong = struggling (increase risk)
        else if (timeSpent > 10 && !isCorrect) {
            adjustedDifficulty = Math.min(question.difficulty + 1, 3);
        }
        
        recordGameAttempt(gameId, question.taskType, adjustedDifficulty, isCorrect, timeSpent);
        
        setSelectedAnswer(answer);
        
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                const nextIndex = currentQuestionIndex + 1;
                // Set start time for next question
                setQuestions(q => {
                    const updated = [...q];
                    if (updated[nextIndex]) {
                        updated[nextIndex].startTime = Date.now();
                    }
                    return updated;
                });
                setCurrentQuestionIndex(nextIndex);
                setSelectedAnswer(null);
            } else {
                // All questions answered, proceed to next game
                setShowFailQuestions(false);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setTimeout(() => navigate(`/play/${nextGame}`), 1000);
            }
        }, 1500);
    };

    useEffect(() => {
        const handleMessage = (event) => {
            // Ensure message is from our iframe
            if (event.data.type === 'gameComplete') {
                const { score, correct, incorrect, grade } = event.data;
                // Calculate risk based on game score and performance
                let calculatedRisk = 'Low';
                if (score < 100 || incorrect > correct) {
                    calculatedRisk = 'High';
                } else if (score < 200 || grade === 'C') {
                    calculatedRisk = 'Medium';
                }
                
                updateGameResult(gameId, {
                    score,
                    grade: grade || 'B',
                    correct,
                    incorrect,
                    riskLevel: calculatedRisk
                });
                
                // Check if game was failed (low score, low grade, or more mistakes than correct)
                if (grade === 'C' || grade === 'F' || score < 150 || incorrect >= correct) {
                    setGameFailed(true);
                    const failQuestions = generateFailQuestions(gameId);
                    // Set start time for first question
                    failQuestions[0].startTime = Date.now();
                    setQuestions(failQuestions);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setShowFailQuestions(true);
                } else {
                    // Clear any existing question state before navigating
                    setShowFailQuestions(false);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setTimeout(() => navigate(`/play/${nextGame}`), 2000);
                }
            }
            
            if (event.data.type === 'questionAnswered') {
                const { isCorrect, timeSpent, difficulty, taskType } = event.data;
                
                // Adjust difficulty based on speed in HTML games too
                let adjustedDifficulty = difficulty;
                if (timeSpent < 1.5 && !isCorrect) {
                    adjustedDifficulty = Math.min(difficulty + 1, 3); // Too fast + wrong = impulsive
                }
                
                recordGameAttempt(gameId, taskType, adjustedDifficulty, isCorrect, timeSpent);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [gameId, nextGame, navigate, updateGameResult, recordGameAttempt]);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-black p-8">
            <div className="w-full max-w-5xl h-[700px] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    className="w-full h-full border-0"
                    title={gameId}
                    sandbox="allow-scripts"
                />
            </div>
            
            {/* Fail Questions Modal */}
            <AnimatePresence>
                {showFailQuestions && questions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-4 border-yellow-500 max-w-2xl w-full mx-4"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                                    Additional Assessment
                                </h2>
                                <p className="text-gray-300 mb-3">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                                {questions[currentQuestionIndex].instruction && (
                                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                                        <p className="text-blue-300 text-sm font-medium">
                                            📚 {questions[currentQuestionIndex].instruction}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-black/30 p-6 rounded-xl mb-6">
                                <p className="text-white text-2xl font-semibold text-center mb-8 whitespace-pre-line">
                                    {questions[currentQuestionIndex].question}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {questions[currentQuestionIndex].options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuestionAnswer(option)}
                                            disabled={selectedAnswer !== null}
                                            className={`px-6 py-4 rounded-xl text-xl font-bold transition-all ${
                                                selectedAnswer === null
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                    : selectedAnswer === option
                                                    ? option === questions[currentQuestionIndex].answer
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                    : 'bg-gray-700 text-gray-400'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {selectedAnswer && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-center text-lg font-bold ${
                                        selectedAnswer === questions[currentQuestionIndex].answer
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                    }`}
                                >
                                    {selectedAnswer === questions[currentQuestionIndex].answer
                                        ? '✓ Correct!'
                                        : '✗ Incorrect'}
                                </motion.p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HTMLGameWrapper;
