import { supabase } from "./client";

export async function getUserProfile(authId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authId)
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getUserProfile(user.id);
}
