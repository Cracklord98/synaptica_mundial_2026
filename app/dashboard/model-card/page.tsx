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
    .select("file_url, description, uploaded_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <UploadCard
      userId={user.id}
      initialCard={card || null}
    />
  );
}
