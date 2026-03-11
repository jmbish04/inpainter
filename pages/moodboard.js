import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MoodBoard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/moodboard')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-10 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold">Your Mood Board</h1>
        <Link href="/" className="text-blue-600 hover:underline font-medium">&larr; Back to Home</Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 italic text-lg text-center py-12 bg-gray-50 rounded-lg border border-dashed">No items in your mood board yet. Start generating photos and add them here!</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map(item => (
            <div key={item.id} className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <img src={item.url} alt={`Mood board item ${item.id}`} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <Link href={`/rooms/${item.roomId}`} className="text-white text-sm font-medium hover:underline bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  View Room
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
