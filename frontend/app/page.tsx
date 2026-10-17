export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-4 rounded-card border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-surfaceDark">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          YTVidMate
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Fast, clean video downloads from 360p to 4K with crystal-clear audio.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-indigo-950/50">
          <span className="h-2 w-2 rounded-full bg-success"></span>
          System Online • Phase 0 Scaffolding
        </div>
      </div>
    </main>
  );
}
