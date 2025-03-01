import React from 'react';
import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EventFlow</h3>
            <p className="text-gray-400">
              Streamline your event management process with our powerful platform.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-blue-400">Home</a></li>
              <li><a href="/events" className="hover:text-blue-400">Events</a></li>
              <li><a href="/analytics" className="hover:text-blue-400">Analytics</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/pranavsuriya-sr" className="text-gray-400 hover:text-blue-400">
                <Github className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/pranavsuriya_sr/" className="text-gray-400 hover:text-blue-400">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/in/sr-pranavsuriya/" className="text-gray-400 hover:text-blue-400">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EventFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}