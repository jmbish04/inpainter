import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RoomDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [photos, setPhotos] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [listingPhotoId, setListingPhotoId] = useState('');
  const [inspirationPhotoId, setInspirationPhotoId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPhotos = async () => {
    if (!id) return;
    const res = await fetch(`/api/photos?roomId=${id}`);
    const data = await res.json();
    setPhotos(data);
  };

  useEffect(() => {
    fetchPhotos();
  }, [id]);

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Upload to Cloudflare Images
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      alert('Upload failed');
      return;
    }

    const { url } = await uploadRes.json();

    // 2. Save to D1 Database
    const dbRes = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: Number(id),
        type,
        url,
      }),
    });

    if (dbRes.ok) {
      fetchPhotos();
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!listingPhotoId || !inspirationPhotoId || !prompt) {
      alert('Please select a listing photo, an inspiration photo, and enter a prompt.');
      return;
    }

    setIsGenerating(true);

    const listingPhoto = photos.find(p => p.id === Number(listingPhotoId));
    const inspirationPhoto = photos.find(p => p.id === Number(inspirationPhotoId));

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: Number(id),
          listingPhotoId: listingPhoto.id,
          inspirationPhotoId: inspirationPhoto.id,
          listingPhotoUrl: listingPhoto.url,
          inspirationPhotoUrl: inspirationPhoto.url,
          prompt,
        })
      });

      if (!res.ok) {
        throw new Error('Generation failed');
      }

      await fetchPhotos();
      alert('Generation complete!');
    } catch (err) {
      console.error(err);
      alert('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const addToMoodBoard = async (photoId) => {
    const res = await fetch('/api/moodboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    });

    if (res.ok) {
      alert('Added to mood board!');
    } else {
      alert('Failed to add to mood board');
    }
  };

  const listingPhotos = photos.filter(p => p.type === 'listing');
  const inspirationPhotos = photos.filter(p => p.type === 'inspiration');
  const generatedPhotos = photos.filter(p => p.type === 'generated');

  return (
    <div className="max-w-6xl mx-auto p-10 bg-white rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Room Details (ID: {id})</h1>
        <Link href="/" className="text-blue-500 hover:underline">&larr; Back to Home</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Upload Photos</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Listing Photo (Base)</h3>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'listing')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <div className="mt-4 flex flex-wrap gap-2">
              {listingPhotos.map(p => (
                <img key={p.id} src={p.url} alt="Listing" className="h-24 w-24 object-cover rounded-md border" />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Inspiration Photo</h3>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'inspiration')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
            <div className="mt-4 flex flex-wrap gap-2">
              {inspirationPhotos.map(p => (
                <img key={p.id} src={p.url} alt="Inspiration" className="h-24 w-24 object-cover rounded-md border" />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Generate Remodel</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Listing Photo</label>
              <select value={listingPhotoId} onChange={e => setListingPhotoId(e.target.value)} required className="block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                <option value="">Select a photo...</option>
                {listingPhotos.map(p => <option key={p.id} value={p.id}>Photo {p.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Inspiration Photo</label>
              <select value={inspirationPhotoId} onChange={e => setInspirationPhotoId(e.target.value)} required className="block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                <option value="">Select a photo...</option>
                {inspirationPhotos.map(p => <option key={p.id} value={p.id}>Photo {p.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} required className="block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3} placeholder="e.g. Apply the style of the inspiration photo to my kitchen. Make it modern with white cabinets." />
            </div>
            <button type="submit" disabled={isGenerating} className={`w-full text-white px-4 py-3 rounded-md font-medium transition-colors ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}>
              {isGenerating ? 'Generating...' : 'Generate New Photo'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Generated Remodels</h2>
        {generatedPhotos.length === 0 ? (
          <p className="text-gray-500 italic">No generated photos yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {generatedPhotos.map(p => (
              <div key={p.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src={p.url} alt="Generated" className="w-full h-48 object-cover" />
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate mr-4" title={p.prompt}>{p.prompt}</span>
                  <button onClick={() => addToMoodBoard(p.id)} className="shrink-0 bg-blue-100 text-blue-700 px-3 py-1 text-xs rounded-full hover:bg-blue-200 font-medium">
                    + Mood Board
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
