"use client";
import { useActionState } from "react";
import { adminResetPasswordAction, updateCompanyAction } from "../../../actions";
import { FormAlert, SubmitButton } from "@/components/forms";

type C = { id: string; name: string; phone: string; notes: string; maxUsers: number; expiresAt: string };

export function EditCompanyForm({ c }: { c: C }) {
  const [state, action] = useActionState(updateCompanyAction, undefined);
  return (
    <form action={action}>
      <FormAlert state={state} />
      <input type="hidden" name="id" value={c.id} />
      <div className="field"><label>اسم الشركة</label><input name="name" className="input" defaultValue={c.name} required /></div>
      <div className="form-row">
        <div className="field"><label>الهاتف</label><input name="phone" className="input ltr" defaultValue={c.phone} /></div>
        <div className="field"><label>أقصى عدد مستخدمين</label><input name="maxUsers" type="number" min={1} max={500} className="input" defaultValue={c.maxUsers} /></div>
      </div>
      <div className="field"><label>تاريخ انتهاء الاشتراك</label><input name="expiresAt" type="date" className="input" defaultValue={c.expiresAt} /></div>
      <div className="field"><label>ملاحظات داخلية</label><textarea name="notes" rows={3} className="input" defaultValue={c.notes} /></div>
      <SubmitButton>حفظ التعديلات</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ users }: { users: { id: string; label: string }[] }) {
  const [state, action] = useActionState(adminResetPasswordAction, undefined);
  return (
    <form action={action}>
      <FormAlert state={state} />
      <div className="form-row">
        <div className="field">
          <label>المستخدم</label>
          <select name="userId" className="input">{users.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</select>
        </div>
        <div className="field"><label>كلمة السر الجديدة</label><input name="password" className="input ltr" required minLength={8} autoComplete="off" /></div>
      </div>
      <SubmitButton className="btn btn-ghost">تغيير كلمة السر</SubmitButton>
    </form>
  );
}
