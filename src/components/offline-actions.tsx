"use client";

export function OfflineActions() {
  return (
    <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
      <button
        type="button"
        className="primary-action"
        onClick={() => window.location.reload()}
      >
        Coba lagi
      </button>
      <button
        type="button"
        className="secondary-action"
        onClick={() => window.history.back()}
      >
        Kembali
      </button>
    </div>
  );
}
