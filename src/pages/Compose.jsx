// client/src/pages/Compose.jsx
import { useMemo, useState } from "react";
import { sendMail } from "../api";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Compose() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientText, setRecipientText] = useState("");
  const [result, setResult] = useState(null); // { type: "success" | "error", text }
  const [sending, setSending] = useState(false);

  const { valid, invalid } = useMemo(() => {
    const list = [...new Set(recipientText.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
    return {
      valid: list.filter((e) => emailRe.test(e)),
      invalid: list.filter((e) => !emailRe.test(e)),
    };
  }, [recipientText]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!subject.trim()) return setResult({ type: "error", text: "Subject is required" });
    if (!body.trim()) return setResult({ type: "error", text: "Email body is required" });
    if (valid.length === 0) return setResult({ type: "error", text: "Add at least one valid recipient" });
    if (invalid.length) return setResult({ type: "error", text: `Fix invalid email(s): ${invalid.join(", ")}` });

    setSending(true);
    try {
      const data = await sendMail({ subject, body, recipients: valid });
      setResult({ type: "success", text: data.message || "Emails sent" });
      setSubject("");
      setBody("");
      setRecipientText("");
    } catch (err) {
      setResult({ type: "error", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h1>Compose bulk email</h1>

      <label>Subject</label>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />

      <label>Email body</label>
      <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." />

      <label>Recipients</label>
      <textarea
        rows={4}
        value={recipientText}
        onChange={(e) => setRecipientText(e.target.value)}
        placeholder="one@example.com, two@example.com (separate with commas, spaces or new lines)"
      />
      <p className="muted small">
        {valid.length} valid recipient(s)
        {invalid.length > 0 && <span className="danger"> · {invalid.length} invalid</span>}
      </p>

      {result && <div className={`alert alert-${result.type}`}>{result.text}</div>}

      <button className="btn" type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send emails"}
      </button>
    </form>
  );
}
