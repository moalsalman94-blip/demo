"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";
import { FormAlert, SubmitButton } from "@/components/forms";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action}>
      {notice && !state && <div className="alert alert-warn">{notice}</div>}
      <FormAlert state={state} />
      <div className="field">
        <label htmlFor="code">رقم الاشتراك</label>
        <input id="code" name="code" className="input ltr mono" placeholder="ACC-XXXX-XXXX"
          defaultValue={state?.data?.code} autoComplete="organization" required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="username">اسم المستخدم</label>
        <input id="username" name="username" className="input ltr" defaultValue={state?.data?.username}
          autoComplete="username" autoCapitalize="none" required />
      </div>
      <div className="field">
        <label htmlFor="password">كلمة السر</label>
        <input id="password" name="password" type="password" className="input ltr" autoComplete="current-password" required />
      </div>
      <SubmitButton className="btn btn-primary btn-block" pending="جاري الدخول...">دخول ←</SubmitButton>
    </form>
  );
}
