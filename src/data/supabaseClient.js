import { createClient } from "@supabase/supabase-js";

let client;

export function isSupabaseConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "The shared database is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the site."
    );
  }

  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return client;
}

export function getAdminLoginEmail() {
  const email = import.meta.env.VITE_ADMIN_LOGIN_EMAIL?.trim();
  if (!email) {
    throw new Error(
      "Admin sign-in is not configured. Set VITE_ADMIN_LOGIN_EMAIL to the administrator's Supabase Auth email."
    );
  }
  return email;
}

export function studentLoginEmail(studentId) {
  const id = String(studentId ?? "").trim();
  if (
    id.length > 64 ||
    !/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/.test(id)
  ) {
    throw new Error(
      "Student ID must use letters, numbers, underscores, or hyphens; dots cannot be consecutive or at either end."
    );
  }
  return `student-${id.toLowerCase()}@students.hums.invalid`;
}
