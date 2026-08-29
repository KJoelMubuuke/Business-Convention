"use server";

import { redirect } from "next/navigation";
import { clean } from "../../../lib/format";
import { signIn, signUp, signOut as signOutService, sendPasswordReset } from "../../../lib/services/auth.service";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Thin Next.js Server Action wrappers for authentication operations.
 */

export async function login(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const email = clean(fd.get("email"));
  const password = clean(fd.get("password"));
  const result = await signIn(email, password);
  if (result?.error) return result;
  redirect("/");
}

export async function signup(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const email = clean(fd.get("email"));
  const password = clean(fd.get("password"));
  const fullName = clean(fd.get("full_name")) ?? "";
  const result = await signUp(email, password, fullName);
  if (result?.error) return result;
  if (result?.ok) return result; // account created — user must sign in manually
  redirect("/");
}

export async function logout(): Promise<void> {
  await signOutService();
  redirect("/login");
}

export async function forgotPassword(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  return await sendPasswordReset(fd);
}
