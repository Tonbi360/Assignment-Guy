/**
 * AuthContext — Authentication & User State Management
 *
 * Backed by Supabase Auth. Supports email-confirmation flows:
 *   - If auto-confirm is ON in Supabase: signUp returns a session immediately.
 *   - If email confirmation is required: signUp returns user but no session;
 *     `pendingEmailConfirmation` is set and the verify-email screen is shown.
 *     The user confirms via the emailed link, then taps "I've confirmed" which
 *     re-checks the session. onAuthStateChange handles the SIGNED_IN event.
 *
 * The external interface (useAuth) does not change based on which mode is active.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, School, Department, Course } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Non-null when a sign-up is awaiting email confirmation. */
  pendingEmailConfirmation: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, displayName: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-check whether the pending email has been confirmed. */
  checkEmailConfirmed: () => Promise<void>;
  /** Resend the confirmation email. */
  resendConfirmationEmail: () => Promise<void>;
  /** Cancel pending confirmation and return to Welcome. */
  cancelEmailConfirmation: () => void;
  /** Send a password reset email. */
  sendPasswordReset: (email: string) => Promise<void>;
  /** Save onboarding selections to local/memory state. */
  updateOnboarding: (data: {
    school?: School;
    department?: Department;
    level?: number;
    courses?: Course[];
  }) => void;
  /** Persist onboarding to backend and mark profile complete. */
  completeOnboarding: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function fetchUserProfile(accessToken: string): Promise<Partial<UserProfile> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 404) return null; // New user — onboarding not yet complete
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as Partial<UserProfile>) : null;
  } catch {
    return null;
  }
}

function buildProfile(session: Session, dbProfile: Partial<UserProfile> | null): UserProfile {
  const u = session.user;
  const displayName =
    dbProfile?.displayName ??
    (u.user_metadata?.display_name as string | undefined) ??
    u.email?.split('@')[0] ??
    'Student';

  return {
    id: u.id,
    email: u.email ?? '',
    displayName,
    profilePhoto: dbProfile?.profilePhoto ?? null,
    school: dbProfile?.school ?? null,
    department: dbProfile?.department ?? null,
    level: dbProfile?.level ?? null,
    courses: dbProfile?.courses ?? [],
    contributionScore: dbProfile?.contributionScore ?? 0,
    role: dbProfile?.role ?? 'student',
    hasCompletedOnboarding: dbProfile?.hasCompletedOnboarding ?? false,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState<string | null>(null);

  // Pending onboarding selections held in memory between steps and completeOnboarding
  const pendingOnboarding = useRef<{
    school?: School;
    department?: Department;
    level?: number;
    courses?: Course[];
  }>({});

  // ── Session hydration ───────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    async function hydrate(event: AuthChangeEvent, session: Session | null) {
      // Token refresh: silently update without resetting UI state
      if (event === 'TOKEN_REFRESHED') return;

      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // INITIAL_SESSION | SIGNED_IN | USER_UPDATED
      const dbProfile = await fetchUserProfile(session.access_token);
      if (mounted) {
        setUser(buildProfile(session, dbProfile));
        // Once we have a real session, clear any pending confirmation state
        setPendingEmailConfirmation(null);
        setLoading(false);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      hydrate(event, session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(error.message);
    // onAuthStateChange → SIGNED_IN handles the rest
  }, []);

  const signUp = useCallback(async (email: string, displayName: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });

    if (error) throw new Error(error.message);

    if (!data.session) {
      // Supabase requires email confirmation — show verify-email screen
      setPendingEmailConfirmation(email.trim().toLowerCase());
    }
    // If data.session is present (auto-confirm is on), onAuthStateChange handles it
  }, []);

  const signOut = useCallback(async () => {
    pendingOnboarding.current = {};
    setPendingEmailConfirmation(null);
    await supabase.auth.signOut();
    // onAuthStateChange → SIGNED_OUT sets user to null
  }, []);

  const checkEmailConfirmed = useCallback(async () => {
    // Re-fetch the session from Supabase; if confirmed, onAuthStateChange fires SIGNED_IN
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!data.session) {
      throw new Error('Email not yet confirmed. Please check your inbox and try again.');
    }
    // Session exists — onAuthStateChange will handle hydration
  }, []);

  const resendConfirmationEmail = useCallback(async () => {
    if (!pendingEmailConfirmation) return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmailConfirmation,
    });
    if (error) throw new Error(error.message);
  }, [pendingEmailConfirmation]);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
    );
    if (error) throw new Error(error.message);
  }, []);

  const cancelEmailConfirmation = useCallback(() => {
    setPendingEmailConfirmation(null);
  }, []);

  // ── Onboarding ──────────────────────────────────────────────────────────

  const updateOnboarding = useCallback(
    (data: { school?: School; department?: Department; level?: number; courses?: Course[] }) => {
      pendingOnboarding.current = { ...pendingOnboarding.current, ...data };
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ...(data.school !== undefined && { school: data.school }),
          ...(data.department !== undefined && { department: data.department }),
          ...(data.level !== undefined && { level: data.level }),
          ...(data.courses !== undefined && { courses: data.courses }),
        };
      });
    },
    [],
  );

  const completeOnboarding = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const { school, department, level, courses } = pendingOnboarding.current;
    const displayName =
      user?.displayName ??
      (session.user.user_metadata?.display_name as string | undefined) ??
      'Student';

    const res = await fetch(`${API_BASE}/api/v1/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email: session.user.email,
        displayName,
        schoolId: school?.school_id,
        departmentId: department?.department_id,
        level,
        courseIds: courses?.map(c => c.course_id) ?? [],
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? 'Failed to save your profile. Please try again.');
    }

    pendingOnboarding.current = {};
    setUser(prev => (prev ? { ...prev, hasCompletedOnboarding: true } : prev));
  }, [user]);

  // ── Context value ───────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: user !== null,
    pendingEmailConfirmation,
    signIn,
    signUp,
    signOut,
    checkEmailConfirmed,
    resendConfirmationEmail,
    cancelEmailConfirmation,
    sendPasswordReset,
    updateOnboarding,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
