"use client";

import { useActionState } from "react";
import { deleteUser } from "../../../app/(app)/actions/attendee.actions";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(deleteUser as any, null);

  return (
    <form action={action} onSubmit={(e) => {
      if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) {
        e.preventDefault();
      }
    }}>
      <input type="hidden" name="id" value={userId} />
      <button 
        type="submit" 
        disabled={pending}
        className="rounded-lg bg-[#fff0f0] border border-[#ffcccc] hover:bg-[#ffe5e5] text-[#cc0000] px-2 h-10 transition-colors flex-shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
        title="Delete User"
      >
        <span className="material-symbols-outlined text-[20px]">
          {pending ? "hourglass_empty" : "delete"}
        </span>
      </button>
    </form>
  );
}
