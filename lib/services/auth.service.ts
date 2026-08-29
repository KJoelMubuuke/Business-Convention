import { createClient } from "../supabase/server";
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
  password: string
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: email.split("@")[0],
      },
    },
  });
  if (error) return { error: error.message };
  // Email confirmation required — session will be null until confirmed
  if (data.user && !data.session) {
    return {
      ok: "Account created! Check your email and click the confirmation link to activate your account.",
    };
  }
  return null;
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
