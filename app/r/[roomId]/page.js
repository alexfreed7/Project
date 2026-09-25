"use client";

import { useEffect, useRef, useState, useCallback, use } from "react";
import { STATUSES, STATUS_BY_ID, QUICK_NOTES, NOTE_MAX_LENGTH } from "../../../lib/statuses";

const POLL_MS = 2500;

function getOrCreateMemberId() {
  const key = "readycheck:memberId";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

function timeAgo(ts) {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export default function RoomPage({ params }) {
  const { roomId } = use(params);
  const [memberId, setMemberId] = useState(null);
  const [name, setName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [myStatus, setMyStatus] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [members, setMembers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const pollRef = useRef(null);
  const noteInitialized = useRef(false);

  useEffect(() => {
    const id = getOrCreateMemberId();
    setMemberId(id);
    const savedName = window.localStorage.getItem("readycheck:name") || "";
    setName(savedName);
    setNameDraft(savedName);
    setShareUrl(window.location.href);
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      // transient network error, next poll will retry
    }
  }, [roomId]);

  useEffect(() => {
    fetchMembers();
    pollRef.current = setInterval(fetchMembers, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchMembers]);

  useEffect(() => {
    if (!memberId || !members.length) return;
    const mine = members.find((m) => m.id === memberId);
    if (mine) setMyStatus(mine.status);
    if (mine && !noteInitialized.current) {
      setNoteDraft(mine.note || "");
      noteInitialized.current = true;
    }
  }, [members, memberId]);

  async function checkIn({ status, note }) {
    const trimmedName = nameDraft.trim();
    if (!trimmedName) return;
    setName(trimmedName);
    window.localStorage.setItem("readycheck:name", trimmedName);
    setMyStatus(status);

    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: memberId, name: trimmedName, status, note }),
    });
    if (res.ok) fetchMembers();
  }

  function saveStatus(statusId) {
    checkIn({ status: statusId, note: noteDraft });
  }

  function saveNote(noteText) {
    setNoteDraft(noteText);
    checkIn({ status: myStatus || STATUSES[0].id, note: noteText });
  }

  async function leaveRoom() {
    if (!memberId) return;
    const res = await fetch(`/api/rooms/${roomId}?id=${encodeURIComponent(memberId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMyStatus(null);
      setNoteDraft("");
      noteInitialized.current = false;
      fetchMembers();
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const readyCount = members.filter((m) => m.status === "ready").length;
  const allReady = members.length > 0 && readyCount === members.length;
  const isCheckedIn = members.some((m) => m.id === memberId);

  return (
    <div className="wrap">
      <div className="title">{decodeURIComponent(roomId)}</div>
      <p className="subtitle">Share the link below so everyone can check in.</p>

      <div className="card">
        <label htmlFor="shareLink">Room link</label>
        <div className="share-row">
          <input id="shareLink" type="text" readOnly value={shareUrl} />
          <button className="icon-btn" onClick={copyLink}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="card">
        <label htmlFor="nameInput">Your name</label>
        <input
          id="nameInput"
          type="text"
          placeholder="e.g. Alex"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          maxLength={30}
          autoComplete="off"
        />

        <label style={{ marginTop: 18 }}>Your status</label>
        <div className="status-grid">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              className={`status-btn${myStatus === s.id ? " active" : ""}`}
              style={{ "--active-color": s.color }}
              onClick={() => saveStatus(s.id)}
              disabled={!nameDraft.trim()}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        {!nameDraft.trim() && (
          <p className="subtitle" style={{ marginTop: 10, marginBottom: 0 }}>
            Enter your name to check in.
          </p>
        )}
        {isCheckedIn && (
          <button
            className="icon-btn btn-danger"
            style={{ marginTop: 14, width: "100%" }}
            onClick={leaveRoom}
          >
            Leave Room / Remove My Name
          </button>
        )}
      </div>

      <div className="card">
        <label>What are you up to? (optional)</label>
        <p className="subtitle" style={{ margin: "0 0 12px" }}>
          Handy once people are out the door {"—"} share a quick location or note.
        </p>
        <div className="chip-row">
          {QUICK_NOTES.map((n) => (
            <button
              key={n}
              className={`chip${noteDraft === n ? " active" : ""}`}
              onClick={() => saveNote(n)}
              disabled={!nameDraft.trim()}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="share-row" style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder="e.g. at Bar X, on the patio..."
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveNote(noteDraft);
            }}
            maxLength={NOTE_MAX_LENGTH}
            disabled={!nameDraft.trim()}
          />
          <button
            className="icon-btn"
            onClick={() => saveNote(noteDraft)}
            disabled={!nameDraft.trim()}
          >
            Update
          </button>
        </div>
        {noteDraft && (
          <button
            className="icon-btn"
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => saveNote("")}
          >
            Clear note
          </button>
        )}
      </div>

      {members.length > 0 && (
        <div className="summary-banner">
          {allReady ? "Everyone's ready! Let's go \u{1F389}" : `${readyCount} of ${members.length} ready`}
        </div>
      )}

      <div className="card">
        <label>Who's checked in</label>
        {members.length === 0 && <div className="empty-state">No one's checked in yet.</div>}
        {members
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((m) => {
            const status = STATUS_BY_ID[m.status];
            return (
              <div className="roster-item" key={m.id}>
                <div>
                  <div className="roster-name">
                    {m.name}
                    {m.id === memberId ? " (you)" : ""}
                  </div>
                  {m.note && <div className="roster-note">{"\u{1F4CD}"} {m.note}</div>}
                  <div className="roster-time">{timeAgo(m.updatedAt)}</div>
                </div>
                {status && (
                  <span className="badge" style={{ background: status.color }}>
                    {status.emoji} {status.label}
                  </span>
                )}
              </div>
            );
          })}
      </div>

      <p className="footer-note">
        Updates automatically. This room clears itself out after 24 hours of inactivity.
      </p>
    </div>
  );
}
