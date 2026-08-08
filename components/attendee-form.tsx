"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveAttendee } from "../app/(app)/actions";
import type { Attendee, Convention, Lookups } from "../lib/types";
import { money } from "../lib/format";

const inputCls =
  "w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm";
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

export default function AttendeeForm({
  lookups,
  convention,
  existing,
}: {
  lookups: Lookups;
  convention: Convention;
  existing?: Attendee;
}) {
  const [state, action, pending] = useActionState(saveAttendee, null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [residency, setResidency] = useState<string>(existing?.residency ?? "");
  const fee =
    residency === "Resident"
      ? convention.fee_resident
      : residency === "Non-Resident"
      ? convention.fee_non_resident
      : null;

  useEffect(() => {
    if (state?.ok && !existing) {
      formRef.current?.reset();
      setResidency("");
      nameRef.current?.focus();
    }
  }, [state, existing]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      {existing && <input type="hidden" name="id" value={existing.id} />}

      {/* Datalists for autocomplete */}
      <datalist id="dl-district">
        {lookups.district.map((v) => <option key={v} value={v} />)}
      </datalist>
      <datalist id="dl-church">
        {lookups.church.map((v) => <option key={v} value={v} />)}
      </datalist>
      <datalist id="dl-occupation">
        {lookups.occupation.map((v) => <option key={v} value={v} />)}
      </datalist>

      {/* Full name */}
      <div>
        <label className={labelCls}>Full Name <span className="text-orange-500">*</span></label>
        <input
          ref={nameRef}
          name="full_name"
          required
          autoComplete="off"
          defaultValue={existing?.full_name}
          placeholder="e.g. John Doe"
          className={inputCls}
        />
      </div>

      {/* Occupation + District */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Occupation / Title</label>
          <input
            name="occupation"
            list="dl-occupation"
            autoComplete="off"
            defaultValue={existing?.occupation}
            placeholder="e.g. Pastor, Teacher…"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>District <span className="text-orange-500">*</span></label>
          <input
            name="district"
            list="dl-district"
            required
            autoComplete="off"
            defaultValue={existing?.district}
            placeholder="Type to search…"
            className={inputCls}
          />
        </div>
      </div>

      {/* Church */}
      <div>
        <label className={labelCls}>Church <span className="text-orange-500">*</span></label>
        <input
          name="church"
          list="dl-church"
          required
          autoComplete="off"
          defaultValue={existing?.church}
          placeholder="Type to search…"
          className={inputCls}
        />
      </div>

      {/* Gender + Residency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Gender <span className="text-orange-500">*</span></label>
          <select
            name="gender"
            required
            defaultValue={existing?.gender ?? ""}
            className={inputCls}
          >
            <option value="" disabled>Choose…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Residency <span className="text-orange-500">*</span></label>
          <select
            name="residency"
            required
            value={residency}
            onChange={(e) => setResidency(e.target.value)}
            className={inputCls}
          >
            <option value="" disabled>Choose…</option>
            <option value="Resident">Resident — {money(convention.fee_resident)}</option>
            <option value="Non-Resident">Non-Resident — {money(convention.fee_non_resident)}</option>
          </select>
        </div>
      </div>

      {/* Amount paid + Payment method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Amount Paid (UGX)
            {fee !== null && (
              <span className="ml-2 text-orange-500 font-normal text-xs">
                Fee: {money(fee)}
              </span>
            )}
          </label>
          <input
            name="amount_paid"
            type="number"
            min="0"
            step="1000"
            inputMode="numeric"
            defaultValue={existing?.amount_paid ?? (fee ?? 0)}
            key={fee ?? "default"}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Payment Method <span className="text-orange-500">*</span></label>
          <select
            name="payment_method"
            defaultValue={existing?.payment_method ?? "Cash"}
            className={inputCls}
          >
            <option value="Cash">Cash</option>
            <option value="MoMo">Mobile Money (MoMo)</option>
            <option value="Bank">Bank Transfer</option>
            <option value="Waived">Waived</option>
          </select>
        </div>
      </div>

      {/* Phone + Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone</label>
          <input
            name="phone"
            inputMode="tel"
            defaultValue={existing?.phone}
            placeholder="e.g. 0772 123 456"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <input
            name="notes"
            defaultValue={existing?.notes}
            placeholder="Any remarks…"
            className={inputCls}
          />
        </div>
      </div>

      {/* Allow duplicate */}
      {!existing && (
        <label className="flex items-center gap-2.5 text-sm text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            name="allow_duplicate"
            value="yes"
            className="w-4 h-4 rounded accent-amber-400"
          />
          Allow duplicate name for this church
        </label>
      )}

      {/* Feedback */}
      {state?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">
          {state.ok}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 font-semibold text-white hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 text-sm"
      >
        {pending ? "Saving…" : existing ? "Update Record" : "Register Attendee"}
      </button>
    </form>
  );
}
