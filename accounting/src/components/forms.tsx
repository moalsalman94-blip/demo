"use client";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/form";

export function SubmitButton({
  children,
  className = "btn btn-gold",
  pending: pendingText = "جاري الحفظ...",
}: {
  children: React.ReactNode;
  className?: string;
  pending?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state?.error) return <div className="alert alert-error" role="alert">{state.error}</div>;
  if (state?.ok) return <div className="alert alert-ok" role="status">{state.ok}</div>;
  return null;
}
