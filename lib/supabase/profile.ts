import { supabase } from "./client";

export async function getUserProfile(authId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      user_id,
      user_name,
      user_email,
      avatar_url,
      school_name,
      class_name
    `)
    .eq("auth_user_id", authId)
    .single();

  if (error) {
    console.error("getUserProfile error:", error);
    return null;
  }

  return data;
}

export async function getCurrentUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getUserProfile(user.id);
}
