"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { randomRoomId, slugifyRoomId } from "../lib/statuses";

export default function HomePage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  function goToRoom(e) {
    e.preventDefault();
    const slug = slugifyRoomId(roomName) || randomRoomId();
    router.push(`/r/${slug}`);
  }

  function startNewRoom() {
    router.push(`/r/${randomRoomId()}`);
  }

  return (
    <div className="wrap">
      <div className="title">Ready Check</div>
      <p className="subtitle">
        Getting a group out the door is chaos. Make a room, share the link, and everyone
        taps their status so you know who's actually ready.
      </p>

      <div className="card">
        <form onSubmit={goToRoom}>
          <label htmlFor="roomName">Room name</label>
          <input
            id="roomName"
            type="text"
            placeholder="e.g. friday-dinner"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
          <button className="btn-primary" type="submit">
            Create / Join Room
          </button>
        </form>
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <p className="subtitle" style={{ margin: "0 0 12px" }}>
          Don't care about the name? Get a random one.
        </p>
        <button className="icon-btn" onClick={startNewRoom} style={{ width: "100%" }}>
          Surprise Me
        </button>
      </div>

      <p className="footer-note">
        No sign-up needed. Anyone with the room link can join and update their own status.
        Rooms clear themselves out after 24 hours of inactivity.
      </p>
    </div>
  );
}
