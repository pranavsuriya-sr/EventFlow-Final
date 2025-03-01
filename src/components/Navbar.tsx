import React from 'react';
import { CalendarDays, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <CalendarDays className="h-8 w-8 text-blue-400" />
            <span className="font-bold text-xl">EventFlow</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  to="/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/events'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Events
                </Link>
                <Link
                  to="/analytics"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/analytics'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Analytics
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}