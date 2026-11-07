import "server-only";
import { prisma } from "./db";

/**
 * عزل بيانات الشركات.
 *
 * forCompany(companyId) بترجع نسخة من قاعدة البيانات مقيّدة بشركة وحدة:
 * أي قراءة/تعديل/حذف على جداول الشركات بينضافلها شرط companyId تلقائياً،
 * وأي إنشاء بينحط فيه companyId تلقائياً. هيك مستحيل كود الصفحات يوصل
 * لبيانات شركة تانية حتى لو نسي المبرمج يكتب الشرط.
 *
 * لما تضيف جدول جديد خاص بالشركات (فواتير، قيود...) ضيف اسمه هون.
 */
const TENANT_MODELS = new Set(["User", "AuditLog"]);

const WHERE_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
]);

type AnyArgs = Record<string, unknown> & {
  where?: Record<string, unknown>;
  data?: unknown;
  create?: Record<string, unknown>;
};

export function forCompany(companyId: string) {
  if (!companyId) throw new Error("companyId مطلوب");

  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          const a = (args ?? {}) as AnyArgs;

          if (WHERE_OPS.has(operation)) {
            a.where = { ...(a.where ?? {}), companyId };
          }
          if (operation === "create") {
            a.data = { ...(a.data as object), companyId };
          }
          if (operation === "createMany" || operation === "createManyAndReturn") {
            const rows = Array.isArray(a.data) ? a.data : [a.data];
            a.data = rows.map((r) => ({ ...(r as object), companyId }));
          }
          if (operation === "upsert") {
            a.create = { ...(a.create ?? {}), companyId };
          }
          // منع نقل سجل لشركة تانية عبر التعديل
          if (
            (operation === "update" || operation === "updateMany" || operation === "upsert") &&
            a.data &&
            typeof a.data === "object" &&
            "companyId" in (a.data as object)
          ) {
            delete (a.data as Record<string, unknown>).companyId;
          }
          return query(a as typeof args);
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof forCompany>;
