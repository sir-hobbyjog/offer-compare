"use client";

export default function Header() {
  return (
    <header className="bg-xmre-navy text-white py-4 px-6 no-print">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Offer Compare
          </h1>
          <p className="text-sm text-white/70">
            Extra Mile Real Estate
          </p>
        </div>
        <div className="text-sm text-white/60 hidden sm:block">
          Side-by-side offer comparison
        </div>
      </div>
    </header>
  );
}
