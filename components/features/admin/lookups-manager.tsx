"use client";

import { useActionState } from "react";
import { addLookup, deleteLookup } from "../../../app/(app)/actions/lookup.actions";
import type { Lookup, LookupCategory } from "../../../lib/types";

type State = { error?: string; ok?: string } | null;

const CATEGORIES: LookupCategory[] = ["district", "church", "occupation"];

export default function LookupsManager({ lookups }: { lookups: Lookup[] }) {
  const [addState, addAction, addPending] = useActionState(addLookup, null);

  const byCategory = (cat: LookupCategory) =>
    lookups.filter((l) => l.category === cat);

  return (
    <div className="space-y-8">
      {/* Add form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Add New Value</h2>
        <form action={addAction} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              name="category"
              className="w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Value</label>
            <input
              name="value"
              placeholder="e.g. Kampala, Makerere Full Gospel…"
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          {addState?.error && (
            <p className="text-sm text-red-400">{addState.error}</p>
          )}
          {addState?.ok && (
            <p className="text-sm text-emerald-400">{addState.ok}</p>
          )}
          <button
            disabled={addPending}
            className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 py-2.5 font-semibold text-slate-900 text-sm transition-colors"
          >
            {addPending ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      {/* Lists by category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const items = byCategory(cat);
          return (
            <div key={cat} className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 capitalize">
                {cat}s
                <span className="ml-2 text-slate-600 font-normal text-xs">
                  ({items.length})
                </span>
              </h3>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 group transition-colors"
                  >
                    <span className="text-sm text-slate-700">{item.value}</span>
                    <form action={deleteLookup}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="text-red-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ✕
                      </button>
                    </form>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-slate-600 italic">No {cat}s added yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
