import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Sync user to our database if not exists
  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {
      name: user.user_metadata?.name || user.email?.split("@")[0],
      avatarUrl: user.user_metadata?.avatar_url,
    },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split("@")[0],
      avatarUrl: user.user_metadata?.avatar_url,
    },
  });

  return dbUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

