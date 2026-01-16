import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertCircle, FileText } from 'lucide-react';

const TeacherDashboard = () => {
    const navigate = useNavigate();

    // Mock Data
    const students = [
        { id: 1, name: "Alex Thompson", age: 10, risk: "High", condition: "Dyscalculia Risk", status: "Attention Required" },
        { id: 2, name: "Sarah Miller", age: 9, risk: "Low", condition: "-", status: "On Track" },
        { id: 3, name: "James Wilson", age: 11, risk: "Moderate", condition: "ADHD Indicators", status: "Monitor" },
        { id: 4, name: "Emily Chen", age: 10, risk: "Low", condition: "-", status: "On Track" },
        { id: 5, name: "Michael Brown", age: 10, risk: "High", condition: "Dyslexia Risk", status: "Intervention Needed" },
    ];

    return (
        <div className="min-h-screen bg-black p-8">
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Teacher Portal</h1>
                        <p className="text-gray-400">Class 5-B • St. Mary's Academy</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-500" />
                        <span className="text-red-200 font-bold">2 High Risk Alerts</span>
                    </div>
                </div>
            </header>

            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Student Roster
                    </h2>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Export Report</button>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="p-6 font-medium">Student Name</th>
                            <th className="p-6 font-medium">Age</th>
                            <th className="p-6 font-medium">Assessment Status</th>
                            <th className="p-6 font-medium">AI Analysis</th>
                            <th className="p-6 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {students.map((student) => (
                            <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-6 font-medium text-white">{student.name}</td>
                                <td className="p-6">{student.age}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.risk === 'High' ? 'bg-red-500/20 text-red-400' : student.risk === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="p-6">
                                    {student.condition !== '-' ? (
                                        <div className="flex items-center gap-2 text-red-300">
                                            <AlertCircle size={14} />
                                            {student.condition}
                                        </div>
                                    ) : (
                                        <span className="text-green-400">Clear</span>
                                    )}
                                </td>
                                <td className="p-6">
                                    <button className="text-primary hover:text-white underline text-sm">View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherDashboard;
