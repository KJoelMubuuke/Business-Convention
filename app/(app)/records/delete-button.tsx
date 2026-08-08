"use client";

import { deleteAttendee } from "../actions";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteAttendee} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-red-500 hover:text-red-400 text-xs transition-colors"
        onClick={(e) => {
          if (!confirm(`Delete ${name}?`)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
