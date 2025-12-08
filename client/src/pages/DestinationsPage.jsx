import React from "react";

// Static destination data (you can say this is mocked API data)
const DESTINATIONS = [
  {
    id: "PAR",
    name: "Paris",
    country: "France",
    image:
      "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "The romantic city of lights, art, and culture.",
    rating: "4.8",
  },
  {
    id: "TOK",
    name: "Tokyo",
    country: "Japan",
    image:
      "https://images.pexels.com/photos/1619569/pexels-photo-1619569.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A perfect blend of tradition and futuristic city life.",
    rating: "4.7",
  },
  {
    id: "NYC",
    name: "New York",
    country: "USA",
    image:
      "https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "The city that never sleeps, full of landmarks and energy.",
    rating: "4.6",
  },
  {
    id: "ROM",
    name: "Rome",
    country: "Italy",
    image:
      "https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Ancient history, stunning architecture, and amazing food.",
    rating: "4.7",
  },
  {
    id: "BKK",
    name: "Bangkok",
    country: "Thailand",
    image:
      "https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Colorful streets, temples, and vibrant night markets.",
    rating: "4.5",
  },
  {
    id: "DXB",
    name: "Dubai",
    country: "UAE",
    image:
      "https://images.pexels.com/photos/325193/pexels-photo-325193.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Luxury shopping, ultramodern architecture, and desert tours.",
    rating: "4.6",
  },
];

function DestinationsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Top Destinations</h2>
      

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((dest) => (
          <div
            key={dest.id}
            className="bg-white shadow rounded-lg overflow-hidden border flex flex-col"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {dest.name}
                </h3>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  ⭐ {dest.rating}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {dest.description}
              </p>
              <p className="mt-auto text-xs text-gray-500">
                Country: <strong>{dest.country}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DestinationsPage;
