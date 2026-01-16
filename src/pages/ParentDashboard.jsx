import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ArrowRight } from 'lucide-react';

const ParentDashboard = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Parent Access</h2>
                    <p className="text-gray-400 mb-8">Enter your secure passcode to view assessment reports.</p>

                    <input
                        type="password"
                        placeholder="Enter Pin (Try 1234)"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 focus:border-primary outline-none text-center tracking-widest text-xl"
                    />

                    <button
                        onClick={() => setIsLoggedIn(true)}
                        className="w-full bg-primary py-3 rounded-xl text-white font-bold hover:bg-primary-hover transition-colors"
                    >
                        Unlock Dashboard
                    </button>
                    <button onClick={() => navigate('/')} className="mt-4 text-gray-500 hover:text-white text-sm">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-8">
            <header className="flex items-center gap-4 mb-12">
                <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Parent Dashboard</h1>
                    <p className="text-gray-400">Welcome, Mr. Johnson</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="glass-panel p-8 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Joseph's Profile</h2>
                            <p className="text-gray-400">Last Assessment: Today</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            J
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-gray-300">Overall Status</span>
                            <span className="text-yellow-400 font-bold">Analysis Pending</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-gray-300">Next Recommended Test</span>
                            <span className="text-white">Hearing Screening</span>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                        View Full Report <ArrowRight size={16} />
                    </button>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">+</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Add Child Profile</h3>
                    <p className="text-gray-400 text-sm">Monitor another student's progress</p>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
