import { requireCompanyUser } from "@/lib/auth";
import { fmtDate, ROLE_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/Shell";
import { changeRoleAction, toggleUserAction } from "./actions";
import { NewUserForm, ResetForm } from "./forms";

export default async function UsersPage() {
  const { db, company, user: me } = await requireCompanyUser(["OWNER"]);
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, username: true, role: true, active: true, lastLoginAt: true },
  });

  return (
    <>
      <PageHeader eyebrow="Team & roles" title="المستخدمين والصلاحيات" />
      <div className="content">
        <div className="card">
          <div className="card-title"><span>فريق العمل</span><span className="badge badge-muted">{users.length} / {company.maxUsers}</span></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>الاسم</th><th>الدور</th><th>الحالة</th><th>آخر دخول</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.fullName}</strong>{u.id === me.id && <span className="muted small"> (أنت)</span>}<div className="muted small mono">{u.username}</div></td>
                    <td>
                      {u.id === me.id ? <span className="badge badge-accent">{ROLE_LABELS[u.role]}</span> : (
                        <form action={changeRoleAction} style={{ display: "flex", gap: 6 }}>
                          <input type="hidden" name="id" value={u.id} />
                          <select name="role" defaultValue={u.role} className="input" style={{ padding: "5px 10px", width: "auto" }}>
                            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <button className="btn btn-ghost btn-sm">حفظ</button>
                        </form>
                      )}
                    </td>
                    <td>{u.active ? <span className="badge badge-ok">فعّال</span> : <span className="badge badge-danger">موقوف</span>}</td>
                    <td className="small muted">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}</td>
                    <td>
                      {u.id !== me.id && (
                        <div className="row-actions">
                          <form action={toggleUserAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <button className={`btn btn-sm ${u.active ? "btn-danger" : "btn-ghost"}`}>{u.active ? "إيقاف" : "تفعيل"}</button>
                          </form>
                          <ResetForm id={u.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 720 }}>
          <div className="card-title">إضافة مستخدم</div>
          <NewUserForm />
          <p className="muted small" style={{ marginBottom: 0 }}>
            <strong>مدير</strong>: كل الصلاحيات · <strong>محاسب</strong>: إدخال وتعديل القيود والفواتير · <strong>مشاهد</strong>: عرض التقارير فقط
          </p>
        </div>
      </div>
    </>
  );
}
