import { useUser } from "@clerk/nextjs";
export const isUserAdmin = (user: ReturnType<typeof useUser>) => {
  if (user.isLoaded && !user.isSignedIn) return false;
  if (!user.user) return false;

  if (user.user.username === "trobleton") return true;
};
