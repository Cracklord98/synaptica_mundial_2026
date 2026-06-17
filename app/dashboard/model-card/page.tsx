import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UploadCard from "@/components/model-card/UploadCard";

export default async function ModelCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch user's existing model card reference if any
  const { data: card } = await supabase
    .from("model_cards")
    .select("file_url, description, repo_url, uploaded_at, answers")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch user profile to check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = !!profile?.is_admin;

  return (
    <UploadCard
      userId={user.id}
      initialCard={card || null}
      isAdmin={isAdmin}
    />
  );
}
