# HTML Games Integration Guide

## 📋 Summary

The user provided 6 HTML5 games to integrate into the React Mind-Reader application. These games test various cognitive skills and should be added after the first 2-3 games.

## 🎮 Games to Integrate

### 1. **Void Challenge** (Focus/Attention - ADHD Detection)
- **Skills**: Reaction time, sustained attention, impulse control
- **Mechanics**: Flappy-bird style, dodge blocks, answer math questions in black holes
- **Assessment**: Lives system, measures attention span and impulsivity

### 2. **Warp-Gate Explorer** (Spatial/Math - Dyscalculia)
- **Skills**: Spatial navigation, mental math, fuel management
- **Mechanics**: Top-down spaceship, dodge asteroids, solve math to pass warp gates
- **Assessment**: Fuel depletion measures planning, math accuracy

### 3. **2D Bridge Game** (Reading/Number Recognition - Dyslexia/Dyscalculia)
- **Skills**: Letter differentiation (b/d/p/q), quantity comparison
- **Mechanics**: Character must cross river by solving tasks correctly
- **Assessment**: Time taken, accuracy on reading vs number tasks

### 4. **Memory Quest** (Working Memory - ADHD/General)
- **Skills**: Visual memory, pattern recognition, concentration
- **Mechanics**: Memory card matching with progressive difficulty (3x3 → 6x6)
- **Assessment**: Mistakes, lives used, progression speed

### 5. **Treasure Hunter** (Reaction Time/Logic - ADHD)
- **Skills**: Quick reactions, pattern recognition, sustained focus
- **Mechanics**: Whack-a-mole style with logic puzzles on energy loss
- **Assessment**: Miss rate, reaction speed, puzzle solving

### 6. **Defender Challenge** (Coordination/Processing Speed - ADHD/Dyspraxia)
- **Skills**: Hand-eye coordination, multitasking, quick decision making
- **Mechanics**: Space shooter, dodge + shoot, solve puzzles on hit
- **Assessment**: Hit rate, movement patterns, recovery speed

---

## 🔧 Integration Steps

### Step 1: Convert to React Components ✅ (Partially Done)

Created `VoidChallenge.jsx` as example. Need to create:
- `WarpExplorer.jsx`
- `BridgeGame.jsx`
- `MemoryQuest.jsx`
- `TreasureHunter.jsx`
- `DefenderChallenge.jsx`

### Step 2: Update Game Context

Add new game states to `GameContext.jsx`:

```javascript
const [gameStats, setGameStats] = useState({
    // Existing games
    lexicalLegends: { ... },
    focusFlight: { ... },
    numberNinja: { ... },
    matrixReasoning: { ... },
    spatialRecall: { ... },
    
    // New HTML games
    voidChallenge: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
    warpExplorer: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
    bridgeGame: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
    memoryQuest: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
    treasureHunter: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
    defenderChallenge: { played: false, score: 0, grade: null, history: [], riskScore: 0 },
    
    questionnaire: { completed: false, analysis: null }
});
```

### Step 3: Update GameLayout Routing

Add cases to `GameLayout.jsx`:

```javascript
const renderGame = () => {
    switch (gameId) {
        case 'lexical-legends': return <LexicalLegends />;
        case 'focus-flight': return <FocusFlight />;
        case 'number-ninja': return <NumberNinja />;
        case 'matrix-reasoning': return <MatrixReasoning />;
        case 'spatial-recall': return <SpatialRecall />;
        
        // New games
        case 'void-challenge': return <VoidChallenge />;
        case 'warp-explorer': return <WarpExplorer />;
        case 'bridge-game': return <BridgeGame />;
        case 'memory-quest': return <MemoryQuest />;
        case 'treasure-hunter': return <TreasureHunter />;
        case 'defender-challenge': return <DefenderChallenge />;
        
        default: return <div>Game Not Found</div>;
    }
};
```

### Step 4: Update Game Flow

Modify navigation in each game to follow this sequence:

1. **Questionnaire** (Initial screening)
2. **Lexical Legends** (Dyslexia)
3. **Number Ninja** (Dyscalculia)
4. **Void Challenge** (ADHD - Attention)
5. **Memory Quest** (Working Memory)
6. **Warp Explorer** (Spatial + Math)
7. **Bridge Game** (Reading + Number)
8. **Treasure Hunter** (Reaction Time)
9. **Defender Challenge** (Coordination)
10. **Focus Flight** (Sustained Attention)
11. **Matrix Reasoning** (Logic)
12. **Spatial Recall** (Memory)
13. **Results** (Final Assessment)

