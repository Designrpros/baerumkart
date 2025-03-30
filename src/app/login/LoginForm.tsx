"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../../firebase";
import { useRouter, useSearchParams } from "next/navigation";

// Google SVG Icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: "8px" }}>
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.21 1.125-.842 2.078-1.797 2.717v2.258h2.908c1.702-1.567 2.686-3.874 2.686-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.042h3.007v-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.428 0 9 0 5.482 0 2.438 2.017.957 4.958h3.007v2.332C4.672 5.164 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const PageContainer = styled.div`
  background: url("/hero4.jpg") no-repeat center center/cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  background: white;
  font-family: "Helvetica", Arial, sans-serif;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1a1a1a;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #1a1a1a;
  &:focus {
    outline: none;
    border-color: #1a1a1a;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) {
    background-color: #333;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(Button)`
  background-color: white;
  color: #1a1a1a;
  border: 1px solid #d1d5db;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
`;

const WelcomeMessage = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem; /* Reduced to fit note */
  text-align: center;
  color: #1a1a1a;
`;

const LogoutNote = styled.p`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #4285f4;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;
  margin-top: 0.5rem;
  display: block;
  width: 100%;
  &:hover {
    text-decoration: underline;
  }
`;

const Note = styled.p`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-top: 1rem;
`;

const LoginForm = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const isIOSWebView =
    typeof window !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent) && window.webkit?.messageHandlers;

  useEffect(() => {
    const handleNativeAuth = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.idToken && detail?.accessToken) {
        const credential = GoogleAuthProvider.credential(detail.idToken, detail.accessToken);
        signInWithCredential(auth, credential)
          .then((result) => {
            console.log("[Login] Signed in with native credential:", result.user.email);
          })
          .catch((err) => {
            console.error("[Login] Error with native credential:", err);
            setError(getFirebaseErrorMessage(err));
          });
      }
    };

    window.addEventListener("authState", handleNativeAuth as EventListener);
    return () => window.removeEventListener("authState", handleNativeAuth as EventListener);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("[Login] User signed in:", currentUser.email, "UID:", currentUser.uid);
        setUser(currentUser);

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(
              userRef,
              {
                email: currentUser.email,
                createdAt: currentUser.metadata.creationTime || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                rentals: [],
                cart: { items: [] },
              },
              { merge: true }
            );
            console.log("[Login] New user document created in Firestore:", currentUser.uid);
          } else {
            await setDoc(
              userRef,
              { lastLogin: new Date().toISOString() },
              { merge: true }
            );
            console.log("[Login] Updated lastLogin for existing user:", currentUser.uid);
          }
        } catch (err) {
          console.error("[Login] Error updating Firestore:", err);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log("[Login] Email sign-up successful:", result.user.email);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("[Login] Email sign-in successful:", result.user.email);
      }
      router.push(returnTo);
    } catch (error: any) {
      console.error("[Login] Email auth error:", error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isIOSWebView) {
        // Ensure messageHandlers and signIn exist before calling postMessage
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.signIn
        ) {
          window.webkit.messageHandlers.signIn.postMessage({ action: "googleSignIn" });
        } else {
          throw new Error("Native sign-in is not available on this device.");
        }
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("[Login] Google sign-in successful:", result.user.email);
      }
      router.push(returnTo);
    } catch (error: any) {
      console.error("[Login] Google sign-in error:", error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log("[Login] User signed out");
      setUser(null);
      router.push("/login");
    } catch (error: any) {
      console.error("[Login] Sign out error:", error);
      setError("Error signing out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (error: any): string => {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        return "Sign-in popup closed. Try again";
      case "auth/network-request-failed":
        return "Network error.";
      case "auth/too-many-requests":
        return "Too many attempts.";
      case "auth/email-already-in-use":
        return "Email already in use.";
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/user-not-found":
        return "User not found.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Contact support.";
      case "auth/popup-blocked":
        return "Popup blocked by browser. Allow popups and try again.";
      default:
        return `Error: ${error.message}`;
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        {user ? (
          <>
            <WelcomeMessage>Welcome, {user.email}!</WelcomeMessage>
            <LogoutNote>Your rentals await when you log in again.</LogoutNote>
            <Button onClick={handleSignOut} disabled={loading}>
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </>
        ) : (
          <>
            <Title>{isSignUp ? "Sign Up" : "Login"}</Title>
            <form onSubmit={handleEmailAuth}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isSignUp && (
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
            <ToggleLink onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
            </ToggleLink>
            <Note>Use your Gmail? Sign in with Google below instead.</Note>
            <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
              <GoogleIcon />
              {loading ? "Signing in..." : "Sign in with Google"}
            </GoogleButton>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        )}
      </FormContainer>
    </PageContainer>
  );
};

export default LoginForm;