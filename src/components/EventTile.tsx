import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Edit2, Trash2, Eye, Tag } from 'lucide-react';
import { Event } from '../types';
import { supabase } from '../lib/supabase';

interface EventTileProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventTile({ event, onEdit, onDelete }: EventTileProps) {
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchParticipants() {
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
      
      setParticipantCount(count || 0);
    }

    fetchParticipants();
  }, [event.id]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{event.name}</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {event.tag}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{event.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-2" />
            <span>{participantCount} / {event.capacity} participants</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Eye className="h-5 w-5 mr-1" />
          View
        </button>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex items-center text-gray-600 hover:text-gray-700"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}