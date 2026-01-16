import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { User, Calendar } from 'lucide-react';

const ProfileSetup = () => {
    const { updateProfile } = useGame();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && age) {
            updateProfile(name, parseInt(age));
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel p-8 rounded-2xl w-full max-w-md"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-white neon-text">Agent Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <User size={16} /> Codename
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Calendar size={16} /> Age
                        </label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            min="4"
                            max="18"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Enter your age"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                    >
                        INITIALIZE MISSION
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileSetup;
