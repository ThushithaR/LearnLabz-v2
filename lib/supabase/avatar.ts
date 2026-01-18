import { supabase } from "./client";

export async function uploadAvatar(file: File) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const publicUrl = data.publicUrl;

  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("auth_user_id", user.id); // VERY IMPORTANT

  if (dbError) throw dbError;

  return publicUrl;
}

