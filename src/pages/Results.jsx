import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ArrowLeft, Brain, AlertTriangle, TrendingUp, Award, Clock, Target, Activity } from 'lucide-react';

const Results = () => {
    const { userProfile, gameStats, learningDisabilityRisk, emotionData } = useGame();
    const navigate = useNavigate();

    // Debug: Log current risk values
    console.log('Current learningDisabilityRisk:', learningDisabilityRisk);
    console.log('Game stats:', gameStats);

    // Calculate all disease risks with 80% max cap
    const getAllDiseaseRisks = () => {
        const maxRisk = 80; // Maximum risk percentage

        // Helper to cap risk at 80%
        const capRisk = (risk) => Math.min(risk, maxRisk);

        // Calculate comprehensive risks from all game data if context risks are 0
        const calculateFromGames = () => {
            let dyslexiaRisk = learningDisabilityRisk.dyslexia || 0;
            let dyscalculiaRisk = learningDisabilityRisk.dyscalculia || 0;
            let adhdRisk = learningDisabilityRisk.adhd || 0;
            let dysgraphiaRisk = learningDisabilityRisk.dysgraphia || 0;

            // If context has values, use them; otherwise calculate from games
            if (dyslexiaRisk === 0 && dyscalculiaRisk === 0 && adhdRisk === 0) {
                // Fallback: Calculate from game performance
                Object.entries(gameStats).forEach(([gameId, stats]) => {
                    if (stats.played && stats.score !== undefined) {
                        let gameRisk = 0;

                        // Grade-based risk
                        if (stats.grade === 'F') gameRisk = 50;
                        else if (stats.grade === 'C') gameRisk = 35;
                        else if (stats.grade === 'B') gameRisk = 20;
                        else if (stats.grade === 'A') gameRisk = 10;

                        // Score-based
                        if (stats.score < 50) gameRisk += 15;
                        else if (stats.score < 100) gameRisk += 10;
                        else if (stats.score < 150) gameRisk += 5;

                        // Map to disorders
                        if (gameId === 'lexicalLegends' || gameId === 'treasureHunter') {
                            dyslexiaRisk = Math.min(dyslexiaRisk + gameRisk, 80);
                        } else if (gameId === 'numberNinja' || gameId === 'defenderChallenge') {
                            dyscalculiaRisk = Math.min(dyscalculiaRisk + gameRisk, 80);
                        } else if (gameId === 'spatialRecall' || gameId === 'memoryQuest') {
                            dysgraphiaRisk = Math.min(dysgraphiaRisk + gameRisk, 80);
                        } else if (gameId === 'focusFlight' || gameId === 'voidChallenge') {
                            if (stats.score < 200) {
                                adhdRisk = Math.min(adhdRisk + gameRisk, 80);
                            }
                        }
                    }
                });

                // Add questionnaire risks
                if (gameStats.questionnaire?.analysis) {
                    const q = gameStats.questionnaire.analysis;
                    if (q.dyslexiaScore >= 2) dyslexiaRisk = Math.min(dyslexiaRisk + 20, 80);
                    else if (q.dyslexiaScore >= 1) dyslexiaRisk = Math.min(dyslexiaRisk + 10, 80);

                    if (q.dyscalculiaScore >= 2) dyscalculiaRisk = Math.min(dyscalculiaRisk + 20, 80);
                    else if (q.dyscalculiaScore >= 1) dyscalculiaRisk = Math.min(dyscalculiaRisk + 10, 80);

                    if (q.adhdScore >= 2) adhdRisk = Math.min(adhdRisk + 20, 80);
                    else if (q.adhdScore >= 1) adhdRisk = Math.min(adhdRisk + 10, 80);
                }
            }

            return { dyslexiaRisk, dyscalculiaRisk, adhdRisk, dysgraphiaRisk };
        };

        const calculatedRisks = calculateFromGames();

        return [
            {
                name: 'Dyslexia',
                description: 'Reading & Language Processing',
                risk: capRisk(calculatedRisks.dyslexiaRisk),
                confidence: calculatedRisks.dyslexiaRisk > 30 ? 'Moderate-High' : 'Low',
                color: '#ef4444',
                icon: '📖',
                factors: [
                    gameStats.lexicalLegends?.grade === 'C' || gameStats.lexicalLegends?.grade === 'F' ? 'Low reading performance' : null,
                    gameStats.treasureHunter?.grade === 'C' || gameStats.treasureHunter?.grade === 'F' ? 'Poor treasure hunter performance' : null,
                    emotionData.metrics?.confusionStates > 3 ? 'Confusion during reading tasks' : null
                ].filter(Boolean)
            },
            {
                name: 'Dyscalculia',
                description: 'Mathematical & Numerical Processing',
                risk: capRisk(calculatedRisks.dyscalculiaRisk),
                confidence: calculatedRisks.dyscalculiaRisk > 30 ? 'Moderate-High' : 'Low',
                color: '#f59e0b',
                icon: '🔢',
                factors: [
                    gameStats.numberNinja?.grade === 'C' || gameStats.numberNinja?.grade === 'F' ? 'Low numerical performance' : null,
                    gameStats.defenderChallenge?.grade === 'C' || gameStats.defenderChallenge?.grade === 'F' ? 'Poor defender performance' : null,
                    gameStats.numberNinja?.incorrect > gameStats.numberNinja?.correct ? 'High error rate in math' : null
                ].filter(Boolean)
            },
            {
                name: 'ADHD',
                description: 'Attention & Focus Regulation',
                risk: (() => {
                    const focusScore = gameStats.focusFlight?.score || 0;
                    const voidScore = gameStats.voidChallenge?.score || 0;
                    const hasGoodAttention = focusScore > 300 || voidScore > 200;

                    if (hasGoodAttention) {
                        return Math.min(15, capRisk(calculatedRisks.adhdRisk));
                    }
                    return capRisk(calculatedRisks.adhdRisk);
                })(),
                confidence: calculatedRisks.adhdRisk > 30 ? 'Moderate' : 'Low',
                color: '#8b5cf6',
                icon: '⚡',
                factors: [
                    emotionData.metrics?.rapidChanges >= 5 ? 'Rapid emotion shifts detected' : null,
                    gameStats.focusFlight?.score < 200 ? 'Low sustained attention' : null,
                    gameStats.voidChallenge?.score < 200 ? 'Poor void challenge performance' : null
                ].filter(Boolean)
            },
            {
                name: 'Dysgraphia',
                description: 'Writing & Fine Motor Skills',
                risk: capRisk(calculatedRisks.dysgraphiaRisk),
                confidence: calculatedRisks.dysgraphiaRisk > 30 ? 'Moderate' : 'Low',
                color: '#06b6d4',
                icon: '✍️',
                factors: [
                    gameStats.spatialRecall?.grade === 'C' || gameStats.spatialRecall?.grade === 'F' ? 'Low visual-motor coordination' : null,
                    gameStats.memoryQuest?.grade === 'C' || gameStats.memoryQuest?.grade === 'F' ? 'Poor memory performance' : null
                ].filter(Boolean)
            },
            {
                name: 'Dyspraxia',
                description: 'Motor Coordination & Planning',
                risk: capRisk((learningDisabilityRisk.dyspraxia || 0)),
                confidence: (learningDisabilityRisk.dyspraxia || 0) > 30 ? 'Moderate' : 'Low',
                color: '#ec4899',
                icon: '🎯',
                factors: [
                    gameStats.bridgeGame?.score < 150 ? 'Low coordination performance' : null
                ].filter(Boolean)
            },
            {
                name: 'Auditory Processing',
                description: 'Sound & Language Comprehension',
                risk: capRisk((learningDisabilityRisk.auditoryProcessing || 0)),
                confidence: (learningDisabilityRisk.auditoryProcessing || 0) > 30 ? 'Moderate' : 'Low',
                color: '#10b981',
                icon: '👂',
                factors: []
            }
        ].sort((a, b) => b.risk - a.risk); // Sort by risk level
    };

    const diseaseRisks = getAllDiseaseRisks();
    const highestRisk = Math.max(...diseaseRisks.map(d => d.risk));

    // Prepare data for Radar Chart
    const radarData = [
        { subject: 'Visual', A: gameStats.spatialRecall?.score / 20 || 0, fullMark: 100 },
        { subject: 'Attention', A: (gameStats.voidChallenge?.score || 0) / 5 || 40, fullMark: 100 },
        { subject: 'Numerical', A: gameStats.numberNinja?.score / 15 || 0, fullMark: 100 },
        { subject: 'Logic', A: gameStats.matrixReasoning?.score / 4.5 || 0, fullMark: 100 },
        { subject: 'Memory', A: (gameStats.memoryQuest?.score || 0) / 5 || 50, fullMark: 100 },
    ];

    // Bar chart data for confidence scores
    const confidenceChartData = diseaseRisks.map(d => ({
        name: d.name,
        risk: d.risk,
        color: d.color
    }));

    const ignoreGames = ['memoryQuest', 'warpExplorer', 'defenderChallenge', 'bridgeGame']; // Ignored/Removed games

    // Performance stats
    const performanceMetrics = [
        {
            label: 'Total Games Played',
            value: Object.entries(gameStats)
                .filter(([k, stats]) => !ignoreGames.includes(k) && stats.played)
                .length,
            icon: <Activity className="text-blue-400" />,
            color: 'blue'
        },
        {
            label: 'Average Score',
            value: Math.round(
                Object.entries(gameStats)
                    .filter(([k, g]) => !ignoreGames.includes(k) && g.played && g.score)
                    .reduce((acc, [k, g]) => acc + g.score, 0) /
                Object.entries(gameStats).filter(([k, g]) => !ignoreGames.includes(k) && g.played && g.score).length || 0
            ),
            icon: <Award className="text-yellow-400" />,
            color: 'yellow'
        },
        {
            label: 'Emotion Shifts',
            value: emotionData.metrics?.rapidChanges || 0,
            icon: <TrendingUp className="text-purple-400" />,
            color: 'purple'
        },
        {
            label: 'Risk Level',
            value: learningDisabilityRisk.overall || 'Low',
            icon: <Target className="text-red-400" />,
            color: 'red'
        }
    ];

    return (
        <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-black via-gray-900 to-black">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft className="mr-2" /> Back to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-6"
            >
                {/* HEADER */}
                <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-pink-900/50 p-8 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                                <Brain size={48} className="text-indigo-400" />
                                Comprehensive Assessment Report
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Student: <span className="text-white font-bold">{userProfile.name}</span> |
                                Age: <span className="text-white font-bold">{userProfile.age}</span> |
                                Grade: <span className="text-white font-bold">{userProfile.grade || 'N/A'}</span>
                            </p>
                        </div>
                        <div className={`px-6 py-3 rounded-2xl font-bold text-lg border-2 ${highestRisk > 60 ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                            highestRisk > 40 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                                'bg-green-500/20 text-green-300 border-green-500/50'
                            }`}>
                            {highestRisk > 60 ? '⚠️ HIGH RISK' :
                                highestRisk > 40 ? '⚡ MODERATE RISK' :
                                    '✅ LOW RISK'}
                        </div>
                    </div>
                </div>

                {/* PERFORMANCE METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {performanceMetrics.map((metric, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-800/50 border border-white/10 p-6 rounded-2xl backdrop-blur"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                {metric.icon}
                                <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                                    {metric.label}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white">{metric.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* DISEASE RISK ANALYSIS - ALL CONDITIONS */}
                <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <AlertTriangle className="text-yellow-400" />
                        Learning Disorder Risk Assessment
                        <span className="text-sm font-normal text-gray-400 ml-auto">
                            Confidence Scale: 0-80% (Screening Tool)
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {diseaseRisks.map((disease, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-black/40 p-6 rounded-2xl border-l-4 hover:scale-105 transition-transform"
                                style={{ borderColor: disease.color }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{disease.icon}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{disease.name}</h3>
                                            <p className="text-gray-400 text-sm">{disease.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">Risk Score</span>
                                        <span className="text-2xl font-bold" style={{ color: disease.color }}>
                                            {Math.round(disease.risk)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${disease.risk}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: disease.color }}
                                        />
                                    </div>
                                </div>

                                {/* Confidence Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        Confidence: {disease.confidence}
                                    </span>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${disease.risk > 60 ? 'bg-red-500/20 text-red-300' :
                                        disease.risk > 40 ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-green-500/20 text-green-300'
                                        }`}>
                                        {disease.risk > 60 ? 'HIGH' : disease.risk > 40 ? 'MODERATE' : 'LOW'}
                                    </span>
                                </div>

                                {/* Contributing Factors */}
                                {disease.factors.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-gray-400 text-xs mb-2">Contributing Factors:</p>
                                        <ul className="space-y-1">
                                            {disease.factors.map((factor, idx) => (
                                                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className="text-yellow-400">•</span>
                                                    {factor}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart - Risk Comparison */}
                    <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur">
                        <h3 className="text-2xl font-bold text-white mb-6">Risk Comparison Chart</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={confidenceChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fill: '#94a3b8' }}
                                    domain={[0, 80]}
                                    label={{ value: 'Risk %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="risk" radius={[8, 8, 0, 0]}>
                                    {confidenceChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur">
                        <h3 className="text-2xl font-bold text-white mb-6">Cognitive Profile</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="#8b5cf6"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* EMOTION DATA */}
                {emotionData.metrics && (
                    <div className="bg-purple-900/20 border border-purple-500/30 p-8 rounded-3xl">
                        <h3 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-3">
                            <Brain size={28} />
                            Emotional Pattern Analysis
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Rapid Emotion Changes</span>
                                <span className="text-4xl font-bold text-white">{emotionData.metrics.rapidChanges || 0}</span>
                                <p className="text-xs text-gray-500 mt-2">Frequency of quick shifts</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Negative Transitions</span>
                                <span className="text-4xl font-bold text-white">{emotionData.metrics.negativeTransitions || 0}</span>
                                <p className="text-xs text-gray-500 mt-2">Happy → Sad/Angry shifts</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Confusion States</span>
                                <span className="text-4xl font-bold text-white">{emotionData.metrics.confusionStates || 0}</span>
                                <p className="text-xs text-gray-500 mt-2">Detected confusion moments</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl">
                                <span className="text-gray-400 text-sm block mb-2">Overall Risk</span>
                                <span className={`text-4xl font-bold ${learningDisabilityRisk.overall === 'High' ? 'text-red-400' :
                                    learningDisabilityRisk.overall === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                    }`}>{learningDisabilityRisk.overall || 'Low'}</span>
                                <p className="text-xs text-gray-500 mt-2">Aggregate assessment</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* GAME SCORES */}
                <div className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl">
                    <h3 className="text-2xl font-bold text-white mb-6">Individual Game Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(gameStats).map(([gameName, stats]) => (
                            stats.played && (
                                <div key={gameName} className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                    <h4 className="text-gray-400 text-sm mb-3 uppercase tracking-wider font-bold border-b border-white/5 pb-2">
                                        {gameName.replace(/([A-Z])/g, ' $1').trim()}
                                    </h4>
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Score</div>
                                            <span className="text-3xl font-bold text-white">{stats.score}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-1">Grade</div>
                                            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${stats.grade === 'S' || stats.grade === 'A' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                stats.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    stats.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {stats.grade || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="space-y-2 bg-black/20 p-3 rounded-lg">
                                        {(stats.correct !== undefined || stats.incorrect !== undefined) && (
                                            <div className="flex justify-between text-sm border-b border-white/5 pb-2 mb-2">
                                                <span className="text-green-400">✓ {stats.correct ?? 0} Correct</span>
                                                <span className="text-red-400">✗ {stats.incorrect ?? 0} Wrong</span>
                                            </div>
                                        )}

                                        {/* Detailed Metrics */}
                                        {stats.metrics && (
                                            <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-gray-400">
                                                {Object.entries(stats.metrics).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="capitalize opacity-70">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                                                        <span className="font-mono text-white">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* DISCLAIMER */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                        <h4 className="text-yellow-300 font-bold mb-2">Important Disclaimer</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            This assessment is a screening tool designed for educational purposes only and does not constitute a medical or clinical diagnosis.
                            The confidence scores (max 80%) reflect the system's analytical limitations. For accurate diagnosis and intervention,
                            please consult with qualified healthcare professionals including educational psychologists, pediatricians, or learning specialists.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Results;
