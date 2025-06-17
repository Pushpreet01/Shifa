// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { signOut as firebaseSignOut } from "../services/firebaseUserService";

export type Role =
  | "Admin"
  | "Support Seeker"
  | "Event Organizer"
  | "Volunteer"
  | null;

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: Role;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  errorMsg: string | null;
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  errorMsg: null,
  setErrorMsg: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out in AuthContext:", error);
      // Optionally set an error message for the UI
      setErrorMsg("Failed to sign out. Please try again.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;

          const roleFromDb = userData?.role as Role | undefined;

          // Check role existence and validity
          const validRoles: Role[] = [
            "Admin",
            "Support Seeker",
            "Event Organizer",
            "Volunteer",
          ];

          if (!roleFromDb || !validRoles.includes(roleFromDb)) {
            setUser(null);
            setErrorMsg(
              "User role is not assigned or invalid. Please contact support."
            );
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName:
                firebaseUser.displayName || auth.currentUser?.displayName || "",
              role: roleFromDb,
            });
            setErrorMsg(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(null);
          setErrorMsg("Failed to load user role. Please try again.");
        }
      } else {
        setUser(null);
        setErrorMsg(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        isAuthenticated,
        signIn: async () => {},
        signUp: async () => {},
        signOut,
        errorMsg,
        setErrorMsg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "../config/firebaseConfig";
// import { User, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../config/firebaseConfig";

// export type Role = "Admin" | "Support Seeker" | "Event Organizer" | "Volunteer" | null;

// export interface AuthUser {
//   uid: string;
//   email: string | null;
//   displayName: string | null;
//   role?: Role;
//   approved?: boolean; //  Added here
// }

// export interface AuthContextType {
//   user: AuthUser | null;
//   loading: boolean;
//   setUser: (user: AuthUser | null) => void;
//   isAuthenticated: boolean;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (email: string, password: string) => Promise<void>;
//   signOut: () => Promise<void>;
//   errorMsg: string | null;
//   setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   setUser: () => {},
//   isAuthenticated: false,
//   signIn: async () => {},
//   signUp: async () => {},
//   signOut: async () => {},
//   errorMsg: null,
//   setErrorMsg: () => {},
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const isAuthenticated = !!user;

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
//           const userData = userDoc.exists() ? userDoc.data() : null;
//           const roleFromDb = userData?.role as Role | undefined;
//           const approvedFromDb = userData?.approved === true;

//           const validRoles: Role[] = ["Admin", "Support Seeker", "Event Organizer", "Volunteer"];

//           if (!roleFromDb || !validRoles.includes(roleFromDb)) {
//             setUser(null);
//             setErrorMsg("User role is not assigned or invalid. Please contact support.");
//           } else if ((roleFromDb === "Event Organizer" || roleFromDb === "Volunteer") && !approvedFromDb) {
//             setUser({
//               uid: firebaseUser.uid,
//               email: firebaseUser.email,
//               displayName: firebaseUser.displayName || auth.currentUser?.displayName || "",
//               role: roleFromDb,
//               approved: false,
//             });
//             setErrorMsg("Your account is awaiting admin approval.");
//           } else {
//             setUser({
//               uid: firebaseUser.uid,
//               email: firebaseUser.email,
//               displayName: firebaseUser.displayName || auth.currentUser?.displayName || "",
//               role: roleFromDb,
//               approved: true,
//             });
//             setErrorMsg(null);
//           }
//         } catch (error) {
//           console.error("Error fetching user role:", error);
//           setUser(null);
//           setErrorMsg("Failed to load user role. Please try again.");
//         }
//       } else {
//         setUser(null);
//         setErrorMsg(null);
//       }

//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         setUser,
//         isAuthenticated,
//         signIn: async () => {},
//         signUp: async () => {},
//         signOut: async () => {},
//         errorMsg,
//         setErrorMsg,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
