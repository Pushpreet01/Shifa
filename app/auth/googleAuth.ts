import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onLoginSuccess: () => void) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Platform-specific OAuth client IDs
    webClientId: '541518153179-70gla5p278ked85726prg3vgs9lcaakk.apps.googleusercontent.com',
    iosClientId: '541518153179-832pk85u9jj2pecm70shd2ii3lc9c9jh.apps.googleusercontent.com',
    androidClientId: '541518153179-nk6665atne6mme69secgrm6nf6ruu8hi.apps.googleusercontent.com',
    // Ensure we receive an ID token for Firebase
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
    // Use a native redirect URI for dev builds and standalone
    redirectUri: makeRedirectUri({
      scheme: 'shifa',
      native: 'shifa:/oauthredirect',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential).then(async () => {
          // Ensure a Firestore user document exists
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            const snapshot = await getDoc(userRef);
            if (!snapshot.exists()) {
              // Create a minimal profile so AuthContext can load the app
              await setDoc(userRef, {
                fullName: currentUser.displayName || '',
                email: currentUser.email || '',
                phoneNumber: '',
                role: 'Support Seeker',
                profileImage: null,
                notifications: { push: true, email: true, sms: false },
                emergencyContacts: [],
                approvalStatus: { status: 'Approved' },
                createdAt: new Date().toISOString(),
                emailVerified: true,
              });
            }
          }
          onLoginSuccess();
        });
      }
    }
  }, [response]);

  return { promptAsync };
}
