"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onJournalUpdatedAnalyze = exports.onJournalCreatedAnalyze = exports.onEventCreatedAnalyze = exports.deleteUserById = void 0;
const functionsV1 = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const sentiment_1 = __importDefault(require("sentiment"));
admin.initializeApp();
const db = admin.firestore();
// Initialize local sentiment analyzer (no external API)
const sentimentAnalyzer = new sentiment_1.default();
function labelFromScore(score) {
    if (score <= -0.2)
        return "negative";
    if (score >= 0.2)
        return "positive";
    return "neutral";
}
async function analyzeSentiment(text) {
    const trimmed = (text || "").trim();
    if (!trimmed)
        return null;
    // Cap payload to conserve quota
    const content = trimmed.slice(0, 2000);
    const result = sentimentAnalyzer.analyze(content);
    // 'comparative' is roughly normalized by token count in range approx -1..1
    const comparative = typeof result.comparative === "number" ? result.comparative : 0;
    const score = Math.max(-1, Math.min(1, comparative));
    const magnitude = Math.abs(result.score ?? 0);
    return { score, magnitude, label: labelFromScore(score) };
}
async function updateUserJournalAggregates(userId) {
    // Compute 30-day average sentiment from user's journals
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000);
    const snapshot = await db
        .collection("journals")
        .where("userId", "==", userId)
        .where("createdAt", ">=", thirtyDaysAgo)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
    let sum = 0;
    let count = 0;
    let lastSentiment = null;
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const s = data?.ai?.sentimentScore;
        if (typeof s === "number") {
            sum += s;
            count += 1;
            if (lastSentiment === null)
                lastSentiment = s;
        }
    });
    const avg = count > 0 ? sum / count : 0;
    await db
        .collection("users")
        .doc(userId)
        .set({
        ai: {
            journalSentimentAvg30d: avg,
            lastJournalSentiment: lastSentiment ?? 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    }, { merge: true });
}
function categorizeEvent(text) {
    const t = (text || "").toLowerCase();
    if (/(support|counsel|therap|help|wellbeing|mental)/.test(t))
        return "supportive";
    if (/(awareness|workshop|talk|webinar|learn|education)/.test(t))
        return "educational";
    if (/(volunteer|drive|cleanup|mentorship|donat|fundrais)/.test(t))
        return "prosocial";
    return "other";
}
async function recomputeRecommendationsForUser(userId) {
    const userDoc = await db.collection("users").doc(userId).get();
    const avg = userDoc.data()?.ai?.journalSentimentAvg30d ?? 0;
    let target;
    if (avg <= -0.3)
        target = "supportive";
    else if (avg >= 0.3)
        target = "prosocial";
    else
        target = "educational";
    // Fetch upcoming events only (date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventsSnap = await db
        .collection("events")
        .where("date", ">=", today)
        .orderBy("date", "asc")
        .limit(100)
        .get();
    const scored = [];
    eventsSnap.forEach((d) => {
        const data = d.data();
        const text = `${data.title || ""} ${data.description || ""}`.trim();
        const bucket = categorizeEvent(text);
        const evScore = typeof data?.ai?.sentimentScore === "number" ? data.ai.sentimentScore : 0;
        scored.push({ id: d.id, bucket, evScore, text });
    });
    // Filter by bucket preference
    let filtered = scored.filter((e) => e.bucket === target);
    if (filtered.length < 5) {
        // top up with other buckets
        filtered = filtered.concat(scored.filter((e) => e.bucket !== target));
    }
    // Rank: if user avg negative, prefer lower event sentiment; if positive, prefer higher
    filtered.sort((a, b) => {
        if (avg <= -0.3)
            return a.evScore - b.evScore;
        if (avg >= 0.3)
            return b.evScore - a.evScore;
        // neutral: prefer educational-like by simple heuristic and then moderate sentiment closeness to 0
        const aAbs = Math.abs(a.evScore);
        const bAbs = Math.abs(b.evScore);
        return aAbs - bAbs;
    });
    const topIds = filtered.slice(0, 5).map((e) => e.id);
    await db
        .collection("users")
        .doc(userId)
        .set({ ai: { recommendedEventIds: topIds, updatedAt: admin.firestore.FieldValue.serverTimestamp() } }, { merge: true });
}
exports.deleteUserById = functionsV1.https.onCall(async (data, context) => {
    // Only allow authenticated users
    if (!context.auth) {
        throw new functionsV1.https.HttpsError("unauthenticated", "Request had no auth context.");
    }
    // Check if caller is Super Admin
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== "Super Admin") {
        throw new functionsV1.https.HttpsError("permission-denied", "Only Super Admins can delete users.");
    }
    const { userId } = data;
    if (!userId || typeof userId !== "string") {
        throw new functionsV1.https.HttpsError("invalid-argument", "userId is required and must be a string.");
    }
    try {
        await admin.auth().deleteUser(userId);
        return { success: true };
    }
    catch (error) {
        throw new functionsV1.https.HttpsError("internal", error.message);
    }
});
// Analyze sentiment when a new event is created
exports.onEventCreatedAnalyze = functionsV1.firestore
    .document("events/{eventId}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const title = data?.title || "";
    const description = data?.description || "";
    const text = `${title}\n\n${description}`.trim();
    try {
        const sentiment = await analyzeSentiment(text);
        if (sentiment) {
            await snap.ref.set({
                ai: {
                    sentimentScore: sentiment.score,
                    sentimentMagnitude: sentiment.magnitude,
                    sentimentLabel: sentiment.label,
                    analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
            }, { merge: true });
        }
    }
    catch (err) {
        console.error("onEventCreatedAnalyze error", err);
    }
});
// Analyze sentiment for journals on create and update aggregates and recommendations
exports.onJournalCreatedAnalyze = functionsV1.firestore
    .document("journals/{journalId}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const title = data?.title || "";
    const body = data?.body || "";
    const userId = data?.userId;
    const text = `${title}\n\n${body}`.trim();
    try {
        const sentiment = await analyzeSentiment(text);
        if (sentiment) {
            await snap.ref.set({
                ai: {
                    sentimentScore: sentiment.score,
                    sentimentMagnitude: sentiment.magnitude,
                    sentimentLabel: sentiment.label,
                    analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
            }, { merge: true });
        }
        if (userId) {
            await updateUserJournalAggregates(userId);
            await recomputeRecommendationsForUser(userId);
        }
    }
    catch (err) {
        console.error("onJournalCreatedAnalyze error", err);
    }
});
// Re-analyze on journal content update
exports.onJournalUpdatedAnalyze = functionsV1.firestore
    .document("journals/{journalId}")
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = after?.userId;
    const beforeText = `${before?.title || ""}\n\n${before?.body || ""}`.trim();
    const afterText = `${after?.title || ""}\n\n${after?.body || ""}`.trim();
    if (beforeText === afterText)
        return; // no content change
    try {
        const sentiment = await analyzeSentiment(afterText);
        if (sentiment) {
            await change.after.ref.set({
                ai: {
                    sentimentScore: sentiment.score,
                    sentimentMagnitude: sentiment.magnitude,
                    sentimentLabel: sentiment.label,
                    analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
            }, { merge: true });
        }
        if (userId) {
            await updateUserJournalAggregates(userId);
            await recomputeRecommendationsForUser(userId);
        }
    }
    catch (err) {
        console.error("onJournalUpdatedAnalyze error", err);
    }
});
