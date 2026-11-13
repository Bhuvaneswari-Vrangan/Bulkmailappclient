// client/src/pages/History.jsx
import { useEffect, useState } from "react";
import { fetchHistory, deleteRecord } from "../api";

export default function History() {
  const [data, setData] = useState({ records: [], page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  const load = async (p) => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchHistory(p, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteRecord(id);
      load(page);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h1>Email history</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && data.records.length === 0 && <p className="muted">No emails sent yet.</p>}

      {data.records.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Recipients</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => (
                <>
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{r.subject}</td>
                    <td>{r.recipients.length}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td className="actions">
                      <button className="link" onClick={() => setOpenId(openId === r._id ? null : r._id)}>
                        {openId === r._id ? "Hide" : "View"}
                      </button>
                      <button className="link danger" onClick={() => onDelete(r._id)}>Delete</button>
                    </td>
                  </tr>
                  {openId === r._id && (
                    <tr key={`${r._id}-d`}>
                      <td colSpan={5} className="details">
                        <p><strong>To:</strong> {r.recipients.join(", ")}</p>
                        <p style={{ whiteSpace: "pre-wrap" }}>{r.body}</p>
                        {r.failedRecipients?.length > 0 && (
                          <p className="danger">
                            <strong>Failed:</strong>{" "}
                            {r.failedRecipients.map((f) => `${f.email} (${f.error})`).join(", ")}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {data.page} of {data.pages}</span>
          <button className="btn btn-ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
