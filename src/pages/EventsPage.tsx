import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Event, EventTag } from '../types';
import EventForm from '../components/EventForm';
import EventTile from '../components/EventTile';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AVAILABLE_TAGS: EventTag[] = ['Tech', 'Non-Tech', 'Club Activities', 'External Talk'];

export default function EventsPage() {
  const { session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedTags, setSelectedTags] = useState<EventTag[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEvents();
    }
  }, [session?.user?.id]);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { error } = await supabase
        .from('events')
        .insert([{ ...eventData, user_id: session?.user?.id }]);

      if (error) throw error;
      
      fetchEvents();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }

  async function handleEditEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    if (!editingEvent) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: eventData.name,
          date: eventData.date,
          time: eventData.time,
          description: eventData.description,
          capacity: eventData.capacity,
          tag: eventData.tag
        })
        .eq('id', editingEvent.id);

      if (error) throw error;
      
      fetchEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  const toggleTag = (tag: EventTag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredEvents = events.filter(event => 
    selectedTags.length === 0 || selectedTags.includes(event.tag)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            <Plus className="h-5 w-5" />
            <span>Create Event</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Filter by Tags</h2>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <EventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <EventForm
                event={editingEvent}
                onSubmit={handleEditEvent}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventTile
              key={event.id}
              event={event}
              onEdit={() => setEditingEvent(event)}
              onDelete={() => handleDeleteEvent(event.id)}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {events.length === 0
                ? "No events yet. Click the Create Event button to get started!"
                : "No events match the selected filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}