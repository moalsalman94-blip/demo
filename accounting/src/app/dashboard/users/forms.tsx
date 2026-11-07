"use client";
import { useActionState, useState } from "react";
import { createUserAction, resetUserPasswordAction } from "./actions";
import { FormAlert, SubmitButton } from "@/components/forms";

export function NewUserForm() {
  const [state, action] = useActionState(createUserAction, undefined);
  const d = state?.error ? state.data ?? {} : {};
  return (
    <form action={action} key={state?.ok}>
      <FormAlert state={state} />
      <div className="form-row">
        <div className="field"><label>الاسم الكامل</label><input name="fullName" className="input" defaultValue={d.fullName} required /></div>
        <div className="field"><label>اسم المستخدم (إنجليزي)</label><input name="username" className="input ltr" defaultValue={d.username} required autoCapitalize="none" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>كلمة السر</label><input name="password" className="input ltr" required minLength={8} autoComplete="new-password" /></div>
        <div className="field">
          <label>الدور</label>
          <select name="role" className="input" defaultValue={d.role ?? "ACCOUNTANT"}>
            <option value="ACCOUNTANT">محاسب</option><option value="VIEWER">مشاهد</option><option value="OWNER">مدير</option>
          </select>
        </div>
      </div>
      <SubmitButton>إضافة المستخدم</SubmitButton>
    </form>
  );
}

export function ResetForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(resetUserPasswordAction, undefined);
  if (!open) return <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>كلمة السر</button>;
  return (
    <form action={action} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={id} />
      <input name="password" className="input ltr" placeholder="كلمة سر جديدة" required minLength={8} style={{ padding: "5px 10px", width: 160 }} />
      <SubmitButton className="btn btn-primary btn-sm" pending="...">حفظ</SubmitButton>
      {state?.error && <span className="small" style={{ color: "var(--danger)" }}>{state.error}</span>}
      {state?.ok && <span className="small" style={{ color: "var(--ok)" }}>✔</span>}
    </form>
  );
}
