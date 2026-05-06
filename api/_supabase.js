// api/_supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://atqcxiipzhghwoprqljp.supabase.co;
const serviceRoleKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0cWN4aWlwemhnaHdvcHJxbGpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQzODM0MiwiZXhwIjoyMDkzMDE0MzQyfQ.Gyaa3_iUHLD0hVUVVOd8DR1ddPA8651OEELgnkTiJiE;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});