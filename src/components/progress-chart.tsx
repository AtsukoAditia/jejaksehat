import type { BodyMeasurement } from "@/src/domain/entities/progress";
import { buildSparklinePoints } from "@/src/lib/progress-metrics";

interface ProgressChartProps {
  measurements: BodyMeasurement[];
  metric: "weightKg" | "bodyFatPercent" | "waistCm";
  label: string;
  unit: string;
  tone: "green" | "teal" | "lime";
}

export function ProgressChart({ measurements, metric, label, unit, tone }: ProgressChartProps) {
  const data = [...measurements]
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
    .filter((item) => item[metric] != null)
    .slice(-12);
  const values = data.map((item) => Number(item[metric]));
  const points = buildSparklinePoints(values);
  const first = values[0];
  const latest = values.at(-1);

  return (
    <article className={`trend-card trend-${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div><p className="eyebrow">{label}</p><strong>{latest != null ? `${latest.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${unit}` : "Belum ada data"}</strong></div>
        {first != null && latest != null && data.length > 1 && (
          <span className="trend-delta">{latest - first > 0 ? "+" : ""}{(latest - first).toFixed(1)} {unit}</span>
        )}
      </div>
      {values.length > 1 ? (
        <svg viewBox="0 0 320 120" role="img" aria-label={`Grafik tren ${label}`} className="trend-svg">
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {points.split(" ").map((point, index) => {
            const [cx, cy] = point.split(",");
            return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index === values.length - 1 ? 6 : 3} fill="currentColor" />;
          })}
        </svg>
      ) : (
        <div className="trend-empty">Tambahkan minimal dua pengukuran untuk melihat tren.</div>
      )}
      <div className="mt-2 flex justify-between text-xs font-bold text-[var(--muted)]">
        <span>{data[0]?.measuredAt ?? "—"}</span><span>{data.at(-1)?.measuredAt ?? "—"}</span>
      </div>
    </article>
  );
}
