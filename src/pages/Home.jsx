import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, School, ArrowRight } from 'lucide-react';

const RoleCard = ({ role, icon: Icon, description, onClick, color }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`bg-card/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Icon size={40} className="text-white transform group-hover:scale-110 transition-transform" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">{role}</h3>
                <p className="text-gray-400">{description}</p>
            </div>
            <div className="flex items-center text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                <span>Login</span> <ArrowRight size={16} className="ml-2" />
            </div>
        </div>
    </motion.div>
);

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />

            <div className="relative z-10 w-full max-w-6xl">
                <header className="text-center mb-16">
                    <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
                        Mind<span className="text-primary">Reader</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Advanced AI-powered cognitive assessment platform for early detection of learning differences.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RoleCard
                        role="Student"
                        icon={GraduationCap}
                        description="Play games and discover your unique brain super-powers."
                        color="from-blue-500 to-indigo-500"
                        onClick={() => navigate('/profile')}
                    />
                    <RoleCard
                        role="Parent"
                        icon={Users}
                        description="Monitor your child's progress and view detailed insights."
                        color="from-purple-500 to-pink-500"
                        onClick={() => navigate('/parent-login')}
                    />
                    <RoleCard
                        role="Teacher"
                        icon={School}
                        description="Manage classrooms and track student performance metrics."
                        color="from-orange-500 to-red-500"
                        onClick={() => navigate('/teacher-login')}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
