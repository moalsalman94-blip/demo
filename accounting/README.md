# ميزان: برنامج المحاسبة السحابي (متعدد الشركات)

رابط واحد لكل الزباين. كل شركة بتدخل برقم اشتراكها، وبياناتها معزولة تماماً عن باقي الشركات.

## التقنيات
- **Next.js 15**: الواجهة والسيرفر بمشروع واحد
- **PostgreSQL + Prisma**: قاعدة البيانات (بتشتغل مع Supabase أو أي PostgreSQL)
- جلسات دخول مشفرة (JWT بكوكي httpOnly) وكلمات سر مشفرة بـ bcrypt

## شو جاهز (المرحلة 1)
| | |
|---|---|
| `/login` | دخول الشركات: رقم الاشتراك + اسم المستخدم + كلمة السر |
| `/dashboard` | لوحة الشركة (الرئيسية) |
| `/dashboard/users` | إدارة المستخدمين والصلاحيات (مدير / محاسب / مشاهد) |
| `/admin` | **لوحتك أنت كمالك**: إنشاء شركات، تمديد اشتراكات، إيقاف/تفعيل، تغيير كلمات السر |

**الحماية:**
- عزل البيانات: كل استعلام من صفحات الشركة بيمر عبر `src/lib/tenant.ts` اللي بيفرض `companyId` تلقائياً
- لو أوقفت اشتراك أو انتهى، المستخدمين بينطردوا فوراً
- قفل مؤقت بعد 5 محاولات دخول غلط
- حد أقصى لعدد المستخدمين لكل اشتراك

## التشغيل على جهازك
```bash
cd accounting
cp .env.example .env       # وعبّي القيم
npm install
npm run db:migrate         # بينشئ الجداول
npm run db:seed            # بينشئ حساب المالك من ADMIN_USERNAME / ADMIN_PASSWORD
npm run dev
```
بعدها افتح `http://localhost:3000/admin/login` وأنشئ أول شركة.

## النشر أونلاين (Supabase + Vercel + الدومين)
1. **Supabase**: اعمل مشروع على supabase.com، وخذ من *Project Settings → Database* رابطين:
   - Transaction pooler (port 6543) → `DATABASE_URL` (ضيف بآخره `?pgbouncer=true`)
   - Direct / Session (port 5432) → `DIRECT_URL`
2. من جهازك، بعد ما تحط الرابطين بـ `.env`:
   ```bash
   npm run db:deploy && npm run db:seed
   ```
3. **Vercel**: اربط مستودع GitHub، وخلي *Root Directory* = `accounting`، وضيف المتغيرات:
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (ولّده بـ `openssl rand -base64 48`)
4. **الدومين**: من Vercel → *Settings → Domains* ضيف مثلاً `app.domainak.com` وحط سجل الـ DNS اللي بيعطيك ياه.

## إضافة جدول جديد خاص بالشركات
1. ضيفه بـ `prisma/schema.prisma` مع `companyId` وعلاقة لـ `Company`
2. ضيف اسمه لـ `TENANT_MODELS` بـ `src/lib/tenant.ts`
3. بالصفحات استخدم دائماً `db` اللي بيرجع من `requireCompanyUser()`، **مش** `prisma` مباشرة

## تغيير اسم البرنامج
من `src/lib/brand.ts`.
