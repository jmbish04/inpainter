import { getDb } from '../../../lib/db';
import { moodBoard, photos } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const db = getDb(process.env);

  if (req.method === 'GET') {
    const items = await db
      .select({
        id: moodBoard.id,
        photoId: moodBoard.photoId,
        url: photos.url,
        roomId: photos.roomId,
      })
      .from(moodBoard)
      .innerJoin(photos, eq(moodBoard.photoId, photos.id));

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (req.method === 'POST') {
    const body = await req.json();
    const newItem = await db.insert(moodBoard).values({
      photoId: body.photoId,
    }).returning();
    return new Response(JSON.stringify(newItem[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
