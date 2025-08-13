import { collection, query, where, orderBy, limit, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export async function updateUserJournalAggregatesForCurrentUser(): Promise<{ avg30d: number; last: number }> {
    const user = auth.currentUser;
    if (!user) return { avg30d: 0, last: 0 };

    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const q = query(
        collection(db, "journals"),
        where("userId", "==", user.uid),
        where("createdAt", ">=", thirtyDaysAgo),
        orderBy("createdAt", "desc"),
        limit(50)
    );
    const snap = await getDocs(q);
    let sum = 0;
    let count = 0;
    let last: number | null = null;
    snap.forEach((d) => {
        const data: any = d.data();
        const s = data?.ai?.sentimentScore;
        if (typeof s === "number") {
            sum += s;
            count += 1;
            if (last === null) last = s;
        }
    });
    const avg = count ? sum / count : 0;
    await setDoc(
        doc(db, "users", user.uid),
        { ai: { journalSentimentAvg30d: avg, lastJournalSentiment: last ?? 0, updatedAt: new Date().toISOString() } },
        { merge: true }
    );
    return { avg30d: avg, last: last ?? 0 };
}


