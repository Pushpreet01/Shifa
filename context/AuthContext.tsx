// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { signOut as firebaseSignOut } from "../services/firebaseUserService";

export type Role =
  | "Super Admin"
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
  setUser: () => { },
  isAuthenticated: false,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  errorMsg: null,
  setErrorMsg: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Add logging when user state changes
  useEffect(() => {
    console.log("[AuthContext] User state changed:", user);
  }, [user]);

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
    console.log("[AuthContext] Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log("[AuthContext] onAuthStateChanged triggered, firebaseUser:", firebaseUser ? "exists" : "null");
        if (firebaseUser) {
          console.log("[AuthContext] Firebase user exists, fetching Firestore data");
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;
            const roleFromDb = userData?.role as Role | undefined;
            const emailVerified = userData?.emailVerified === true;
            const approvalStatus = userData?.approvalStatus;
            const validRoles: Role[] = [
              "Super Admin",
              "Admin",
              "Support Seeker",
              "Event Organizer",
              "Volunteer",
            ];
            console.log("[AuthContext] Firebase user:", firebaseUser.uid);
            console.log("[AuthContext] Firestore userDoc:", userData);
            console.log("[AuthContext] roleFromDb:", roleFromDb);
            console.log("[AuthContext] approvalStatus:", approvalStatus);
            if (!roleFromDb || !validRoles.includes(roleFromDb)) {
              console.log("[AuthContext] Invalid or missing role");
              setUser(null);
              setErrorMsg(
                "User role is not assigned or invalid. Please contact support."
              );
            } else if (!emailVerified) {
              console.log("[AuthContext] Email not verified");
              setUser(null);
              setErrorMsg("Please verify your email address to continue.");
            } else if (!approvalStatus || approvalStatus.status === "Pending") {
              console.log("[AuthContext] Approval status pending or missing");
              setUser(null);
              setErrorMsg("Your account is pending admin approval. You can sign out and try with a different account while waiting.");
            } else if (approvalStatus.status === "Rejected") {
              console.log("[AuthContext] Approval status rejected");
              setUser(null);
              setErrorMsg(approvalStatus.reason ? `Account rejected: ${approvalStatus.reason}. You can sign out and try with a different account.` : "Your account was rejected by the admin. You can sign out and try with a different account.");
            } else if (approvalStatus.status === "Approved") {
              console.log("[AuthContext] Approval status approved, setting user");
              const userToSet = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName:
                  firebaseUser.displayName || auth.currentUser?.displayName || "",
                role: roleFromDb,
              };
              console.log("[AuthContext] Setting user object:", userToSet);
              setUser(userToSet);
              setErrorMsg(null);
            } else {
              console.log("[AuthContext] Unknown approval status");
              setUser(null);
              setErrorMsg("Unknown approval status. Please contact support.");
            }
          } catch (error) {
            console.error("[AuthContext] Error fetching user role:", error);
            setUser(null);
            setErrorMsg("Failed to load user role. Please try again.");
          }
        } else {
          console.log("[AuthContext] No Firebase user, setting user to null");
          setUser(null);
          setErrorMsg(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("[AuthContext] Error in onAuthStateChanged callback:", error);
        setUser(null);
        setErrorMsg("Authentication error occurred. Please try again.");
        setLoading(false);
      }
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
        signIn: async () => { },
        signUp: async () => { },
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
