import { getDb } from '../../../lib/db';
import { photos } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const db = getDb(process.env);

  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    let allPhotos = [];
    if (roomId) {
      allPhotos = await db.select().from(photos).where(eq(photos.roomId, Number(roomId)));
    } else {
      allPhotos = await db.select().from(photos);
    }

    return new Response(JSON.stringify(allPhotos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (req.method === 'POST') {
    const body = await req.json();
    const newPhoto = await db.insert(photos).values({
      roomId: body.roomId,
      type: body.type,
      url: body.url,
      prompt: body.prompt,
      originalPhotoId: body.originalPhotoId,
      inspirationPhotoId: body.inspirationPhotoId,
    }).returning();
    return new Response(JSON.stringify(newPhoto[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
