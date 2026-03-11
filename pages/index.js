import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(console.error);
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, floor })
    });
    if (res.ok) {
      const newRoom = await res.json();
      setRooms([...rooms, newRoom]);
      setName('');
      setFloor('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white rounded-lg">
      <Head>
        <title>Home Remodel AI</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">Home Remodel AI</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add a Room</h2>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Room Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Master Kitchen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Floor</label>
              <input type="text" value={floor} onChange={e => setFloor(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. 1st Floor" />
            </div>
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Add Room</button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Rooms</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-500">No rooms added yet.</p>
          ) : (
            <ul className="space-y-2">
              {rooms.map(room => (
                <li key={room.id} className="border p-4 rounded-md hover:shadow-md transition-shadow">
                  <Link href={`/rooms/${room.id}`} className="block">
                    <span className="font-medium">{room.name}</span>
                    <span className="text-gray-500 ml-2 text-sm">({room.floor})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
             <Link href="/moodboard" className="text-blue-600 hover:underline text-lg font-medium">View Mood Board &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
