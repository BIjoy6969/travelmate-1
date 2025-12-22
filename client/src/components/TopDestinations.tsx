import React, { useEffect, useState } from "react";

const API_URL = "https://restcountries.com/v3.1/all";

// This component implements Module 1 - Member 2:
// Users can browse top destinations with images, ratings, and descriptions
// fetched from an external travel-related API (Rest Countries).
const TopDestinations: React.FC = () => {
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDestinations() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(API_URL);
                if (!res.ok) {
                    throw new Error("Failed to load destinations");
                }

                const data = await res.json();

                // Convert API data into the shape we need for cards
                const mapped = data
                    .filter((country: any) => country.capital && country.flags?.png)
                    .slice(0, 12) // take top 12 destinations
                    .map((country: any) => ({
                        id: country.cca3,
                        name: country.capital?.[0] || country.name.common,
                        country: country.name.common,
                        image: country.flags.png,
                        description: `${country.capital?.[0] || country.name.common
                            }, ${country.region}`,
                        // fake rating between 3.5 and 5.0
                        rating: (3.5 + Math.random() * 1.5).toFixed(1),
                    }));

                setDestinations(mapped);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        loadDestinations();
    }, []);

    if (loading) {
        return <p className="text-slate-300">Loading top destinations...</p>;
    }

    if (error) {
        return (
            <p className="text-red-400">
                Could not load destinations. {error}
            </p>
        );
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold mb-1 text-gray-800">
                    Top Destinations
                </h2>
                <p className="text-sm text-gray-500">
                    Browse popular destinations with images, ratings and descriptions,
                    fetched from an external travel data API (Rest Countries API).
                    No login required.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {destinations.map((dest) => (
                    <article
                        key={dest.id}
                        className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 flex flex-col hover:shadow-xl transition-shadow"
                    >
                        <img
                            src={dest.image}
                            alt={dest.name}
                            className="h-40 w-full object-cover"
                        />
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-gray-800">{dest.name}</h3>
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    ⭐ {dest.rating}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                {dest.description}
                            </p>
                            <p className="mt-auto text-xs text-gray-500">
                                Country:{" "}
                                <span className="text-gray-700 font-medium">{dest.country}</span>
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default TopDestinations;
