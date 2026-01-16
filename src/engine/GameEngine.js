export const calculateGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 95) return 'S';
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

export const analyzePerformance = (gameId, metrics, age) => {
    // Basic heuristic analysis
    let analysis = {
        score: 0,
        grade: 'F',
        riskLevel: 'Low', // Low, Moderate, High
        feedback: ''
    };

    if (gameId === 'lexical-legends') {
        // Metrics: correct, incorrect, missed, speed
        const total = metrics.correct + metrics.incorrect + metrics.missed;
        const accuracy = total === 0 ? 0 : (metrics.correct / total);

        analysis.score = Math.round(accuracy * 1000 + (metrics.speed * 10)); // Arbitrary score formula
        analysis.grade = calculateGrade(analysis.score, 1200); // 1200 as theoretical max

        // Risk Detection
        if (accuracy < 0.7 && metrics.incorrect > metrics.missed) {
            // High confusion rate (confusing b/d etc)
            analysis.riskLevel = 'High';
            analysis.feedback = 'Potential Dyslexia indicators found: Significant confusion with letter shapes.';
        } else if (metrics.missed > metrics.correct) {
            // Slow processing
            analysis.riskLevel = 'Moderate';
            analysis.feedback = 'Processing speed might be lower than average.';
        } else {
            analysis.riskLevel = 'Low';
            analysis.feedback = 'Strong lexical processing skills.';
        }
    }
    else if (gameId === 'focus-flight') {
        // Metrics: jumps, crashes, collected, falseAlarms (jumps when no obstacle)
        // False alarms logic needs to be passed from the game or inferred? 
        // We'll trust the input metrics.
        const accuracy = metrics.collected / (metrics.collected + metrics.crashes + 1); // Avoid div 0
        analysis.score = Math.round(metrics.collected * 100 - metrics.crashes * 50);
        analysis.grade = calculateGrade(analysis.score, 1000);

        if (metrics.crashes > metrics.collected) {
            analysis.riskLevel = 'Moderate';
            analysis.feedback = 'Attention lapses detected.';
        } else {
            analysis.riskLevel = 'Low';
            analysis.feedback = 'Good sustained attention.';
        }
    }
    else if (gameId === 'number-ninja') {
        const total = metrics.correct + metrics.incorrect;
        const accuracy = total === 0 ? 0 : (metrics.correct / total);
        analysis.score = Math.round(metrics.correct * 100 + (Math.max(0, 50 - metrics.speed) * 10));
        analysis.grade = calculateGrade(analysis.score, 1500);

        if (accuracy < 0.6) {
            analysis.riskLevel = 'High';
            analysis.feedback = 'Potential Dyscalculia indicators: High error rate in basic calculation.';
        } else {
            analysis.riskLevel = 'Low';
            analysis.feedback = 'Strong numerical reasoning.';
        }
    }
    else if (gameId === 'matrix-reasoning') {
        const accuracy = metrics.correct / (metrics.correct + metrics.incorrect + 0.1);
        analysis.score = Math.round(accuracy * 100); // Assuming score is based on accuracy
        analysis.grade = calculateGrade(analysis.score, 450); // 3 questions * 150

        if (accuracy > 0.8) {
            analysis.riskLevel = 'Low';
            analysis.feedback = 'Superior non-verbal reasoning skills.';
        } else {
            analysis.riskLevel = 'Moderate';
            analysis.feedback = 'Difficulty with abstract pattern recognition.';
        }
    }
    else if (gameId === 'spatial-recall') {
        analysis.score = Math.round(metrics.correct * 100); // Assuming score is based on correct items
        analysis.grade = calculateGrade(analysis.score, 1000);

        if (metrics.maxLevel < 3) {
            analysis.riskLevel = 'High';
            analysis.feedback = 'Short-term visual memory deficit indicators.';
        } else {
            analysis.riskLevel = 'Low';
            analysis.feedback = 'Strong visual-spatial recall.';
        }
    }

    return analysis;
};
