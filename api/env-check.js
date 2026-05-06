module.exports = function handler(req, res) {
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return res.status(200).json({
    ok: true,
    message: "Vercel environment variables check",
    env: {
      SUPABASE_URL: hasSupabaseUrl ? "OK" : "MISSING",
      SUPABASE_ANON_KEY: hasAnonKey ? "OK" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: hasServiceRoleKey ? "OK" : "MISSING"
    }
  });
};