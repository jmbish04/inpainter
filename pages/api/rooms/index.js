import { getDb } from '../../../lib/db';
import { rooms } from '../../../lib/schema';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const db = getDb(process.env);

  if (req.method === 'GET') {
    const allRooms = await db.select().from(rooms);
    return new Response(JSON.stringify(allRooms), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (req.method === 'POST') {
    const body = await req.json();
    const newRoom = await db.insert(rooms).values({
      name: body.name,
      floor: body.floor,
    }).returning();
    return new Response(JSON.stringify(newRoom[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
