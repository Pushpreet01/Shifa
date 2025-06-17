import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onLoginSuccess: () => void) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '541518153179-aj6mjsi3lsln13ki24jdaq2nfu9qvt6i.apps.googleusercontent.com',
    iosClientId: '541518153179-832pk85u9jj2pecm70shd2ii3lc9c9jh.apps.googleusercontent.com',
    androidClientId: '541518153179-nk6665atne6mme69secgrm6nf6ruu8hi.apps.googleusercontent.com',
    webClientId: '541518153179-aj6mjsi3lsln13ki24jdaq2nfu9qvt6i.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential).then(() => {
          onLoginSuccess();
        });
      }
    }
  }, [response]);

  return { promptAsync };
}
