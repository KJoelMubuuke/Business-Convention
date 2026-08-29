import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import { clean } from "../format";
import { getSiteOrigin } from "../site-url";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Application service wrapping Supabase authentication operations.
 */

export async function signIn(
  email: string,
  password: string
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return null;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<ActionState> {
  const adminClient = createAdminClient();

  // Use the admin API to create the user with email already confirmed.
  // This means they can log in immediately — no confirmation email needed.
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || email.split("@")[0] },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Failed to create account. Please try again." };

  return { ok: "Account created successfully! You can now sign in." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function sendPasswordReset(fd: FormData): Promise<ActionState> {
  const email = clean(fd.get("email"));
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteOrigin()}/reset-password`,
  });

  if (error) return { error: error.message };
  return { ok: "Password reset email sent! Check your inbox." };
}
