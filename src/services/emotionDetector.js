// Emotion Detection Service for Learning Disability Detection
// Integrates webcam-based emotion detection with game performance

class EmotionDetector {
    constructor() {
        this.emotionHistory = [];
        this.emotionTimestamps = [];
        this.currentEmotion = 'neutral';
        this.previousEmotion = 'neutral';
        this.isActive = false;
        this.detectionInterval = null;
        
        // Tracking metrics
        this.rapidEmotionChanges = 0;
        this.negativeTransitions = 0;
        this.confusionStates = 0;
        
        // Callbacks
        this.onEmotionChange = null;
    }
    
    // Initialize webcam and emotion detection
    async initialize() {
        try {
            // Request webcam access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            // Create video element
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = stream;
            this.videoElement.autoplay = true;
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);
            
            // Wait for video to be ready
            await new Promise(resolve => {
                this.videoElement.onloadedmetadata = () => resolve();
            });
            
            console.log('Emotion detector initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize emotion detector:', error);
            return false;
        }
    }
    
    // Start emotion detection loop
    startDetection() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.detectionInterval = setInterval(() => {
            this.detectEmotion();
        }, 2000); // Check every 2 seconds
        
        console.log('Emotion detection started');
    }
    
    // Stop emotion detection
    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        this.isActive = false;
    }
    
    // Detect emotion from current video frame
    async detectEmotion() {
        if (!this.videoElement) return;
        
        try {
            // In production, use your trained model
            // For now, simulate emotion detection
            const emotions = ['happy', 'neutral', 'sad', 'fearful', 'surprised', 'angry', 'disgusted'];
            const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            // TODO: Replace with actual model inference
            // const predictions = await model.predict(videoFrame);
            // const detectedEmotion = getHighestPrediction(predictions);
            
            this.recordEmotion(detectedEmotion);
        } catch (error) {
            console.error('Emotion detection error:', error);
        }
    }
    
    // Record new emotion and analyze patterns
    recordEmotion(emotion) {
        const now = Date.now();
        
        // Check for rapid emotion change (within 3 seconds)
        if (this.emotionTimestamps.length > 0) {
            const timeSinceLastChange = now - this.emotionTimestamps[this.emotionTimestamps.length - 1];
            if (timeSinceLastChange < 3000 && emotion !== this.currentEmotion) {
                this.rapidEmotionChanges++;
            }
        }
        
        // Check for negative transition (happy/neutral → sad/fearful/disgusted)
        const positiveEmotions = ['happy', 'neutral', 'surprised'];
        const negativeEmotions = ['sad', 'fearful', 'disgusted', 'angry'];
        
        if (positiveEmotions.includes(this.currentEmotion) && 
            negativeEmotions.includes(emotion)) {
            this.negativeTransitions++;
        }
        
        // Track confusion (fearful, disgusted emotions during task)
        if (['fearful', 'disgusted'].includes(emotion)) {
            this.confusionStates++;
        }
        
        // Update current state
        this.previousEmotion = this.currentEmotion;
        this.currentEmotion = emotion;
        
        // Store history
        this.emotionHistory.push(emotion);
        this.emotionTimestamps.push(now);
        
        // Keep only last 20 emotions
        if (this.emotionHistory.length > 20) {
            this.emotionHistory.shift();
            this.emotionTimestamps.shift();
        }
        
        // Trigger callback
        if (this.onEmotionChange) {
            this.onEmotionChange(emotion, this.getEmotionMetrics());
        }
    }
    
    // Get emotion metrics
    getEmotionMetrics() {
        return {
            currentEmotion: this.currentEmotion,
            previousEmotion: this.previousEmotion,
            rapidChanges: this.rapidEmotionChanges,
            negativeTransitions: this.negativeTransitions,
            confusionStates: this.confusionStates,
            history: [...this.emotionHistory]
        };
    }
    
    // Calculate risk score based on emotion patterns and performance
    calculateRiskScore(taskType, difficulty, isCorrect, timeSpent) {
        let riskScore = 0;
        let adhdRisk = 0;
        
        const negativeEmotions = ['sad', 'fearful', 'disgusted', 'angry'];
        
        // Higher risk if incorrect answer + negative emotion (reduced scoring)
        if (!isCorrect && negativeEmotions.includes(this.currentEmotion)) {
            riskScore += 6; // Reduced from 10
            
            // Even higher if difficulty is low (struggling with easy tasks)
            if (difficulty === 1) {
                riskScore += 9; // Reduced from 15
            } else if (difficulty === 2) {
                riskScore += 6; // Reduced from 10
            } else {
                riskScore += 3; // Reduced from 5
            }
        }
        
        // ADHD Detection: ONLY trigger on RAPID emotion shifts (5+ changes)
        // Must have clear pattern of instability
        if (this.rapidEmotionChanges >= 5) {
            adhdRisk += 12; // Only flag if consistent rapid shifts
            riskScore += 6;
        }
        
        // ADHD: Multiple rapid shifts with pattern of mistakes
        if (this.rapidEmotionChanges >= 6 && !isCorrect) {
            adhdRisk += 8; // Significant pattern of instability + errors
        }
        
        // Risk for multiple negative transitions (be more conservative)
        if (this.negativeTransitions > 3) {
            riskScore += 7; // Reduced from 12
        }
        
        // Risk for confusion states
        if (this.confusionStates > 3) {
            riskScore += 5; // Reduced from 8
        }
        
        // Risk if too much time spent (struggling)
        if (timeSpent > 10 && !isCorrect) {
            riskScore += 3; // Reduced from 5
        }
        
        // Cap all scores: confidence max 65%, disease max 80%
        return {
            totalRisk: Math.min(riskScore, 52), // 52 = 65% of 80
            adhdRisk: Math.min(adhdRisk, 64) // 64 = 80% max for ADHD
        };
    }
    
    // Reset metrics
    reset() {
        this.emotionHistory = [];
        this.emotionTimestamps = [];
        this.rapidEmotionChanges = 0;
        this.negativeTransitions = 0;
        this.confusionStates = 0;
        this.currentEmotion = 'neutral';
        this.previousEmotion = 'neutral';
    }
    
    // Cleanup
    cleanup() {
        this.stopDetection();
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
            this.videoElement.remove();
        }
    }
}

export default EmotionDetector;
