import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BarChart3, Clock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Streamline Your Event Management
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Powerful tools to create, manage, and analyze your events with ease.
            Perfect for organizers who want to focus on what matters most.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <Calendar className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Event Creation</h3>
            <p className="text-gray-400">
              Create and manage events with detailed information and capacity control.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <Users className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Participant Tracking</h3>
            <p className="text-gray-400">
              Track and manage participant entries with real-time updates.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <BarChart3 className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-400">
              Visualize event data with powerful analytics and insights.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <Clock className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-400">
              Stay updated with real-time participant tracking and event status.
            </p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=80"
            alt="Event Management"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Events?
              </h2>
              <button
                onClick={() => navigate('/events')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}