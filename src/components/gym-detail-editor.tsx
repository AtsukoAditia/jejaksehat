"use client";

import { useState } from "react";

/** Individual set — editable inline */
export interface SetDraft {
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe: number;
  completed: boolean;
}

/** Single exercise with its sets */
export interface ExerciseDraft {
  exerciseName: string;
  muscleGroup: string;
  sets: SetDraft[];
}

const muscleGroups = [
  "Dada",
  "Punggung",
  "Kaki",
  "Bahu",
  "Lengan",
  "Core",
  "Full Body",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function makeSet(n: number): SetDraft {
  return { setNumber: n, reps: 10, weightKg: 0, rpe: 7, completed: true };
}

function renumber(sets: SetDraft[]): SetDraft[] {
  return sets.map((s, i) => ({ ...s, setNumber: i + 1 }));
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function SetRow({
  set,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  set: SetDraft;
  index: number;
  onChange: (idx: number, patch: Partial<SetDraft>) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-[#dcebb2] bg-white px-3 py-2 text-sm">
      <span className="w-8 text-center font-semibold text-[#4a7c10]">
        {set.setNumber}
      </span>
      <label className="field !mb-0">
        <span className="sr-only">Reps</span>
        <input
          type="number"
          min={1}
          max={200}
          value={set.reps}
          onChange={(e) =>
            onChange(index, { reps: Number(e.target.value) })
          }
          className="w-16"
          aria-label="Reps"
          placeholder="Reps"
        />
      </label>
      <label className="field !mb-0">
        <span className="sr-only">Beban kg</span>
        <input
          type="number"
          min={0}
          max={1000}
          step={0.25}
          value={set.weightKg}
          onChange={(e) =>
            onChange(index, { weightKg: Number(e.target.value) })
          }
          className="w-20"
          aria-label="Beban kg"
          placeholder="Kg"
        />
      </label>
      <label className="field !mb-0">
        <span className="sr-only">RPE</span>
        <input
          type="number"
          min={1}
          max={10}
          value={set.rpe}
          onChange={(e) =>
            onChange(index, { rpe: Number(e.target.value) })
          }
          className="w-14"
          aria-label="RPE"
          placeholder="RPE"
        />
      </label>
      <label className="field !mb-0 flex items-center gap-1">
        <input
          type="checkbox"
          checked={set.completed}
          onChange={(e) =>
            onChange(index, { completed: e.target.checked })
          }
          className="h-4 w-4 accent-[#16a34a]"
          aria-label="Selesai"
        />
        <span className="text-xs text-[#526900]">✓</span>
      </label>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100"
          aria-label={`Hapus set ${set.setNumber}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  exercise: ExerciseDraft;
  index: number;
  onChange: (idx: number, patch: Partial<ExerciseDraft>) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
}) {
  function updateSet(setIdx: number, patch: Partial<SetDraft>) {
    const updated = exercise.sets.map((s, i) =>
      i === setIdx ? { ...s, ...patch } : s,
    );
    onChange(index, { sets: updated });
  }

  function removeSet(setIdx: number) {
    onChange(index, { sets: renumber(exercise.sets.filter((_, i) => i !== setIdx)) });
  }

  function addSet() {
    onChange(index, {
      sets: [...exercise.sets, makeSet(exercise.sets.length + 1)],
    });
  }

  return (
    <div className="rounded-2xl border border-[#dcebb2] bg-[#f7fbe8] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <strong className="text-[#1a5c00]">
          Gerakan {index + 1}
        </strong>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100"
          >
            Hapus gerakan
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field">
          <span>Nama gerakan</span>
          <input
            value={exercise.exerciseName}
            onChange={(e) =>
              onChange(index, { exerciseName: e.target.value })
            }
            placeholder="Bench Press"
            required
          />
        </label>
        <label className="field">
          <span>Kelompok otot</span>
          <select
            value={exercise.muscleGroup}
            onChange={(e) =>
              onChange(index, { muscleGroup: e.target.value })
            }
          >
            {muscleGroups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Sets table header */}
      <div className="flex flex-wrap items-center gap-2 px-3 text-xs font-semibold text-[#526900]">
        <span className="w-8 text-center">#</span>
        <span className="w-16 text-center">Reps</span>
        <span className="w-20 text-center">Kg</span>
        <span className="w-14 text-center">RPE</span>
        <span className="w-8" />
        <span className="w-10" />
      </div>

      {/* Individual sets */}
      <div className="space-y-2">
        {exercise.sets.map((set, setIdx) => (
          <SetRow
            key={set.setNumber}
            set={set}
            index={setIdx}
            onChange={updateSet}
            onRemove={removeSet}
            canRemove={exercise.sets.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addSet}
        className="rounded-xl border border-dashed border-[#a3c660] bg-white px-3 py-2 text-xs font-bold text-[#4a7c10] hover:bg-[#eef6d8] w-full"
      >
        ＋ Tambah set
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                       */
/* ------------------------------------------------------------------ */

export interface GymDetailEditorProps {
  initialExercises: ExerciseDraft[];
  onChange: (exercises: ExerciseDraft[]) => void;
}

export function GymDetailEditor({
  initialExercises,
  onChange,
}: GymDetailEditorProps) {
  const [exercises, setExercises] =
    useState<ExerciseDraft[]>(initialExercises);

  function sync(updated: ExerciseDraft[]) {
    setExercises(updated);
    onChange(updated);
  }

  function updateExercise(idx: number, patch: Partial<ExerciseDraft>) {
    sync(exercises.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex)));
  }

  function removeExercise(idx: number) {
    sync(exercises.filter((_, i) => i !== idx));
  }

  function addExercise() {
    sync([
      ...exercises,
      {
        exerciseName: "",
        muscleGroup: "Full Body",
        sets: [makeSet(1)],
      },
    ]);
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise, idx) => (
        <ExerciseCard
          key={idx}
          exercise={exercise}
          index={idx}
          onChange={updateExercise}
          onRemove={removeExercise}
          canRemove={exercises.length > 1}
        />
      ))}

      <button
        type="button"
        onClick={addExercise}
        className="secondary-action w-full"
      >
        ＋ Tambah gerakan
      </button>
    </div>
  );
}