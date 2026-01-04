import React from 'react';
import TopDestinations from '../components/TopDestinations';
import Navbar from '../components/Navbar';

const ExploreDestinations: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <TopDestinations />
            </div>
        </div>
    );
};

export default ExploreDestinations;
