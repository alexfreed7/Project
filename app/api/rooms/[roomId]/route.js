import { NextResponse } from "next/server";
import { redis, ROOM_TTL_SECONDS } from "../../../../lib/redis";
import { STATUS_BY_ID, slugifyRoomId } from "../../../../lib/statuses";

function roomKey(roomId) {
  return `readycheck:room:${roomId}`;
}

export async function GET(_request, { params }) {
  const { roomId: rawRoomId } = await params;
  const roomId = slugifyRoomId(rawRoomId || "");
  if (!roomId) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  const raw = await redis.hgetall(roomKey(roomId));
  const members = Object.entries(raw || {}).map(([id, value]) => ({
    id,
    ...(typeof value === "string" ? JSON.parse(value) : value),
  }));
  members.sort((a, b) => a.updatedAt - b.updatedAt);

  return NextResponse.json({ roomId, members });
}

export async function POST(request, { params }) {
  const { roomId: rawRoomId } = await params;
  const roomId = slugifyRoomId(rawRoomId || "");
  if (!roomId) {
    return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.slice(0, 64) : null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 30) : "";
  const status = typeof body?.status === "string" ? body.status : "";

  if (!id || !name || !STATUS_BY_ID[status]) {
    return NextResponse.json({ error: "id, name, and a valid status are required" }, { status: 400 });
  }

  const member = { name, status, updatedAt: Date.now() };
  const key = roomKey(roomId);
  await redis.hset(key, { [id]: JSON.stringify(member) });
  await redis.expire(key, ROOM_TTL_SECONDS);

  return NextResponse.json({ roomId, member: { id, ...member } });
}

export async function DELETE(request, { params }) {
  const { roomId: rawRoomId } = await params;
  const roomId = slugifyRoomId(rawRoomId || "");
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!roomId || !id) {
    return NextResponse.json({ error: "roomId and id are required" }, { status: 400 });
  }

  await redis.hdel(roomKey(roomId), id);
  return NextResponse.json({ ok: true });
}
