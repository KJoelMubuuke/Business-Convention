"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export function QrBadge({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="View Badge QR"
        className="px-4 py-2 border border-[#005596] text-[#005596] rounded-lg hover:bg-[#e5eeff] transition-colors font-semibold text-sm flex items-center gap-2 h-10 w-full sm:w-auto justify-center xl:opacity-0 xl:group-hover:opacity-100 xl:focus-within:opacity-100"
      >
        <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
        Badge
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-sm flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#c6c6cd]">
              <h3 className="font-semibold text-lg text-[#0b1c30]">Attendee Badge</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 text-[#76777d] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 flex flex-col items-center bg-[#f8f9ff]">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cd]">
                <QRCode value={id} size={200} level="H" />
              </div>
              <h4 className="mt-6 font-bold text-xl text-[#0b1c30] text-center">{name}</h4>
              <p className="text-[#76777d] font-mono text-xs mt-2">{id}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
