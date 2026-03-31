export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      maxWidth: "480px",
      margin: "0 auto",
      borderLeft: "1px solid #E2E5EA",
      borderRight: "1px solid #E2E5EA",
      minHeight: "100dvh",
    }}>
      {children}
    </div>
  );
}
