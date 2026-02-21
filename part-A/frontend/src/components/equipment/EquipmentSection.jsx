import { useCallback, useEffect, useState } from "react";
import {
  createEquipment,
  listEquipment,
  requestEquipment,
} from "../../api/equipment.js";

function EquipmentSection({ token, isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [requestError, setRequestError] = useState("");
  const [search, setSearch] = useState("");

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listEquipment(token);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createEquipment(token, {
        name,
        description,
        quantity: Number(quantity),
      });
      setItems((current) => [...current, created]);
      setName("");
      setDescription("");
      setQuantity("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    if (!requestingId) return;
    const item = items.find((i) => i._id === requestingId);
    if (!confirm(`Request ${item?.name}?`)) return;
    setRequestError("");
    try {
      await requestEquipment(token, {
        equipmentId: requestingId,
        notes: requestNotes,
      });
      setRequestingId(null);
      setRequestNotes("");
    } catch (err) {
      setRequestError(err.message);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Equipment inventory
          </h2>
          <p className="text-sm text-slate-400">
            View available items and submit new requests.
          </p>
        </div>
        {isAdmin && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-slate-400">
              Admin overview
            </div>
            <div className="text-2xl font-semibold text-slate-50">
              {items.length}
              <span className="ml-1 text-xs font-normal text-slate-400">
                items
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm shadow-slate-950/40 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Inventory
            </h3>
            <button
              onClick={fetchEquipment}
              disabled={loading}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          {error && (
            <p className="mt-3 rounded-lg border border-rose-800 bg-rose-950/60 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
            <div className="grid grid-cols-[2fr,3fr,1fr,auto] gap-4 border-b border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <div>Name</div>
              <div>Description</div>
              <div className="text-right">Quantity</div>
              <div className="text-right">Action</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center px-4 py-8 text-sm text-slate-400">
                Loading equipment...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-400">
                No equipment found.
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-400">
                No equipment matches your search.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => (
                  <li
                    key={item._id}
                    className="grid grid-cols-[2fr,3fr,1fr,auto] gap-4 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="font-medium text-slate-50">{item.name}</div>
                    <div className="text-slate-400">
                      {item.description || "No description"}
                    </div>
                    <div className="text-right tabular-nums">
                      {item.quantity}
                    </div>
                    <div className="flex justify-end">
                      <button
                        disabled={item.quantity <= 0}
                        onClick={() => {
                          setRequestingId(item._id);
                          setRequestNotes("");
                          setRequestError("");
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          item.quantity <= 0
                            ? "cursor-not-allowed bg-slate-800 text-slate-500"
                            : "bg-emerald-500/90 text-emerald-950 hover:bg-emerald-400"
                        }`}
                      >
                        Request
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {requestError && (
            <p className="mt-3 rounded-lg border border-rose-800 bg-rose-950/60 px-3 py-2 text-xs text-rose-300">
              {requestError}
            </p>
          )}
          {requestingId && (
            <form
              onSubmit={handleRequest}
              className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 space-y-3"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                New request
              </div>
              <textarea
                value={requestNotes}
                onChange={(event) => setRequestNotes(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Optional notes for the approver"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestingId(null);
                    setRequestNotes("");
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                >
                  Submit request
                </button>
              </div>
            </form>
          )}
        </div>
        {isAdmin && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm shadow-slate-950/40 sm:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Add equipment
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              Create new items for the inventory with quantity tracking.
            </p>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Add equipment"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipmentSection;
