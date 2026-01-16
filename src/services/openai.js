import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
let openai = null;
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (apiKey && apiKey !== 'undefined') {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
}

// Fallback mission briefings for when OpenAI is not available
const fallbackBriefings = {
    'Number Ninja': [
        "Agent, hostile mathematical entities detected in Sector 7. Engage and neutralize with precision calculations. Time is of the essence!",
        "Command to Agent: The Calculation Grid has been compromised. Deploy your numerical combat skills immediately. Good luck, soldier!",
        "Urgent: Math-based defense systems failing. We need your computational prowess to restore order. Proceed with extreme focus!"
    ],
    'Lexical Legends': [
        "Agent, ancient language codes must be deciphered before the enemy intercepts our communications. Your linguistic expertise is required!",
        "Priority Alpha: Decode the letter sequences before the security breach escalates. Your reading skills are our last defense!",
        "Command: Hostile symbols detected. Use your pattern recognition to identify friend from foe. Swift action required!"
    ],
    'Focus Flight': [
        "Agent, navigate through the quantum tunnel without collision. Your concentration is the only thing keeping this mission alive!",
        "Warning: Obstacle field detected ahead. Maintain absolute focus or risk mission failure. We're counting on you!",
        "Command: Thread the needle through hostile territory. One mistake could be catastrophic. Stay sharp!"
    ],
    'Matrix Reasoning': [
        "Agent, alien logic patterns detected. Decipher their reasoning before they decode ours. Your analytical mind is our greatest weapon!",
        "Priority: Break the enemy's pattern-based encryption. Use your abstract thinking to outmaneuver their defenses!",
        "Command: Unknown intelligence test incoming. Prove humanity's cognitive superiority. Mission critical!"
    ],
    'Spatial Recall': [
        "Agent, memorize these coordinates before they're erased. Our entire operation depends on your spatial memory!",
        "Warning: Star map data corrupting. Commit these positions to memory now or lose our only navigation reference!",
        "Command: Visual intelligence required. Lock these patterns into your memory banks. Time sensitive!"
    ]
};

export const generateMissionBriefing = async (agentName, missionType) => {
    // If OpenAI is available, try to use it
    if (openai) {
        try {
            const prompt = `
          You are "Command", a futuristic AI handler for a secret agent named ${agentName}.
          The agent is about to start a cognitive training mission: "${missionType}".
          
          Mission Types:
          - "Number Ninja": A fast-paced math battle.
          - "Matrix Logic": Deciphering alien patterns.
          - "Spatial Recall": Memorizing star maps.
          
          Generate a short, exciting, 2-sentence mission briefing.
          Style: Sci-fi, urgent, encouraging.
          Format: JSON { "briefing": "string" }
        `;

            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a sci-fi mission control AI." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" },
            });

            const result = JSON.parse(completion.choices[0].message.content);
            return result.briefing;
        } catch (error) {
            console.warn("OpenAI unavailable, using fallback briefing:", error.message);
        }
    }
    
    // Use fallback briefings
    const briefings = fallbackBriefings[missionType] || fallbackBriefings['Number Ninja'];
    const randomBriefing = briefings[Math.floor(Math.random() * briefings.length)];
    return randomBriefing;
};

// NEW: Dynamic Question Generation for Games
export const generateDynamicQuestion = async (taskType, difficulty = 'easy') => {
    if (openai) {
        try {
            const prompts = {
                math: `Generate a ${difficulty} difficulty math question suitable for ages 8-12.
                       Return JSON: { "question": "string", "options": ["opt1", "opt2", "opt3", "opt4"], "correct": "opt1", "explanation": "why" }`,
                reading: `Generate a ${difficulty} difficulty letter differentiation question (b/d/p/q confusion).
                         Return JSON: { "question": "string", "options": ["b", "d", "p", "q"], "correct": "b" }`,
                logic: `Generate a ${difficulty} difficulty pattern recognition question.
                       Return JSON: { "question": "string", "options": ["opt1", "opt2", "opt3"], "correct": "opt1" }`,
                memory: `Generate a ${difficulty} difficulty memory/sequence question.
                        Return JSON: { "question": "string", "options": ["opt1", "opt2"], "correct": "opt1" }`
            };

            const prompt = prompts[taskType] || prompts.math;

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.warn("OpenAI question generation failed, using fallback");
        }
    }

    // Fallback questions
    return generateFallbackQuestion(taskType, difficulty);
};

function generateFallbackQuestion(taskType, difficulty) {
    const questions = {
        math: {
            easy: [
                { question: "3 + 2 = ?", options: ["5", "4", "6", "7"], correct: "5" },
                { question: "10 - 4 = ?", options: ["6", "5", "7", "8"], correct: "6" },
                { question: "2 × 3 = ?", options: ["6", "5", "7", "8"], correct: "6" }
            ],
            medium: [
                { question: "15 + 12 = ?", options: ["27", "25", "28", "26"], correct: "27" },
                { question: "20 - 8 = ?", options: ["12", "13", "11", "14"], correct: "12" },
                { question: "7 × 4 = ?", options: ["28", "24", "32", "27"], correct: "28" }
            ],
            hard: [
                { question: "45 + 37 = ?", options: ["82", "81", "83", "84"], correct: "82" },
                { question: "12 × 8 = ?", options: ["96", "92", "98", "94"], correct: "96" }
            ]
        },
        reading: {
            easy: [
                { question: "Which letter is 'b'?", options: ["b", "d", "p", "q"], correct: "b" },
                { question: "Which letter is 'd'?", options: ["b", "d", "p", "q"], correct: "d" }
            ]
        },
        logic: {
            easy: [
                { question: "Red, Blue, Red, ?", options: ["Blue", "Red", "Green"], correct: "Blue" },
                { question: "1, 2, 3, ?", options: ["4", "5", "3"], correct: "4" }
            ]
        }
    };

    const diffLevel = questions[taskType]?.[difficulty] || questions.math.easy;
    return diffLevel[Math.floor(Math.random() * diffLevel.length)];
}
