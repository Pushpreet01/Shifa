import Sentiment from "sentiment";

export type SentimentLabel = "negative" | "neutral" | "positive";

export interface SentimentPayload {
    sentimentScore: number; // -1..1
    sentimentMagnitude: number; // >= 0
    sentimentLabel: SentimentLabel;
    analyzedAt: string; // ISO timestamp
}

const analyzer = new Sentiment();

export function analyzeTextSentiment(text: string): SentimentPayload {
    const trimmed = (text || "").trim();
    if (!trimmed) {
        return {
            sentimentScore: 0,
            sentimentMagnitude: 0,
            sentimentLabel: "neutral",
            analyzedAt: new Date().toISOString(),
        };
    }

    const content = trimmed.slice(0, 2000);
    const result = analyzer.analyze(content);
    const comparative = typeof result.comparative === "number" ? result.comparative : 0;
    const score = Math.max(-1, Math.min(1, comparative));
    const magnitude = Math.abs(result.score ?? 0);
    const label: SentimentLabel = score <= -0.2 ? "negative" : score >= 0.2 ? "positive" : "neutral";

    return {
        sentimentScore: score,
        sentimentMagnitude: magnitude,
        sentimentLabel: label,
        analyzedAt: new Date().toISOString(),
    };
}


