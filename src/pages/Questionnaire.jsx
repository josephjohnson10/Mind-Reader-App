import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { useGame } from '../context/GameContext';

const questions = [
    {
        id: 'q1',
        text: "Does the user often mix up similar-looking letters (like 'b' and 'd') or numbers (like '6' and '9')?",
        category: 'Dyslexia'
    },
    {
        id: 'q2',
        text: "Is there difficulty reading analog clocks or estimating how much time has passed?",
        category: 'Dyscalculia'
    },
    {
        id: 'q3',
        text: "Does the user often lose their place while reading or skip lines unintentionally?",
        category: 'Dyslexia'
    },
    {
        id: 'q4',
        text: "Is it challenging to do mental math (like calculating change) without using fingers or paper?",
        category: 'Dyscalculia'
    },
    {
        id: 'q5',
        text: "Does the user frequent make careless mistakes in schoolwork or overlook details?",
        category: 'ADHD'
    },
    {
        id: 'q6',
        text: "Is there difficulty coordinating movements, such as catching a ball or tying shoelaces?",
        category: 'Dyspraxia'
    },
    {
        id: 'q7',
        text: "Does the user struggle to follow multi-step oral instructions?",
        category: 'Auditory Processing'
    },
    {
        id: 'q8',
        text: "Does the user seem easily distracted by extraneous stimuli?",
        category: 'ADHD'
    }
];

const Questionnaire = () => {
    const navigate = useNavigate();
    const { updateGameResult } = useGame(); // We'll hijack this or add a new method. 
    // Actually we need to update context to store this. For now let's reuse a generic 'setAssessment' if we had one.
    // We'll write to a new key in local state via a specialized method we will add to Context.

    // TEMPORARY: using a local 'updateProfile' style approach or just adding it to gameStats??
    // Let's assume we will add `submitQuestionnaire` to context next.
    const { submitQuestionnaire } = useGame();

    const [answers, setAnswers] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [questions[currentStep].id]: val }));
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsLoading(true);
            finishAssessment();
        }
    };

    const finishAssessment = () => {
        // Calculate risks based on answers
        // Yes = 1, No = 0.
        // Simple aggregation.
        const analysis = {
            dyslexiaScore: (answers['q1'] === 'yes' ? 1 : 0) + (answers['q3'] === 'yes' ? 1 : 0),
            dyscalculiaScore: (answers['q2'] === 'yes' ? 1 : 0) + (answers['q4'] === 'yes' ? 1 : 0),
            adhdScore: (answers['q5'] === 'yes' ? 1 : 0) + (answers['q8'] === 'yes' ? 1 : 0),
            answers
        };

        if (submitQuestionnaire) {
            submitQuestionnaire(analysis);
        } else {
            console.warn("submitQuestionnaire not found in context");
        }

        // Add 2 second delay with loading message before first game
        setTimeout(() => {
            navigate('/play/void-challenge');
        }, 2000);
    };

    const progress = ((currentStep) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
            {isLoading ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-3xl font-bold mb-3 neon-text">Preparing Assessment...</h2>
                    <p className="text-gray-400 text-lg">Loading your first challenge</p>
                </motion.div>
            ) : (
                <div className="w-full max-w-2xl">
                    <header className="mb-12 text-center">
                        <h1 className="text-3xl font-bold mb-2 neon-text">Preliminary Screening</h1>
                        <p className="text-gray-400">Answer truthfully for accurate calibration.</p>
                    </header>

                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden min-h-[400px] flex flex-col justify-between">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="mt-8">
                            <span className="text-primary text-sm font-mono tracking-widest uppercase mb-4 block">
                                Item {currentStep + 1} / {questions.length}
                            </span>

                            <h2 className="text-2xl font-medium leading-relaxed">
                                {questions[currentStep].text}
                            </h2>

                            <div className="mt-2 text-sm text-gray-500 uppercase tracking-wide">
                                Focus: {questions[currentStep].category}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-12">
                            <button
                                onClick={() => handleAnswer('no')}
                                className="py-4 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-lg"
                            >
                                No / Rarely
                            </button>
                            <button
                                onClick={() => handleAnswer('yes')}
                                className="py-4 rounded-xl bg-primary hover:bg-primary-hover transition-colors text-lg font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                            >
                                Yes / Often
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questionnaire;
