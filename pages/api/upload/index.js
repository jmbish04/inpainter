export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return new Response('Server configuration error', { status: 500 });
    }

    const cfFormData = new FormData();
    cfFormData.append('file', file);

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      body: cfFormData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Cloudflare Images API error:', text);
      return new Response(`Failed to upload to Cloudflare Images: ${text}`, { status: response.status });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ url: result.result.variants[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
