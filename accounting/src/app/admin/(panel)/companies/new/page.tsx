"use client";
import { useActionState } from "react";
import { createCompanyAction } from "../../../actions";
import { FormAlert, SubmitButton } from "@/components/forms";
import { PageHeader } from "@/components/Shell";

export default function NewCompany() {
  const [state, action] = useActionState(createCompanyAction, undefined);
  const d = state?.data ?? {};
  return (
    <>
      <PageHeader title="إضافة شركة جديدة" />
      <div className="content">
        <form action={action} className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-title">بيانات الشركة والاشتراك</div>
            <FormAlert state={state} />
            <div className="field"><label>اسم الشركة *</label><input name="name" className="input" defaultValue={d.name} required /></div>
            <div className="field"><label>رقم الهاتف</label><input name="phone" className="input ltr" defaultValue={d.phone} /></div>
            <div className="form-row">
              <div className="field">
                <label>مدة الاشتراك</label>
                <select name="months" className="input" defaultValue={d.months ?? "12"}>
                  <option value="1">شهر</option><option value="3">3 شهور</option>
                  <option value="6">6 شهور</option><option value="12">سنة</option><option value="24">سنتين</option>
                </select>
              </div>
              <div className="field"><label>أقصى عدد مستخدمين</label><input name="maxUsers" type="number" min={1} max={500} className="input" defaultValue={d.maxUsers ?? "5"} /></div>
            </div>
            <p className="muted small" style={{ margin: 0 }}>رقم الاشتراك بينعمل تلقائياً بعد الحفظ.</p>
          </div>
          <div className="card">
            <div className="card-title">حساب مدير الشركة</div>
            <div className="field"><label>الاسم الكامل *</label><input name="ownerName" className="input" defaultValue={d.ownerName} required /></div>
            <div className="field"><label>اسم المستخدم * (إنجليزي)</label><input name="username" className="input ltr" defaultValue={d.username} required autoCapitalize="none" pattern="[a-zA-Z0-9._\-]{3,32}" /></div>
            <div className="field"><label>كلمة السر المؤقتة *</label><input name="password" type="text" className="input ltr" required minLength={8} autoComplete="off" /></div>
            <SubmitButton className="btn btn-gold btn-block" pending="جاري الإنشاء...">إنشاء الشركة</SubmitButton>
          </div>
        </form>
      </div>
    </>
  );
}
