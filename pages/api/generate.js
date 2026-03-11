import { getDb } from '../../lib/db';
import { photos } from '../../lib/schema';
import Replicate from 'replicate';

export const config = {
  runtime: 'edge',
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const db = getDb(process.env);
  const body = await req.json();

  const { listingPhotoUrl, inspirationPhotoUrl, prompt, roomId, listingPhotoId, inspirationPhotoId } = body;

  if (!listingPhotoUrl || !inspirationPhotoUrl || !prompt) {
    return new Response('Missing required fields', { status: 400 });
  }

  try {
    // Note: We use an SDXL ControlNet model here as an example for structure preservation + style transfer.
    // In a real scenario, you'd pick the best Replicate model for this exact task.
    // For this example, let's use an img2img or controlnet approach via Replicate.

    // We'll use a hypothetical or generic endpoint here, or one of the common stable diffusion image to image models
    const output = await replicate.run(
      "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d",
      {
        input: {
          image: listingPhotoUrl, // Base image to modify
          prompt: `A beautiful room remodeled. ${prompt}. Style reference: ${inspirationPhotoUrl}`, // A hacky way to pass inspiration if the model doesn't natively support dual inputs.
          prompt_strength: 0.8,
          num_outputs: 1,
        }
      }
    );

    let generatedImageUrl = output[0];

    // Ideally, we'd upload generatedImageUrl to Cloudflare Images here, but for simplicity we'll just save the Replicate URL or directly upload it.
    // To upload it to Cloudflare Images from a URL:
    if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_IMAGES_API_TOKEN) {
      const cfFormData = new FormData();
      cfFormData.append('url', generatedImageUrl);

      const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_IMAGES_API_TOKEN}`,
        },
        body: cfFormData,
      });

      if (cfResponse.ok) {
        const cfResult = await cfResponse.json();
        generatedImageUrl = cfResult.result.variants[0];
      }
    }

    const newPhoto = await db.insert(photos).values({
      roomId: roomId,
      type: 'generated',
      url: generatedImageUrl,
      prompt: prompt,
      originalPhotoId: listingPhotoId,
      inspirationPhotoId: inspirationPhotoId,
    }).returning();

    return new Response(JSON.stringify({ url: generatedImageUrl, photo: newPhoto[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
