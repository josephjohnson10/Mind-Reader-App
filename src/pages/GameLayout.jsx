import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LexicalLegends from '../games/LexicalLegends';
import FocusFlight from '../games/FocusFlight';
import NumberNinja from '../games/NumberNinja';
import MatrixReasoning from '../games/MatrixReasoning';
import SpatialRecall from '../games/SpatialRecall';
import HTMLGameWrapper from '../games/HTMLGameWrapper';
import { voidChallengeHTML, memoryQuestHTML, treasureHunterHTML, defenderChallengeHTML, warpExplorerHTML, bridgeGameHTML } from '../games/htmlGames';
import { ArrowLeft, Eye } from 'lucide-react';
import { useGame } from '../context/GameContext';

const GameLayout = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { emotionData, learningDisabilityRisk } = useGame();

    const getEmotionColor = (emotion) => {
        const colors = {
            happy: 'text-green-400',
            neutral: 'text-blue-400',
            sad: 'text-purple-400',
            fearful: 'text-yellow-400',
            angry: 'text-red-400',
            surprised: 'text-pink-400',
            disgusted: 'text-orange-400'
        };
        return colors[emotion] || 'text-gray-400';
    };

    const renderGame = () => {
        switch (gameId) {
            case 'lexical-legends':
                return <LexicalLegends />;
            case 'focus-flight':
                return <FocusFlight />;
            case 'number-ninja':
                return <NumberNinja />;
            case 'void-challenge':
                return <HTMLGameWrapper gameId="voidChallenge" htmlContent={voidChallengeHTML} nextGame="memory-quest" />;
            case 'memory-quest':
                return <HTMLGameWrapper gameId="memoryQuest" htmlContent={memoryQuestHTML} nextGame="warp-explorer" />;
            case 'warp-explorer':
                return <HTMLGameWrapper gameId="warpExplorer" htmlContent={warpExplorerHTML} nextGame="bridge-game" />;
            case 'bridge-game':
                return <HTMLGameWrapper gameId="bridgeGame" htmlContent={bridgeGameHTML} nextGame="treasure-hunter" />;
            case 'treasure-hunter':
                return <HTMLGameWrapper gameId="treasureHunter" htmlContent={treasureHunterHTML} nextGame="defender-challenge" />;
            case 'defender-challenge':
                return <HTMLGameWrapper gameId="defenderChallenge" htmlContent={defenderChallengeHTML} nextGame="matrix-reasoning" />;
            case 'matrix-reasoning':
                return <MatrixReasoning />;
            case 'spatial-recall':
                return <SpatialRecall />;
            default:
                return <div className="text-white">Game Not Found</div>;
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col relative">
            <div className="p-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="mr-2" /> Back to Base
                </button>
            </div>
            
            {/* Emotion Indicator */}
            {emotionData.isActive && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="glass-panel px-4 py-3 rounded-lg border border-primary/30">
                        <div className="flex items-center gap-3">
                            <Eye size={18} className="text-primary animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase">Tracking</span>
                                <span className={`text-sm font-bold capitalize ${getEmotionColor(emotionData.currentEmotion)}`}>
                                    {emotionData.currentEmotion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex-1 p-4 max-w-screen-lg mx-auto w-full h-[80vh]">
                {renderGame()}
            </div>
        </div>
    );
};

export default GameLayout;
