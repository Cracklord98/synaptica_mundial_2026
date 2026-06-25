const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_TEAMS = [
  { id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', name: 'Clasificado 1', flag_url: null, group_name: 'A', position_in_group: 1, is_qualified: true },
  { id: 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', name: 'Clasificado 2', flag_url: null, group_name: 'A', position_in_group: 2, is_qualified: true },
  { id: 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', name: 'Clasificado 3', flag_url: null, group_name: 'B', position_in_group: 1, is_qualified: true },
  { id: 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', name: 'Clasificado 4', flag_url: null, group_name: 'B', position_in_group: 2, is_qualified: true },
  { id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', name: 'Clasificado 5', flag_url: null, group_name: 'C', position_in_group: 1, is_qualified: true },
  { id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', name: 'Clasificado 6', flag_url: null, group_name: 'C', position_in_group: 2, is_qualified: true },
  { id: 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3', name: 'Clasificado 7', flag_url: null, group_name: 'D', position_in_group: 1, is_qualified: true },
  { id: 'b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4', name: 'Clasificado 8', flag_url: null, group_name: 'D', position_in_group: 2, is_qualified: true },
  { id: 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', name: 'Clasificado 9', flag_url: null, group_name: 'E', position_in_group: 1, is_qualified: true },
  { id: 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', name: 'Clasificado 10', flag_url: null, group_name: 'E', position_in_group: 2, is_qualified: true },
  { id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', name: 'Clasificado 11', flag_url: null, group_name: 'F', position_in_group: 1, is_qualified: true },
  { id: 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', name: 'Clasificado 12', flag_url: null, group_name: 'F', position_in_group: 2, is_qualified: true },
  { id: 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', name: 'Clasificado 13', flag_url: null, group_name: 'G', position_in_group: 1, is_qualified: true },
  { id: 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', name: 'Clasificado 14', flag_url: null, group_name: 'G', position_in_group: 2, is_qualified: true },
  { id: 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', name: 'Clasificado 15', flag_url: null, group_name: 'H', position_in_group: 1, is_qualified: true },
  { id: 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', name: 'Clasificado 16', flag_url: null, group_name: 'H', position_in_group: 2, is_qualified: true },
  { id: 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', name: 'Clasificado 17', flag_url: null, group_name: 'I', position_in_group: 1, is_qualified: true },
  { id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', name: 'Clasificado 18', flag_url: null, group_name: 'I', position_in_group: 2, is_qualified: true },
  { id: 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', name: 'Clasificado 19', flag_url: null, group_name: 'J', position_in_group: 1, is_qualified: true },
  { id: 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', name: 'Clasificado 20', flag_url: null, group_name: 'J', position_in_group: 2, is_qualified: true },
  { id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', name: 'Clasificado 21', flag_url: null, group_name: 'K', position_in_group: 1, is_qualified: true },
  { id: 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', name: 'Clasificado 22', flag_url: null, group_name: 'K', position_in_group: 2, is_qualified: true },
  { id: 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', name: 'Clasificado 23', flag_url: null, group_name: 'L', position_in_group: 1, is_qualified: true },
  { id: 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', name: 'Clasificado 24', flag_url: null, group_name: 'L', position_in_group: 2, is_qualified: true },
  { id: '19191919-1919-1919-1919-191919191919', name: 'Clasificado 25', flag_url: null, group_name: 'A', position_in_group: 3, is_qualified: true },
  { id: '29292929-2929-2929-2929-292929292929', name: 'Clasificado 26', flag_url: null, group_name: 'B', position_in_group: 3, is_qualified: true },
  { id: '39393939-3939-3939-3939-393939393939', name: 'Clasificado 27', flag_url: null, group_name: 'C', position_in_group: 3, is_qualified: true },
  { id: '49494949-4949-4949-4949-494949494949', name: 'Clasificado 28', flag_url: null, group_name: 'D', position_in_group: 3, is_qualified: true },
  { id: '18181818-1818-1818-1818-181818181818', name: 'Clasificado 29', flag_url: null, group_name: 'E', position_in_group: 3, is_qualified: true },
  { id: '28282828-2828-2828-2828-282828282828', name: 'Clasificado 30', flag_url: null, group_name: 'F', position_in_group: 3, is_qualified: true },
  { id: '38383838-3838-3838-3838-383838383838', name: 'Clasificado 31', flag_url: null, group_name: 'G', position_in_group: 3, is_qualified: true },
  { id: '48484848-4848-4848-4848-484848484848', name: 'Clasificado 32', flag_url: null, group_name: 'H', position_in_group: 3, is_qualified: true }
];

const SEED_MATCHES = [
  // Final and Third Place
  { id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', round: 'final', match_datetime: '2026-07-19T18:00:00Z', deadline: '2026-07-19T17:00:00Z', next_match_id: null, team1_id: null, team2_id: null },
  { id: '33333333-3333-3333-3333-333333333333', round: 'third_place', match_datetime: '2026-07-18T18:00:00Z', deadline: '2026-07-18T17:00:00Z', next_match_id: null, team1_id: null, team2_id: null },

  // Semis
  { id: '04040404-0404-0404-0404-040404040401', round: 'semi', match_datetime: '2026-07-14T20:00:00Z', deadline: '2026-07-14T19:00:00Z', next_match_id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', team1_id: null, team2_id: null },
  { id: '04040404-0404-0404-0404-040404040402', round: 'semi', match_datetime: '2026-07-15T20:00:00Z', deadline: '2026-07-15T19:00:00Z', next_match_id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', team1_id: null, team2_id: null },

  // Quarters
  { id: '08080808-0808-0808-0808-080808080801', round: 'quarter', match_datetime: '2026-07-09T18:00:00Z', deadline: '2026-07-09T17:00:00Z', next_match_id: '04040404-0404-0404-0404-040404040401', team1_id: null, team2_id: null },
  { id: '08080808-0808-0808-0808-080808080802', round: 'quarter', match_datetime: '2026-07-10T18:00:00Z', deadline: '2026-07-10T17:00:00Z', next_match_id: '04040404-0404-0404-0404-040404040401', team1_id: null, team2_id: null },
  { id: '08080808-0808-0808-0808-080808080803', round: 'quarter', match_datetime: '2026-07-10T21:00:00Z', deadline: '2026-07-10T20:00:00Z', next_match_id: '04040404-0404-0404-0404-040404040402', team1_id: null, team2_id: null },
  { id: '08080808-0808-0808-0808-080808080804', round: 'quarter', match_datetime: '2026-07-11T18:00:00Z', deadline: '2026-07-11T17:00:00Z', next_match_id: '04040404-0404-0404-0404-040404040402', team1_id: null, team2_id: null },

  // Round of 16
  { id: '16161616-1616-1616-1616-161616161601', round: 'round_16', match_datetime: '2026-07-04T17:00:00Z', deadline: '2026-07-04T16:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080801', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161602', round: 'round_16', match_datetime: '2026-07-04T21:00:00Z', deadline: '2026-07-04T20:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080801', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161603', round: 'round_16', match_datetime: '2026-07-05T17:00:00Z', deadline: '2026-07-05T16:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080803', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161604', round: 'round_16', match_datetime: '2026-07-05T21:00:00Z', deadline: '2026-07-05T20:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080803', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161605', round: 'round_16', match_datetime: '2026-07-06T17:00:00Z', deadline: '2026-07-06T16:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080802', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161606', round: 'round_16', match_datetime: '2026-07-06T21:00:00Z', deadline: '2026-07-06T20:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080802', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161607', round: 'round_16', match_datetime: '2026-07-07T17:00:00Z', deadline: '2026-07-07T16:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080804', team1_id: null, team2_id: null },
  { id: '16161616-1616-1616-1616-161616161608', round: 'round_16', match_datetime: '2026-07-07T21:00:00Z', deadline: '2026-07-07T20:00:00Z', next_match_id: '08080808-0808-0808-0808-080808080804', team1_id: null, team2_id: null },

  // Round of 32
  { id: '32323232-3232-3232-3232-323232323201', round: 'round_32', team1_id: 'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4', team2_id: '19191919-1919-1919-1919-191919191919', next_match_id: '16161616-1616-1616-1616-161616161601', match_datetime: '2026-06-28T16:00:00Z', deadline: '2026-06-28T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323202', round: 'round_32', team1_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', team2_id: '29292929-2929-2929-2929-292929292929', next_match_id: '16161616-1616-1616-1616-161616161601', match_datetime: '2026-06-28T20:00:00Z', deadline: '2026-06-28T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323203', round: 'round_32', team1_id: 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', team2_id: '39393939-3939-3939-3939-393939393939', next_match_id: '16161616-1616-1616-1616-161616161602', match_datetime: '2026-06-29T16:00:00Z', deadline: '2026-06-29T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323204', round: 'round_32', team1_id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', team2_id: '49494949-4949-4949-4949-494949494949', next_match_id: '16161616-1616-1616-1616-161616161602', match_datetime: '2026-06-29T20:00:00Z', deadline: '2026-06-29T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323205', round: 'round_32', team1_id: 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', team2_id: '18181818-1818-1818-1818-181818181818', next_match_id: '16161616-1616-1616-1616-161616161603', match_datetime: '2026-06-30T16:00:00Z', deadline: '2026-06-30T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323206', round: 'round_32', team1_id: 'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3', team2_id: '28282828-2828-2828-2828-282828282828', next_match_id: '16161616-1616-1616-1616-161616161603', match_datetime: '2026-06-30T20:00:00Z', deadline: '2026-06-30T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323207', round: 'round_32', team1_id: 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', team2_id: '38383838-3838-3838-3838-383838383838', next_match_id: '16161616-1616-1616-1616-161616161604', match_datetime: '2026-07-01T16:00:00Z', deadline: '2026-07-01T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323208', round: 'round_32', team1_id: 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', team2_id: '48484848-4848-4848-4848-484848484848', next_match_id: '16161616-1616-1616-1616-161616161604', match_datetime: '2026-07-01T20:00:00Z', deadline: '2026-07-01T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323209', round: 'round_32', team1_id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', team2_id: 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', next_match_id: '16161616-1616-1616-1616-161616161605', match_datetime: '2026-07-02T16:00:00Z', deadline: '2026-07-02T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323210', round: 'round_32', team1_id: 'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', team2_id: 'b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4', next_match_id: '16161616-1616-1616-1616-161616161605', match_datetime: '2026-07-02T20:00:00Z', deadline: '2026-07-02T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323211', round: 'round_32', team1_id: 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', team2_id: 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', next_match_id: '16161616-1616-1616-1616-161616161606', match_datetime: '2026-07-03T16:00:00Z', deadline: '2026-07-03T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323212', round: 'round_32', team1_id: 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', team2_id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', next_match_id: '16161616-1616-1616-1616-161616161606', match_datetime: '2026-07-03T20:00:00Z', deadline: '2026-07-03T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323213', round: 'round_32', team1_id: 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', team2_id: 'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', next_match_id: '16161616-1616-1616-1616-161616161607', match_datetime: '2026-07-04T16:00:00Z', deadline: '2026-07-04T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323214', round: 'round_32', team1_id: 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', team2_id: 'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', next_match_id: '16161616-1616-1616-1616-161616161607', match_datetime: '2026-07-04T20:00:00Z', deadline: '2026-07-04T19:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323215', round: 'round_32', team1_id: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', team2_id: 'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', next_match_id: '16161616-1616-1616-1616-161616161608', match_datetime: '2026-07-05T16:00:00Z', deadline: '2026-07-05T15:00:00Z' },
  { id: '32323232-3232-3232-3232-323232323216', round: 'round_32', team1_id: 'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', team2_id: 'f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', next_match_id: '16161616-1616-1616-1616-161616161608', match_datetime: '2026-07-05T20:00:00Z', deadline: '2026-07-05T19:00:00Z' }
];

async function run() {
  const email = "colaborador@synaptica.co";
  const password = "Colaborador2026!";
  
  console.log(`[seed-db] 1. Signing up user ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: "colaborador",
        team_name: "Los Galácticos",
        is_admin: false // Start as a normal user as requested!
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      console.log("[seed-db] User already registered. Proceeding to log in...");
    } else {
      console.error("[seed-db] Signup failed:", signUpError.message);
      process.exit(1);
    }
  } else {
    console.log("[seed-db] Signup successful!");
  }

  console.log("[seed-db] 2. Logging in...");
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("[seed-db] Login failed:", signInError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  const userClient = createClient(supabaseUrl, supabaseKey, {
    headers: {
      Authorization: `Bearer ${authData.session.access_token}`
    }
  });

  console.log(`[seed-db] 3. Temporarily granting is_admin=true to profile ${userId}...`);
  // Update profiles row directly through the client (since user owns their row, RLS allows this!)
  const { error: profileError } = await userClient
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', userId);

  if (profileError) {
    console.error("[seed-db] Error promoting user to admin:", profileError.message);
    process.exit(1);
  }
  console.log("[seed-db] Promoted successfully!");

  // Create a new client to make sure session updates is_admin
  const adminClient = createClient(supabaseUrl, supabaseKey, {
    headers: {
      Authorization: `Bearer ${authData.session.access_token}`
    }
  });

  console.log("[seed-db] 4. Seeding teams...");
  const { error: teamsError } = await adminClient
    .from('teams')
    .upsert(SEED_TEAMS);

  if (teamsError) {
    console.error("[seed-db] Seeding teams failed:", teamsError.message);
    // Demote before exiting
    await userClient.from('profiles').update({ is_admin: false }).eq('id', userId);
    process.exit(1);
  }
  console.log(`[seed-db] Seeded ${SEED_TEAMS.length} teams.`);

  console.log("[seed-db] 5. Seeding matches...");
  const { error: matchesError } = await adminClient
    .from('matches')
    .upsert(SEED_MATCHES);

  if (matchesError) {
    console.error("[seed-db] Seeding matches failed:", matchesError.message);
    // Demote before exiting
    await userClient.from('profiles').update({ is_admin: false }).eq('id', userId);
    process.exit(1);
  }
  console.log(`[seed-db] Seeded ${SEED_MATCHES.length} matches.`);

  console.log("[seed-db] 6. Demoting user back to normal user (is_admin=false)...");
  const { error: demoteError } = await userClient
    .from('profiles')
    .update({ is_admin: false })
    .eq('id', userId);

  if (demoteError) {
    console.error("[seed-db] Demotion failed:", demoteError.message);
    process.exit(1);
  }
  console.log("[seed-db] Demoted user back to normal successfully!");
  console.log("[seed-db] Database seeding complete and user accounts initialized!");
}

run();
