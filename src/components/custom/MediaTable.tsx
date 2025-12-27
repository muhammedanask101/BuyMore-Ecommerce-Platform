'use client';

import Image from 'next/image';
import { useState } from 'react';

type MediaRow = {
  _id: string;
  url: string;
  ownerType: string;
  ownerId: string;
  resourceType: string;
  format: string;
  isPrimary: boolean;
  createdAt: string;
};

export default function MediaTable({ media }: { media: MediaRow[] }) {
  const [rows, setRows] = useState(media);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this media permanently?')) return;

    setDeleting(id);

    const res = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      alert('Failed to delete media');
      setDeleting(null);
      return;
    }

    setRows((prev) => prev.filter((m) => m._id !== id));
    setDeleting(null);
  }

  return (
    <div className="border-4 border-black bg-white overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="border-b-4 border-black">
          <tr>
            <th className="p-3 text-left">Preview</th>
            <th className="p-3">Type</th>
            <th className="p-3">Owner</th>
            <th className="p-3">Primary</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((m) => (
            <tr key={m._id} className="border-b-2 border-black align-middle">
              <td className="p-3">
                <div className="flex justify-center">
                  <div className="relative w-20 h-20 border-2 border-black bg-neutral-100">
                    <Image src={m.url} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                </div>
              </td>

              <td className="p-3 text-center">
                {m.resourceType}/{m.format}
              </td>

              <td className="p-3 text-center">{m.ownerType}</td>

              <td className="p-3 text-center">{m.isPrimary ? '✔' : '—'}</td>

              <td className="p-3 text-center">
                <button
                  onClick={() => handleDelete(m._id)}
                  disabled={deleting === m._id}
                  className="
                    border-2 border-black
                    px-3 py-1
                    text-sm
                    font-bold
                    bg-white
                    hover:bg-black hover:text-white
                    disabled:opacity-50
                  "
                >
                  {deleting === m._id ? 'Deleting…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center opacity-60">
                No media found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
