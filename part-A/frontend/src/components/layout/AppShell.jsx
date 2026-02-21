import { useState } from "react";
import EquipmentSection from "../equipment/EquipmentSection.jsx";
import RequestsSection from "../requests/RequestsSection.jsx";

function AppShell({ user, token, onLogout }) {
  const [view, setView] = useState("equipment");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Internal Tool
          </div>
          <div className="mt-1 text-lg font-semibold">Equipment Tracker</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setView("equipment")}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
              view === "equipment"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            }`}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-xs text-indigo-400">
              EQ
            </span>
            Equipment
          </button>
          {isAdmin && (
            <button
              onClick={() => setView("requests")}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                view === "requests"
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-xs text-emerald-400">
                RQ
              </span>
              Requests
            </button>
          )}
        </nav>
        <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-200">{user.name}</div>
              <div className="mt-0.5 uppercase tracking-[0.18em] text-[10px] text-slate-500">
                {user.role}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="rounded-md border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 lg:hidden">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Internal Tool
            </div>
            <div className="text-sm font-semibold">Equipment Tracker</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={onLogout}
              className="rounded-md border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </header>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-64 bg-slate-950 border-l border-slate-800 p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-semibold text-slate-50">Menu</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setView("equipment");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    view === "equipment"
                      ? "bg-slate-800 text-slate-50"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-xs text-indigo-400">
                    EQ
                  </span>
                  Equipment
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setView("requests");
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                      view === "requests"
                        ? "bg-slate-800 text-slate-50"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-xs text-emerald-400">
                      RQ
                    </span>
                    Requests
                  </button>
                )}
              </nav>
              <div className="absolute bottom-4 left-4 right-4 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200">
                      {user.name}
                    </div>
                    <div className="mt-0.5 uppercase tracking-[0.18em] text-[10px] text-slate-500">
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="rounded-md border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 bg-linear-to-b from-slate-950 via-slate-950 to-slate-950 px-4 py-6 lg:px-8 lg:py-8">
          {view === "equipment" && (
            <EquipmentSection token={token} isAdmin={isAdmin} />
          )}
          {view === "requests" && isAdmin && <RequestsSection token={token} />}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
