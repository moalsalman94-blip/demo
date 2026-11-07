// الشعار: ERP بالحبر + BACK بلون الإشارة + مربع
export function Logo({ size }: { size?: number }) {
  return (
    <span className="wordmark" style={size ? { fontSize: size } : undefined} aria-label="ERPBACK">
      ERP<b>BACK</b><i aria-hidden />
    </span>
  );
}
