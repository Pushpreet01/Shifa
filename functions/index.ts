import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

export const deleteUserById = functions.https.onCall(async (data, context) => {
  // Only allow authenticated users
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Request had no auth context.");
  }

  // Check if caller is Super Admin
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== "Super Admin") {
    throw new functions.https.HttpsError("permission-denied", "Only Super Admins can delete users.");
  }

  const { userId } = data;
  if (!userId || typeof userId !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "userId is required and must be a string.");
  }

  try {
    await admin.auth().deleteUser(userId);
    return { success: true };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});