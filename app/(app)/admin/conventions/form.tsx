"use client";

import { useActionState } from "react";

const inputCls = "w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm";
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

type ActionState = { error?: string; ok?: string } | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ConventionForm({ action }: { action: any }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelCls}>Title</label>
        <input name="title" required placeholder="e.g. 13th Business Convention 2027" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Year</label>
        <input name="year" type="number" required min={2024} max={2100} placeholder="e.g. 2027" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Resident Fee (UGX)</label>
        <input name="fee_resident" type="number" required min={0} step={1000} defaultValue={40000} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Non-Resident Fee (UGX)</label>
        <input name="fee_non_resident" type="number" required min={0} step={1000} defaultValue={30000} className={inputCls} />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">{state.ok}</p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Convention"}
      </button>
    </form>
  );
}
