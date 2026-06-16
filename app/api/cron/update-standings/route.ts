import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  // Validate Vercel Cron authorization secret
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("No Autorizado", { status: 401 });
  }

  // Create service-role or client-server database connection
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      }
    }
  );

  try {
    // Fetch teams from external World Cup 2026 API
    const response = await fetch("https://api.worldcup2026.dev/teams", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const externalTeams = await response.json();
    
    if (!Array.isArray(externalTeams)) {
      throw new Error("Formato de respuesta de API inválido");
    }

    // Format and map teams to our schema
    const formattedTeams = externalTeams.map((team: any) => ({
      name: team.name,
      flag_url: team.flag || `https://flagcdn.com/${team.code?.toLowerCase()}.svg`,
      group_name: team.group || "A",
      position_in_group: team.position || 1,
      is_qualified: team.qualified ?? true,
      eliminated: team.eliminated ?? false
    }));

    // Upsert teams into public.teams (matching by name)
    const { error } = await supabase
      .from("teams")
      .upsert(formattedTeams, { onConflict: "name" });

    if (error) throw error;

    return NextResponse.json({ success: true, count: formattedTeams.length });
  } catch (err: unknown) {
    console.error("Cron Error (update-standings):", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Error desconocido" 
    }, { status: 500 });
  }
}
