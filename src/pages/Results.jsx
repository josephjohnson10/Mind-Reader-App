import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { ArrowLeft, Share2, Download, Brain, AlertTriangle, CheckCircle } from 'lucide-react';

const Results = () => {
    const { userProfile, gameStats, learningDisabilityRisk, emotionData } = useGame();
    const navigate = useNavigate();

    // Prepare data for Radar Chart
    const data = [
        { subject: 'Visual', A: gameStats.spatialRecall.score / 20 || 0, fullMark: 100 },
        { subject: 'Attention', A: (gameStats.questionnaire?.analysis?.adhdScore > 1 ? 40 : 80), fullMark: 100 },
        { subject: 'Numerical', A: gameStats.numberNinja.score / 15 || 0, fullMark: 100 },
        { subject: 'Logic', A: gameStats.matrixReasoning.score / 4.5 || 0, fullMark: 100 },
        { subject: 'Memory', A: gameStats.spatialRecall.score / 15 || 0, fullMark: 100 },
    ];

    const getRiskSummary = () => {
        const risks = [];

        // Emotion-based Risk Assessment (with 65% confidence cap display)
        if (learningDisabilityRisk.dyslexia > 30) {
            risks.push({ 
                area: 'Reading & Language Processing', 
                condition: 'Dyslexia Indicators (Performance + Emotion)', 
                type: 'ai-detected',
                score: Math.min(learningDisabilityRisk.dyslexia * 0.8125, 65), // Cap display at 65%
                confidence: 'Moderate'
            });
        }
        if (learningDisabilityRisk.dyscalculia > 30) {
            risks.push({ 
                area: 'Numerical Processing', 
                condition: 'Dyscalculia Indicators (Performance + Emotion)', 
                type: 'ai-detected',
                score: Math.min(learningDisabilityRisk.dyscalculia * 0.8125, 65),
                confidence: 'Moderate'
            });
        }
        if (learningDisabilityRisk.dysgraphia > 30) {
            risks.push({ 
                area: 'Writing & Motor Skills', 
                condition: 'Dysgraphia Indicators', 
                type: 'ai-detected',
                score: Math.min(learningDisabilityRisk.dysgraphia * 0.8125, 65),
                confidence: 'Moderate'
            });
        }
        if (learningDisabilityRisk.adhd > 30) {
            // Check if student has high attention scores
            const focusScore = gameStats.focusFlight.score || 0;
            const voidScore = gameStats.voidChallenge.score || 0;
            const hasGoodAttention = focusScore > 300 || voidScore > 200;
            
            // Only show ADHD risk if attention is NOT high
            if (!hasGoodAttention) {
                risks.push({ 
                    area: 'Attention & Focus', 
                    condition: 'ADHD Indicators (Rapid Emotion Shifts Only)', 
                    type: 'ai-detected',
                    score: Math.min(learningDisabilityRisk.adhd * 0.8125, 65),
                    confidence: 'Moderate'
                });
            }
        }

        // Game Performance Risks
        if (gameStats.numberNinja.grade === 'C' || gameStats.numberNinja.grade === 'F') {
            risks.push({ area: 'Numerical Proficiency', condition: 'Dyscalculia Indicators (High Error Rate)', type: 'performance' });
        }
        if (gameStats.matrixReasoning.grade === 'C' || gameStats.matrixReasoning.grade === 'F') {
            risks.push({ area: 'Abstract Reasoning', condition: 'Non-Verbal Learning Difficulty', type: 'performance' });
        }
        if (gameStats.spatialRecall.grade === 'C' || gameStats.spatialRecall.grade === 'F') {
            risks.push({ area: 'Visual Memory', condition: 'Visual-Motor Deficit', type: 'performance' });
        }

        // Questionnaire Risks
        if (gameStats.questionnaire?.analysis) {
            const q = gameStats.questionnaire.analysis;
            if (q.dyslexiaScore >= 1) risks.push({ area: 'Reading & Language', condition: 'Reported Dyslexia Symptoms', type: 'screening' });
            if (q.dyscalculiaScore >= 1) risks.push({ area: 'Mathematical Concepts', condition: 'Reported Dyscalculia Symptoms', type: 'screening' });
            if (q.adhdScore >= 1) risks.push({ area: 'Attention & Focus', condition: 'Reported ADHD Symptoms', type: 'screening' });
        }

        return risks;
    };

    const detectedRisks = getRiskSummary();

    return (
        <div className="min-h-screen p-8 bg-black">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
            >
                <ArrowLeft className="mr-2" /> Back to Base
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                {/* AI DIAGNOSIS HEADER */}
                <div className={`p-8 rounded-3xl border ${detectedRisks.length > 0 ? 'bg-red-950/30 border-red-500/50' : 'bg-green-950/30 border-green-500/50'} relative overflow-hidden`}>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                    <Brain size={40} className={detectedRisks.length > 0 ? "text-red-500" : "text-green-500"} />
                                    Cognitive & Clinical Report
                                </h1>
                                <p className="text-gray-400 text-lg">Subject: <span className="text-white font-bold">{userProfile.name}</span> | Age: {userProfile.age}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full font-bold border ${detectedRisks.length > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                {detectedRisks.length > 0 ? 'RISK FACTORS DETECTED' : 'NEUROTYPICAL PROFILE'}
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4">
                            {detectedRisks.length > 0 ? (
                                <>
                                    <p className="text-red-200 font-medium mb-2">Analysis has identified potential markers for the following:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {detectedRisks.map((risk, i) => (
                                            <div key={i} className="bg-black/40 p-4 rounded-xl border-l-4 border-red-500 flex flex-col">
                                                <span className="font-bold text-red-100 text-lg">{risk.condition}</span>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-gray-400 text-sm">{risk.area}</span>
                                                    <div className="flex gap-2">
                                                        {risk.score && (
                                                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 font-bold">
                                                                Risk: {Math.round(risk.score)}%
                                                            </span>
                                                        )}
                                                        {risk.confidence && (
                                                            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                                                Confidence: {risk.confidence}
                                                            </span>
                                                        )}
                                                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 uppercase tracking-wider">{risk.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Emotion Data Summary */}
                                    {emotionData.metrics && (
                                        <div className="mt-6 p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                                            <h4 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
                                                <Brain size={18} />
                                                Emotional Pattern Analysis
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-400 block">Rapid Changes:</span>
                                                    <span className="text-white font-bold">{emotionData.metrics.rapidChanges}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Negative Shifts:</span>
                                                    <span className="text-white font-bold">{emotionData.metrics.negativeTransitions}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Confusion States:</span>
                                                    <span className="text-white font-bold">{emotionData.metrics.confusionStates}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Overall Risk:</span>
                                                    <span className={`font-bold ${
                                                        learningDisabilityRisk.overall === 'High' ? 'text-red-400' :
                                                        learningDisabilityRisk.overall === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>{learningDisabilityRisk.overall}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <p className="text-sm text-gray-500 mt-6 flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        <span>Disclaimer: This AI assessment is for screening purposes only and does not constitute a medical diagnosis.</span>
                                    </p>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 text-green-200 bg-green-900/10 p-6 rounded-xl border border-green-500/20">
                                    <CheckCircle size={32} />
                                    <div>
                                        <p className="font-bold text-lg">Healthy Development Patterns</p>
                                        <p className="text-green-200/70">No significant flags were found in either the clinical screening or performance modules.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Radar Chart */}
                    <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6">Multi-Dimensional Profile</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Performance"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Games Stats */}
                    <div className="space-y-4">
                        <div className="bg-card border border-white/10 p-6 rounded-2xl">
                            <h4 className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Numbers</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-white">{gameStats.numberNinja.score}</span>
                                <span className={`text-xl font-bold ${gameStats.numberNinja.grade === 'S' || gameStats.numberNinja.grade === 'A' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {gameStats.numberNinja.grade || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-card border border-white/10 p-6 rounded-2xl">
                            <h4 className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Logic</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-white">{gameStats.matrixReasoning.score}</span>
                                <span className={`text-xl font-bold ${gameStats.matrixReasoning.grade === 'S' || gameStats.matrixReasoning.grade === 'A' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {gameStats.matrixReasoning.grade || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-card border border-white/10 p-6 rounded-2xl">
                            <h4 className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Memory</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-white">{gameStats.spatialRecall.score}</span>
                                <span className={`text-xl font-bold ${gameStats.spatialRecall.grade === 'S' || gameStats.spatialRecall.grade === 'A' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {gameStats.spatialRecall.grade || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Results;
