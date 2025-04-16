const natural = require('natural');
const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = natural;
const { generateQuestions, processConversation } = require('./ai/ollamaClient');

class FeedbackAnalyzer {
    constructor() {
        this.tokenizer = new WordTokenizer();
        this.analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
        this.feedbackHistory = new Map();
        this.fallbackResponses = {
            strengths: [
                "Strong technical skills demonstrated",
                "Good problem-solving approach",
                "Clear communication style",
                "Effective teamwork capabilities",
                "Solid understanding of core concepts"
            ],
            weaknesses: [
                "Could improve technical depth",
                "Need more specific examples",
                "Communication could be more structured",
                "Could demonstrate more initiative",
                "Technical knowledge needs broadening"
            ],
            recommendations: [
                "Practice explaining complex concepts simply",
                "Work on providing more concrete examples",
                "Develop stronger technical foundations",
                "Improve time management skills",
                "Enhance problem-solving approaches"
            ]
        };
    }

    async analyzeFeedback(feedback, context = {}) {
        try {
            // Basic text analysis
            const tokens = this.tokenizer.tokenize(feedback);
            const sentiment = this.analyzer.getSentiment(tokens);
            const keyPhrases = this.extractKeyPhrases(tokens);
            
            // Try to get AI insights with fallback
            let aiInsights = null;
            try {
                aiInsights = await this.generateAIInsights(feedback, context);
            } catch (error) {
                console.warn('AI insights generation failed, using fallback:', error);
                aiInsights = this.generateFallbackInsights(feedback);
            }
            
            const score = this.calculateFeedbackScore(sentiment, keyPhrases, aiInsights);
            
            // Store feedback
            const analysis = {
                sentiment,
                keyPhrases,
                aiInsights,
                score,
                timestamp: new Date(),
                context
            };
            
            this.storeFeedback(feedback, analysis);

            return {
                ...analysis,
                recommendations: this.generateRecommendations(score, keyPhrases, aiInsights)
            };
        } catch (error) {
            console.error('Error in feedback analysis:', error);
            return this.generateFallbackAnalysis(feedback);
        }
    }

    generateFallbackInsights(feedback) {
        return {
            strengths: this.fallbackResponses.strengths
                .slice(0, Math.floor(Math.random() * 3) + 1),
            weaknesses: this.fallbackResponses.weaknesses
                .slice(0, Math.floor(Math.random() * 2) + 1),
            recommendations: this.fallbackResponses.recommendations
                .slice(0, Math.floor(Math.random() * 3) + 1)
        };
    }

    generateFallbackAnalysis(feedback) {
        const tokens = this.tokenizer.tokenize(feedback);
        const sentiment = this.analyzer.getSentiment(tokens);
        const keyPhrases = this.extractKeyPhrases(tokens);
        const score = Math.max(0, Math.min(100, (sentiment + 5) * 10));
        
        return {
            sentiment,
            keyPhrases,
            aiInsights: this.generateFallbackInsights(feedback),
            score,
            timestamp: new Date(),
            recommendations: this.generateRecommendations(score, keyPhrases, null),
            isFallback: true
        };
    }

    extractKeyPhrases(tokens) {
        const tfidf = new natural.TfIdf();
        tfidf.addDocument(tokens.join(' '));
        
        const keyPhrases = [];
        tfidf.listTerms(0).forEach(item => {
            if (item.tfidf > 0.1) { // Threshold for significant terms
                keyPhrases.push({
                    term: item.term,
                    importance: item.tfidf
                });
            }
        });
        
        return keyPhrases;
    }

    async generateAIInsights(feedback, context) {
        const prompt = `Analyze the following feedback and provide detailed insights:
        Feedback: ${feedback}
        Context: ${JSON.stringify(context)}
        Focus on:
        1. Key strengths and weaknesses
        2. Areas for improvement
        3. Specific actionable recommendations
        4. Potential impact on performance`;

        try {
            const response = await processConversation(prompt);
            return response;
        } catch (error) {
            console.error('Error generating AI insights:', error);
            return null;
        }
    }

    calculateFeedbackScore(sentiment, keyPhrases, aiInsights) {
        // Base score from sentiment (-5 to 5)
        let score = (sentiment + 5) * 10; // Normalize to 0-100
        
        // Adjust based on key phrases
        const positivePhrases = keyPhrases.filter(p => p.importance > 0.2).length;
        const negativePhrases = keyPhrases.filter(p => p.importance < -0.2).length;
        
        score += positivePhrases * 5;
        score -= negativePhrases * 5;
        
        // Normalize to 0-100
        score = Math.max(0, Math.min(100, score));
        
        return Math.round(score);
    }

    generateRecommendations(score, keyPhrases, aiInsights) {
        const recommendations = [];
        
        if (score < 50) {
            recommendations.push({
                priority: 'high',
                action: 'Immediate attention required',
                details: 'Focus on addressing critical issues identified in feedback'
            });
        } else if (score < 70) {
            recommendations.push({
                priority: 'medium',
                action: 'Targeted improvements needed',
                details: 'Implement specific improvements based on feedback analysis'
            });
        } else {
            recommendations.push({
                priority: 'low',
                action: 'Maintain and enhance',
                details: 'Continue current practices while looking for opportunities to excel'
            });
        }

        // Add specific recommendations based on key phrases
        keyPhrases.forEach(phrase => {
            if (phrase.importance > 0.3) {
                recommendations.push({
                    priority: 'medium',
                    action: `Leverage strength in ${phrase.term}`,
                    details: `Build upon this positive aspect`
                });
            } else if (phrase.importance < -0.3) {
                recommendations.push({
                    priority: 'high',
                    action: `Address concern about ${phrase.term}`,
                    details: `Develop a plan to improve in this area`
                });
            }
        });

        return recommendations;
    }

    storeFeedback(feedback, analysis) {
        const feedbackId = Date.now().toString();
        this.feedbackHistory.set(feedbackId, {
            feedback,
            analysis,
            timestamp: new Date()
        });
        return feedbackId;
    }

    getFeedbackHistory() {
        return Array.from(this.feedbackHistory.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }
}

module.exports = new FeedbackAnalyzer(); 