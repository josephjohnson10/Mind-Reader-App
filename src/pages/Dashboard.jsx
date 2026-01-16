import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, Hash, Lock, Play } from 'lucide-react';
import { useGame } from '../context/GameContext';

const GameCard = ({ id, title, description, icon: Icon, color, locked, onClick }) => (
    <motion.div
        whileHover={!locked ? { y: -10, scale: 1.02 } : {}}
        onClick={!locked ? onClick : undefined}
        className={`relative group overflow-hidden rounded-2xl p-6 border ${locked ? 'border-gray-800 bg-gray-900/50 cursor-not-allowed' : 'border-white/10 bg-card/40 cursor-pointer hover:border-primary/50'} transition-all`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />

        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${locked ? 'bg-gray-800' : 'bg-white/10'}`}>
                {locked ? <Lock className="text-gray-500" /> : <Icon className="text-white" size={24} />}
            </div>

            <h3 className={`text-xl font-bold mb-2 ${locked ? 'text-gray-500' : 'text-white'}`}>{title}</h3>
            <p className={`text-sm ${locked ? 'text-gray-600' : 'text-gray-400'}`}>{description}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { userProfile, startEmotionDetection, emotionData } = useGame();

    React.useEffect(() => {
        if (!userProfile.name) {
            navigate('/profile');
        }
    }, [userProfile.name, navigate]);

    const games = [
        {
            id: 'lexical-legends',
            title: 'Lexical Legends',
            description: 'Master the ancient runes of language. Decode patterns and test your reading reflexes.',
            icon: Brain,
            color: 'from-blue-500 to-indigo-500'
        },
        {
            id: 'focus-flight',
            title: 'Focus Flight',
            description: 'Navigate through the quantum tunnel. Maintain absolute focus to avoid obstacles.',
            icon: Zap,
            color: 'from-yellow-400 to-orange-500'
        },
        {
            id: 'number-ninja',
            title: 'Number Ninja',
            description: 'Slice through complex calculations with ninja-like speed and precision.',
            icon: Hash,
            color: 'from-emerald-400 to-green-500'
        }
    ];

    const [loadingStory, setLoadingStory] = React.useState(false);

    const handleStart = async () => {
        setLoadingStory(true);
        
        // Initialize emotion detection
        await startEmotionDetection();
        
        // Navigate to assessment
        setTimeout(() => {
            navigate('/assessment');
        }, 1500);
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center justify-center">
            {/* ... header ... */}

            {/* Adding Loading Overlay if loadingStory is true */}
            {loadingStory && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-primary font-mono animate-pulse">ESTABLISHING UPLINK...</p>
                    <p className="text-gray-400 text-sm mt-4">Initializing emotion detection system...</p>
                </div>
            )}

            {/* Emotion Indicator */}
            {emotionData.isActive && (
                <div className="fixed top-4 right-4 glass-panel px-4 py-2 rounded-lg border border-primary/30 z-40">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-400">Emotion Tracking:</span>
                        <span className="text-sm text-primary font-bold capitalize">{emotionData.currentEmotion}</span>
                    </div>
                </div>
            )}

            <header className="text-center mb-12">

                <h1 className="text-5xl font-bold text-white mb-4 neon-text">Mission Control</h1>
                <p className="text-xl text-gray-400">Agent <span className="text-primary font-bold">{userProfile.name}</span>, your assessment awaits.</p>
                <div className="mt-4 glass-panel px-6 py-2 rounded-full inline-block">
                    <span className="text-lg font-mono text-primary">Clearance Level {Math.floor(userProfile.age / 2)}</span>
                </div>
            </header>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="glass-panel p-8 rounded-3xl border border-primary/30 text-center space-y-8">
                    <div className="flex justify-center gap-8 mb-8">
                        <Hash size={48} className="text-green-400" />
                        <Brain size={48} className="text-indigo-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-white">Full Cognitive Scan</h2>
                    <p className="text-gray-300 text-lg">
                        Complete the clinical screener and cognitive games to generate your profile.
                        <br />
                        <span className="text-sm text-gray-500 mt-2 block">(Screening • Numerical • Logic • Memory)</span>
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className="w-full py-6 bg-gradient-to-r from-primary to-accent text-white text-2xl font-bold rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center gap-4"
                    >
                        <Play size={32} fill="currentColor" />
                        START SCREENING
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
