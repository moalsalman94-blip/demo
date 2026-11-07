"use client";
import { useActionState } from "react";
import { adminLoginAction } from "./actions";
import { FormAlert, SubmitButton } from "@/components/forms";
import { Logo } from "@/components/Logo";

export default function AdminLogin() {
  const [state, action] = useActionState(adminLoginAction, undefined);
  return (
    <main className="auth-panel" style={{ minHeight: "100dvh" }}>
      <div className="ticket">
        <div className="ticket-head">
          <Logo size={20} />
          <h2>لوحة المالك</h2>
        </div>
        <div className="ticket-body">
          <form action={action}>
            <FormAlert state={state} />
            <div className="field">
              <label htmlFor="username">اسم المستخدم</label>
              <input id="username" name="username" className="input ltr" defaultValue={state?.data?.username} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="password">كلمة السر</label>
              <input id="password" name="password" type="password" className="input ltr" required />
            </div>
            <SubmitButton className="btn btn-ink btn-block" pending="جاري الدخول...">دخول</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
