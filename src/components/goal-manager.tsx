"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { GoalProgress, GoalType } from "@/src/domain/entities/progress";

const goalMeta: Record<GoalType, { label: string; description: string; unit: string; periodType: "WEEKLY" | "ONGOING"; defaultTarget: number; step: number }> = {
  WEEKLY_WORKOUTS: {
    label: "Latihan mingguan",
    description: "Jumlah sesi gym atau lari setiap minggu.",
    unit: "sesi",
    periodType: "WEEKLY",
    defaultTarget: 4,
    step: 1,
  },
  WEEKLY_RUNNING_DISTANCE: {
    label: "Jarak lari mingguan",
    description: "Akumulasi kilometer lari setiap minggu.",
    unit: "km",
    periodType: "WEEKLY",
    defaultTarget: 15,
    step: 0.5,
  },
  TARGET_WEIGHT: {
    label: "Target berat badan",
    description: "Berat tujuan untuk fase naik atau turun berat.",
    unit: "kg",
    periodType: "ONGOING",
    defaultTarget: 65,
    step: 0.1,
  },
};

export function GoalManager({ progress }: { progress: GoalProgress[] }) {
  const router = useRouter();
  const [type, setType] = useState<GoalType>("WEEKLY_WORKOUTS");
  const [target, setTarget] = useState(goalMeta.WEEKLY_WORKOUTS.defaultTarget);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeProgress = useMemo(() => progress.filter((item) => item.goal.isActive), [progress]);

  function changeType(nextType: GoalType) {
    setType(nextType);
    setTarget(goalMeta[nextType].defaultTarget);
  }

  async function createGoal() {
    setBusy("create");
    setError(null);
    const meta = goalMeta[type];
    try {
      const response = await fetch("/api/v1/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType: type,
          targetValue: Number(target),
          unit: meta.unit,
          periodType: meta.periodType,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: null,
          isActive: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Target belum berhasil disimpan.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(null);
    }
  }

  async function setGoalActive(item: GoalProgress, isActive: boolean) {
    setBusy(item.goal.id);
    setError(null);
    try {
      const response = await fetch(`/api/v1/goals/${item.goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType: item.goal.goalType,
          targetValue: item.goal.targetValue,
          unit: item.goal.unit,
          periodType: item.goal.periodType,
          startDate: item.goal.startDate,
          endDate: item.goal.endDate,
          isActive,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Status target belum berhasil diubah.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(null);
    }
  }

  async function removeGoal(item: GoalProgress) {
    if (!window.confirm("Hapus target ini dari riwayat?")) return;
    setBusy(item.goal.id);
    setError(null);
    try {
      const response = await fetch(`/api/v1/goals/${item.goal.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Target belum berhasil dihapus.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {activeProgress.length > 0 ? (
        <div className="goal-grid">
          {activeProgress.map((item) => {
            const meta = goalMeta[item.goal.goalType];
            return (
              <article key={item.goal.id} className="goal-card">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="eyebrow">{item.status === "ACHIEVED" ? "Target tercapai" : "Target aktif"}</p><h3>{meta.label}</h3></div>
                  <span className={`goal-status goal-status-${item.status.toLowerCase()}`}>{item.progressPercent}%</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{meta.description}</p>
                <div className="goal-numbers"><strong>{item.currentValue == null ? "—" : item.currentValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</strong><span>/ {item.goal.targetValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {item.goal.unit}</span></div>
                <div className="goal-track"><span style={{ width: `${item.progressPercent}%` }} /></div>
                <p className="mt-3 text-xs font-bold text-[var(--muted)]">{item.status === "ACHIEVED" ? "Mantap. Target ini sudah tercapai." : item.remainingValue == null ? "Tambahkan pengukuran untuk memulai." : `Tersisa ${item.remainingValue.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${item.goal.unit}.`}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="goal-action" disabled={busy === item.goal.id} onClick={() => setGoalActive(item, false)}>Nonaktifkan</button>
                  <button type="button" className="goal-action goal-action-danger" disabled={busy === item.goal.id} onClick={() => removeGoal(item)}>Hapus</button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="goal-empty"><span>◎</span><div><h3>Belum ada target aktif</h3><p>Pilih satu target sederhana yang realistis untuk mulai membangun arah.</p></div></div>
      )}

      <section className="form-card">
        <div className="section-heading"><span>＋</span><div><h2>Buat atau ganti target</h2><p>Target baru dengan kategori sama akan menggantikan target aktif sebelumnya.</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Jenis target</span><select value={type} onChange={(event) => changeType(event.target.value as GoalType)}><option value="WEEKLY_WORKOUTS">Latihan mingguan</option><option value="WEEKLY_RUNNING_DISTANCE">Jarak lari mingguan</option><option value="TARGET_WEIGHT">Target berat badan</option></select></label>
          <label className="field"><span>Nilai target ({goalMeta[type].unit})</span><input type="number" min={type === "WEEKLY_WORKOUTS" ? 1 : type === "WEEKLY_RUNNING_DISTANCE" ? 0.5 : 25} max={type === "WEEKLY_WORKOUTS" ? 21 : type === "WEEKLY_RUNNING_DISTANCE" ? 500 : 400} step={goalMeta[type].step} value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>
        </div>
        <button type="button" className="primary-action mt-4" onClick={createGoal} disabled={busy === "create"}>{busy === "create" ? "Menyimpan..." : "Aktifkan target"}</button>
      </section>

      {error && <div className="error-banner" role="alert">{error}</div>}
    </div>
  );
}