### Step 5: OpenAI Question Generation

Update `src/services/openai.js` to generate dynamic questions:

```javascript
export const generateDynamicQuestion = async (difficulty, taskType) => {
    if (!openai) {
        // Fallback questions
        return generateFallbackQuestion(difficulty, taskType);
    }
    
    try {
        const prompt = `Generate a ${difficulty} difficulty ${taskType} question for cognitive assessment.
        Return JSON: { "question": "string", "options": ["opt1", "opt2", "opt3"], "correct": "string" }`;
        
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });
        
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        return generateFallbackQuestion(difficulty, taskType);
    }
};
```

### Step 6: Enhanced Assessment Algorithm

Update Results page to include all game data:

```javascript
const calculateOverallAssessment = () => {
    const assessments = {
        dyslexia: {
            games: ['lexicalLegends', 'bridgeGame'],
            emotionRisk: learningDisabilityRisk.dyslexia,
            weight: 0.3
        },
        dyscalculia: {
            games: ['numberNinja', 'warpExplorer', 'bridgeGame'],
            emotionRisk: learningDisabilityRisk.dyscalculia,
            weight: 0.3
        },
        adhd: {
            games: ['voidChallenge', 'treasureHunter', 'defenderChallenge', 'memoryQuest'],
            emotionRisk: learningDisabilityRisk.adhd,
            weight: 0.4
        },
        dysgraphia: {
            games: ['defenderChallenge'],
            emotionRisk: learningDisabilityRisk.dysgraphia,
            weight: 0.2
        }
    };
    
    // Calculate combined risk scores
    Object.keys(assessments).forEach(disorder => {
        const data = assessments[disorder];
        let gameScore = 0;
        let gameCount = 0;
        
        data.games.forEach(gameName => {
            if (gameStats[gameName]?.played) {
                gameScore += gameStats[gameName].riskScore || 0;
                gameCount++;
            }
        });
        
        const avgGameScore = gameCount > 0 ? gameScore / gameCount : 0;
        const combinedScore = (avgGameScore * (1 - data.weight)) + (data.emotionRisk * data.weight);
        
        data.finalRisk = Math.round(combinedScore);
        data.level = combinedScore < 30 ? 'Low' : combinedScore < 60 ? 'Medium' : 'High';
    });
    
    return assessments;
};
```

---

## 🎯 Quick Implementation (Recommended Approach)

Since full React conversion of all 6 games is extensive, here's a **faster hybrid approach**:

### Create an IframeGame Component

```jsx
// src/games/IframeGame.jsx
import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const IframeGame = ({ htmlContent, gameName, nextGame }) => {
    const { updateGameResult } = useGame();
    
    useEffect(() => {
        // Listen for messages from iframe
        const handleMessage = (event) => {
            if (event.data.type === 'gameComplete') {
                updateGameResult(gameName, event.data.results);
                navigate(`/play/${nextGame}`);
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    
    return (
        <iframe 
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title={gameName}
        />
    );
};
```

Then save each HTML game as a string and load them via this component.

---

## 📊 Disease Classification Mapping

| Game | Dyslexia | Dyscalculia | ADHD | Dysgraphia |
|------|----------|-------------|------|------------|
| Lexical Legends | ✅✅✅ | | | |
| Number Ninja | | ✅✅✅ | | |
| Void Challenge | | ✅ | ✅✅✅ | |
| Warp Explorer | | ✅✅ | ✅ | |
| Bridge Game | ✅✅ | ✅✅ | | |
| Memory Quest | | | ✅✅ | |
| Treasure Hunter | | | ✅✅✅ | |
| Defender Challenge | | | ✅✅ | ✅✅ |
| Focus Flight | | | ✅✅✅ | |
| Matrix Reasoning | | ✅ | | |
| Spatial Recall | | | ✅ | |

---

## 🚀 Immediate Next Steps

1. **Option A (Full React)**: Convert all HTML games to React components (3-4 hours)
2. **Option B (Hybrid)**: Use iframe approach (30 minutes)
3. **Option C (Progressive)**: Start with 2-3 key games, add rest later

**Recommendation**: Use **Option B** for quick demo, then progressively convert to Option A for production.

Would you like me to:
1. Complete all React conversions?
2. Implement the iframe hybrid approach?
3. Focus on specific games first?
