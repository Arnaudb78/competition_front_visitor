export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white flex flex-col">
      {children}
    </div>
  );
}
