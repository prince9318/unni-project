import { useCallback, useEffect, useState } from "react";
import { listRequests, updateRequestStatus } from "../../api/requests.js";

function RequestsSection({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusById, setStatusById] = useState({});

  const fetchRequests = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }
      setError("");
      try {
        const data = await listRequests(token);
        setItems(data);
        const initialStatuses = {};
        data.forEach((request) => {
          initialStatuses[request._id] = request.status;
        });
        setStatusById(initialStatuses);
      } catch (err) {
        setError(err.message);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRequests(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchRequests]);

  const handleStatusChange = (id, value) => {
    setStatusById((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUpdateStatus = async (id) => {
    const newStatus = statusById[id];
    if (!newStatus) return;
    const item = items.find((i) => i._id === id);
    if (
      !confirm(
        `Change status of ${item?.equipment?.name} request to ${newStatus}?`,
      )
    )
      return;
    setUpdatingId(id);
    setError("");
    try {
      await updateRequestStatus(token, id, newStatus);
      await fetchRequests(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Requests overview
          </h2>
          <p className="text-sm text-slate-400">
            Review and approve or reject equipment requests.
          </p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
          disabled={loading}
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-sm shadow-slate-950/40">
        <div className="grid grid-cols-[1.6fr,1.8fr,1fr,1.2fr,auto] gap-4 border-b border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          <div>Requester</div>
          <div>Equipment</div>
          <div>Status</div>
          <div>Created</div>
          <div className="text-right">Action</div>
        </div>
        {error && (
          <div className="px-4 py-3 text-xs text-rose-300">{error}</div>
        )}
        {loading ? (
          <div className="flex items-center justify-center px-4 py-8 text-sm text-slate-400">
            Loading requests...
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400">
            No requests found.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {items.map((item) => {
              const currentStatus = statusById[item._id] || item.status;
              const statusClasses =
                currentStatus === "Approved"
                  ? "border-emerald-500/60 bg-emerald-500/5 text-emerald-200"
                  : currentStatus === "Rejected"
                    ? "border-rose-500/60 bg-rose-500/5 text-rose-200"
                    : "border-amber-400/60 bg-amber-400/5 text-amber-100";
              return (
                <li
                  key={item._id}
                  className="grid grid-cols-[1.6fr,1.8fr,1fr,1.2fr,auto] gap-4 px-4 py-3 text-sm text-slate-200 transition-colors hover:bg-slate-900/70"
                >
                  <div>
                    <div className="font-medium text-slate-50">
                      {item.requester?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.requester?.email}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-50">
                      {item.equipment?.name || "Unknown item"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.notes || "No notes provided"}
                    </div>
                  </div>
                  <div>
                    <select
                      value={currentStatus}
                      onChange={(event) =>
                        handleStatusChange(item._id, event.target.value)
                      }
                      className={`w-full rounded-lg border px-2 py-1 text-xs outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 ${statusClasses}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdateStatus(item._id)}
                      disabled={updatingId === item._id}
                      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingId === item._id ? "Saving..." : "Update"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RequestsSection;
