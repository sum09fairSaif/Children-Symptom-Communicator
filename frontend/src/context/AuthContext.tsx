import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface User {
  email: string;
  name: string;
  age?: number;
  dueDate?: string;
  height?: string;
  weight?: string;
  location?: string;
  weeksPregnant?: number;
  medicalHistory?: string;
  allergies?: string;
  hasCompletedOnboarding?: boolean;
}

interface UserProfileData {
  age: number;
  height: string;
  weight: string;
  location: string;
  dueDate: string;
  weeksPregnant: number;
  medicalHistory?: string;
  allergies?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profileData: UserProfileData) => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH0_ENABLED = Boolean(
  import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID,
);

function getProfileStorageKey(id: string) {
  return `connecther:user:${id}`;
}

function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email && password) {
      // Try to retrieve existing user data from localStorage
      const savedUser = localStorage.getItem("user");
      let userData: User;

      if (savedUser) {
        // If user data exists, use it to preserve name and other info
        const parsedUser = JSON.parse(savedUser);
        // Case-insensitive email comparison
        if (parsedUser.email.toLowerCase().trim() === email.toLowerCase().trim()) {
          // Same user logging back in - use their saved data
          userData = parsedUser;
        } else {
          // Different user - create new user data
          userData = {
            email,
            name: email.split("@")[0],
          };
        }
      } else {
        // No saved user - create new user data
        userData = {
          email,
          name: email.split("@")[0],
        };
      }

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    if (email && password && name) {
      const userData: User = {
        email,
        name,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUserProfile = async (profileData: UserProfileData): Promise<void> => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      ...profileData,
      hasCompletedOnboarding: true,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    hasCompletedOnboarding: !!user?.hasCompletedOnboarding,
    isAuthLoading: false,
    authError: null,
    clearAuthError: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Auth0BackedAuthProvider({ children }: { children: ReactNode }) {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const storageId = auth0User?.sub || auth0User?.email || "";

  useEffect(() => {
    if (!storageId) {
      setProfileData({});
      return;
    }

    const saved = localStorage.getItem(getProfileStorageKey(storageId));
    const parsedData = saved ? JSON.parse(saved) : {};

    // Check if there's a pending name from registration
    const pendingName = sessionStorage.getItem('pending-user-name');
    if (pendingName && !parsedData.name) {
      parsedData.name = pendingName;
      localStorage.setItem(getProfileStorageKey(storageId), JSON.stringify(parsedData));
      sessionStorage.removeItem('pending-user-name');
    }

    setProfileData(parsedData);
  }, [storageId]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error || errorDescription) {
      setAuthError(
        errorDescription ||
          "Authentication failed. Please verify your credentials and try again.",
      );

      // Remove OAuth params from URL after surfacing the error.
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      url.searchParams.delete("state");
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setAuthError(null);
    await loginWithRedirect({
      authorizationParams: {
        login_hint: email || undefined,
        redirect_uri: `${window.location.origin}/login`,
      },
      appState: {
        returnTo: "/",
      },
    });
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setAuthError(null);

    // Store the name in localStorage temporarily so we can use it after Auth0 redirect
    if (name) {
      sessionStorage.setItem('pending-user-name', name);
    }

    await loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        login_hint: email || undefined,
        redirect_uri: `${window.location.origin}/register`,
      },
      appState: {
        returnTo: "/",
      },
    });
    return true;
  };

  const logout = () => {
    auth0Logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  const updateUserProfile = async (incomingProfile: UserProfileData): Promise<void> => {
    if (!storageId) return;
    const nextProfile: Partial<User> = {
      ...incomingProfile,
      hasCompletedOnboarding: true,
    };
    localStorage.setItem(
      getProfileStorageKey(storageId),
      JSON.stringify(nextProfile),
    );
    setProfileData(nextProfile);
  };

  const mergedUser: User | null = useMemo(() => {
    if (!isAuthenticated || !auth0User) return null;
    return {
      email: auth0User.email || "",
      name: profileData.name || auth0User.name || auth0User.nickname || "User",
      ...profileData,
    };
  }, [auth0User, isAuthenticated, profileData]);

  const value: AuthContextType = {
    user: mergedUser,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated,
    hasCompletedOnboarding: !!mergedUser?.hasCompletedOnboarding,
    isAuthLoading: isLoading,
    authError,
    clearAuthError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (AUTH0_ENABLED) {
    return <Auth0BackedAuthProvider>{children}</Auth0BackedAuthProvider>;
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
