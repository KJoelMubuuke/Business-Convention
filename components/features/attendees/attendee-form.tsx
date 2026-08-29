"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveAttendee } from "../../../app/(app)/actions/attendee.actions";
import type { Attendee, Convention, Lookups } from "../../../lib/types";
import { money } from "../../../lib/format";

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

  const [isResident, setIsResident] = useState<boolean>(
    existing ? existing.residency === "Resident" : true
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    existing?.payment_method ?? ""
  );
  const [amountPaid, setAmountPaid] = useState<string>(
    existing?.amount_paid ? String(existing.amount_paid) : ""
  );

  const fee = isResident ? convention.fee_resident : convention.fee_non_resident;

  useEffect(() => {
    if (state?.ok && !existing) {
      formRef.current?.reset();
      setIsResident(true);
      setPaymentMethod("");
      setAmountPaid("");
      nameRef.current?.focus();
    }
  }, [state, existing]);

  // Derived styling logic for fee badge and validation
  let feeBadgeClass = "bg-[#d3e4fe] text-[#005596]";
  let feeBadgeText = isResident ? "Resident Rate" : "Standard Rate";

  if (paymentMethod === "Waived") {
    feeBadgeClass = "bg-[#ffebd6] text-[#ba1a1a]";
    feeBadgeText = "Fee Waived";
  } else if (!isResident) {
    feeBadgeClass = "bg-[#eff4ff] text-[#45464d]";
  }

  const numericAmount = Number(amountPaid);
  const isWaived = paymentMethod === "Waived";
  // Partial payments are allowed — no minimum enforcement
  const hasValidNumber = !isNaN(numericAmount) && amountPaid !== "";
  const balance = isWaived ? 0 : Math.max(0, fee - (hasValidNumber ? numericAmount : 0));
  const isFullyPaid = !isWaived && hasValidNumber && balance === 0;
  const isPartialPayment = !isWaived && hasValidNumber && balance > 0;
  // showSuccess = green tick when exact / overpaid, showHelper = amber hint when partial
  const showSuccess = isFullyPaid;
  const showHelper = isPartialPayment;

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {existing && <input type="hidden" name="id" value={existing.id} />}
      <input type="hidden" name="residency" value={isResident ? "Resident" : "Non-Resident"} />

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

      {/* ── Personal Details Section ── */}
      <div className="lg:col-span-7 space-y-4 bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm">
        <h3 className="text-lg font-semibold text-[#005596] flex items-center border-b border-[#c6c6cd] pb-2 mb-4">
          <span className="material-symbols-outlined mr-2 text-[#F15A24]">person</span>
          Personal Details
        </h3>

        <div>
          <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">
            Full Name <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#76777d]">badge</span>
            </span>
            <input
              ref={nameRef}
              name="full_name"
              required
              autoComplete="off"
              defaultValue={existing?.full_name}
              placeholder="e.g., Jane Doe"
              className="block w-full pl-10 pr-3 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">Occupation</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#76777d]">work</span>
            </span>
            <input
              name="occupation"
              list="dl-occupation"
              autoComplete="off"
              defaultValue={existing?.occupation}
              placeholder="e.g., Software Engineer"
              className="block w-full pl-10 pr-3 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">
              Gender <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="flex segmented-control relative h-10">
              <div className="flex-1 relative">
                <input
                  className="sr-only"
                  id="genderMale"
                  name="gender"
                  type="radio"
                  value="Male"
                  defaultChecked={existing?.gender === "Male" || !existing}
                />
                <label
                  className="block w-full h-full text-center py-2 text-sm border border-[#c6c6cd] rounded-l cursor-pointer bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#e5eeff] transition-colors"
                  htmlFor="genderMale"
                >
                  Male
                </label>
              </div>
              <div className="flex-1 relative -ml-[1px]">
                <input
                  className="sr-only"
                  id="genderFemale"
                  name="gender"
                  type="radio"
                  value="Female"
                  defaultChecked={existing?.gender === "Female"}
                />
                <label
                  className="block w-full h-full text-center py-2 text-sm border border-[#c6c6cd] rounded-r cursor-pointer bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#e5eeff] transition-colors"
                  htmlFor="genderFemale"
                >
                  Female
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">Residency Status</label>
            <div className="flex items-center h-10">
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  checked={isResident}
                  onChange={(e) => setIsResident(e.target.checked)}
                  type="checkbox"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 transition-transform duration-200"
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-[#c6c6cd] cursor-pointer transition-colors duration-200"></label>
              </div>
              <span className="text-sm text-[#0b1c30] font-medium">
                {isResident ? "Resident" : "Non-Resident"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">
              District <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#76777d]">location_city</span>
              </span>
              <input
                name="district"
                list="dl-district"
                required
                autoComplete="off"
                defaultValue={existing?.district}
                placeholder="Select or type..."
                className="block w-full pl-10 pr-3 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">
              Church / Organization <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#76777d]">church</span>
              </span>
              <input
                name="church"
                list="dl-church"
                required
                autoComplete="off"
                defaultValue={existing?.church}
                placeholder="Select or type..."
                className="block w-full pl-10 pr-3 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Phone + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">Phone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#76777d]">phone</span>
              </span>
              <input
                name="phone"
                inputMode="tel"
                defaultValue={existing?.phone}
                placeholder="e.g. 0772 123 456"
                className="block w-full pl-10 pr-3 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">Notes</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#76777d]">edit_note</span>
              </span>
              <input
                name="notes"
                defaultValue={existing?.notes}
                placeholder="Any remarks..."
                className="block w-full pl-10 pr-3 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Allow duplicate */}
        {!existing && (
          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm text-[#45464d] cursor-pointer">
              <input
                type="checkbox"
                name="allow_duplicate"
                value="yes"
                className="w-4 h-4 rounded text-[#F15A24] border-[#c6c6cd] focus:ring-[#F15A24]"
              />
              Allow duplicate name for this church
            </label>
          </div>
        )}
      </div>

      {/* ── Payment & Logistics Section ── */}
      <div className="lg:col-span-5 space-y-4 flex flex-col">
        {/* Registration Fee Card */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-[#c6c6cd] shadow-sm relative overflow-hidden group hover:-translate-y-[2px] transition-transform duration-200 flex-shrink-0">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <span
              className="material-symbols-outlined text-[100px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              payments
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#005596] flex items-center border-b border-[#c6c6cd] pb-2 mb-4 relative z-10">
            <span className="material-symbols-outlined mr-2 text-[#F15A24]">receipt_long</span>
            Registration Fee
          </h3>
          <div className="relative z-10">
            <p className="text-xs font-bold text-[#45464d] uppercase mb-1 tracking-wider">
              Required Amount (UGX)
            </p>
            <div className="flex items-end">
              <span className="text-5xl font-bold text-[#005596] tracking-tight">
                {fee.toLocaleString()}
              </span>
            </div>
            <div
              className={`inline-block mt-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${feeBadgeClass}`}
            >
              {feeBadgeText}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-[#c6c6cd] shadow-sm flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-[#005596] flex items-center border-b border-[#c6c6cd] pb-2 mb-4">
            <span className="material-symbols-outlined mr-2 text-[#F15A24]">account_balance_wallet</span>
            Payment Details
          </h3>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">
              Payment Method <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#76777d]">credit_card</span>
              </span>
              <select
                name="payment_method"
                required
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  if (e.target.value === "Waived") setAmountPaid("0");
                }}
                className="block w-full pl-10 pr-10 py-2 h-10 border border-[#c6c6cd] rounded bg-[#f8f9ff] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all text-sm appearance-none"
              >
                <option value="" disabled>Select Method</option>
                <option value="Cash">Cash</option>
                <option value="MoMo">Mobile Money (MoMo)</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Waived">Waived (Admin Only)</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <span className="material-symbols-outlined text-[#76777d]">expand_more</span>
              </span>
            </div>
          </div>

          <div className="mb-4 flex-grow">
            <label className="block text-xs font-bold text-[#45464d] uppercase mb-1">
              Amount Received (UGX) <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[#76777d] font-mono font-bold text-sm">UGX</span>
              </span>
              <input
                name="amount_paid"
                type="number"
                min="0"
                step="1000"
                required
                readOnly={isWaived}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0"
                className={`block w-full pl-12 pr-10 py-2 h-10 border rounded bg-[#f8f9ff] text-[#0b1c30] font-mono text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  showSuccess
                    ? "border-[#F15A24] focus:ring-[#F15A24]"
                    : showHelper
                    ? "border-amber-400 focus:ring-amber-400"
                    : "border-[#c6c6cd] focus:ring-[#F15A24]"
                }`}
              />
              {showSuccess && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#F15A24]">check_circle</span>
                </span>
              )}
              {showHelper && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-amber-500">pending</span>
                </span>
              )}
            </div>
            {showHelper && (
              <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-amber-500 text-[16px] flex-shrink-0">account_balance</span>
                <p className="text-xs font-semibold text-amber-700">
                  Balance outstanding: <span className="font-bold">UGX {balance.toLocaleString()}</span> — this will be recorded as a partial payment.
                </p>
              </div>
            )}
            {isFullyPaid && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-green-600 text-[16px] flex-shrink-0">check_circle</span>
                <p className="text-xs font-semibold text-green-700">Fully paid — no balance outstanding.</p>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {state?.error && (
            <div className="mb-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 px-3 py-2 text-sm text-[#93000a]">
              {state.error}
            </div>
          )}
          {state?.ok && (
            <div className="mb-4 rounded-lg bg-[#eaf1ff] border border-[#005596]/20 px-3 py-2 text-sm text-[#005596] font-medium">
              {state.ok}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#005596] hover:bg-[#00437a] text-white font-semibold text-lg py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            <span className="material-symbols-outlined mr-2">how_to_reg</span>
            {pending ? "Saving..." : existing ? "Update Registration" : "Register Attendee"}
          </button>
        </div>
      </div>
    </form>
  );
}
