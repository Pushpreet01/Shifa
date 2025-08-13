import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

function categorizeEvent(title: string, description: string): "supportive" | "educational" | "prosocial" | "other" {
    const t = `${title || ""} ${description || ""}`.toLowerCase();
    if (/(support|counsel|therap|help|wellbeing|mental)/.test(t)) return "supportive";
    if (/(awareness|workshop|talk|webinar|learn|education)/.test(t)) return "educational";
    if (/(volunteer|drive|cleanup|mentorship|donat|fundrais)/.test(t)) return "prosocial";
    return "other";
}

export async function recomputeRecommendationsForCurrentUser(avgJournalSentiment: number): Promise<string[]> {
    const user = auth.currentUser;
    if (!user) return [];

    let target: "supportive" | "educational" | "prosocial" | "other";
    if (avgJournalSentiment <= -0.3) target = "supportive";
    else if (avgJournalSentiment >= 0.3) target = "prosocial";
    else target = "educational";

    // Upcoming events (date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventsSnap = await getDocs(
        query(collection(db, "events"), where("date", ">=", today), orderBy("date", "asc"))
    );

    const candidates: Array<{ id: string; bucket: string; evScore: number; title: string; description: string }> = [];
    eventsSnap.forEach((d) => {
        const data: any = d.data();
        const approved = (typeof data?.approvalStatus === "object" && data?.approvalStatus?.status === "Approved");
        if (!approved) return; // include only approved events
        const bucket = categorizeEvent(data?.title, data?.description);
        const evScore = typeof data?.ai?.sentimentScore === "number" ? data.ai.sentimentScore : 0;
        candidates.push({ id: d.id, bucket, evScore, title: data?.title || "", description: data?.description || "" });
    });

    // Strongly prioritize target bucket, then top-up with others
    const inBucket = candidates.filter((e) => e.bucket === target);
    const outBucket = candidates.filter((e) => e.bucket !== target);

    const sortBySentiment = (arr: typeof candidates) =>
        arr.sort((a, b) => {
            if (avgJournalSentiment <= -0.3) return a.evScore - b.evScore; // negative mood → prefer lower
            if (avgJournalSentiment >= 0.3) return b.evScore - a.evScore; // positive mood → prefer higher
            // neutral → closer to zero
            return Math.abs(a.evScore) - Math.abs(b.evScore);
        });

    sortBySentiment(inBucket);
    sortBySentiment(outBucket);

    const ordered = inBucket.concat(outBucket);
    const topIds = ordered.slice(0, 5).map((e) => e.id);

    // Persist on the user for quick access
    await setDoc(
        doc(db, "users", user.uid),
        { ai: { recommendedEventIds: topIds, updatedAt: new Date().toISOString() } },
        { merge: true }
    );

    return topIds;
}

export async function getRecommendedEventsForCurrentUser(): Promise<any[]> {
    const user = auth.currentUser;
    if (!user) return [];
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const ids: string[] = userDoc.data()?.ai?.recommendedEventIds || [];
    const results: any[] = [];
    if (ids.length) {
        for (const id of ids) {
            const d = await getDoc(doc(db, "events", id));
            if (d.exists()) {
                const data: any = d.data();
                const approved = (typeof data?.approvalStatus === "object" && data?.approvalStatus?.status === "Approved");
                if (approved) results.push({ id: d.id, ...data });
            }
        }
        if (results.length) return results;
    }

    // Fallback: show most recently added events irrespective of sentiment
    const latestSnap = await getDocs(
        query(collection(db, "events"), orderBy("createdAt", "desc"), limit(10))
    );
    latestSnap.forEach((d) => {
        const data: any = d.data();
        const approved = (typeof data?.approvalStatus === "object" && data?.approvalStatus?.status === "Approved");
        if (approved) results.push({ id: d.id, ...data });
    });
    // limit to 5 after filtering
    return results.slice(0, 5);
}


