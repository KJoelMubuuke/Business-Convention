"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export function QrScanner({
  onScan,
  onClose,
}: {
  onScan: (text: string) => void;
  onClose: () => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scanned = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (!scanned.current) {
            scanned.current = true;
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
            onScan(decodedText);
          }
        },
        (_error) => {
          // Ignore failed scans (happens every frame when no QR is visible)
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-md flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#c6c6cd]">
          <h3 className="font-semibold text-lg text-[#0b1c30]">Scan Attendee Badge</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 text-[#76777d] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4 flex flex-col items-center bg-[#f8f9ff]">
          <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden border-2 border-[#005596]/20 bg-black min-h-[300px]"
          ></div>
          <p className="mt-4 text-sm text-[#45464d] text-center">
            Point your camera at the QR code on the attendee's physical card to check them in
            automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
