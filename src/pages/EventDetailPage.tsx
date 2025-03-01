import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Eye, EyeOff } from 'lucide-react';
import { Event, Participant } from '../types';
import { supabase } from '../lib/supabase';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipants, setShowParticipants] = useState(true);
  const [ticketNumber, setTicketNumber] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventAndParticipants();
    }
  }, [id]);

  // Auto-submit when scan input reaches 16 characters
  useEffect(() => {
    if (scanInput.length === 16) {
      handleScanSubmit(scanInput);
      setScanInput(''); // Clear the input after submission
    }
  }, [scanInput]);

  async function fetchEventAndParticipants() {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      if (!eventData) {
        navigate('/events');
        return;
      }

      setEvent(eventData);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);
    } catch (error) {
      console.error('Error fetching event details:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !id) return;

    try {
      const { error } = await supabase
        .from('participants')
        .insert([
          {
            event_id: id,
            ticket_number: ticketNumber
          }
        ]);

      if (error) throw error;

      fetchEventAndParticipants();
      setTicketNumber('');
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  }

  async function handleScanSubmit(scannedValue: string) {
    if (!event || !id) return;

    try {
      const { error } = await supabase
        .from('participants')
        .insert([
          {
            event_id: id,
            ticket_number: scannedValue
          }
        ]);

      if (error) throw error;

      fetchEventAndParticipants();
    } catch (error) {
      console.error('Error adding scanned participant:', error);
    }
  }

  const handleDownloadParticipants = () => {
    if (!event) return;

    const csvContent = [
      ['Ticket Number', 'Registration Time'],
      ...participants.map(p => [
        p.ticket_number,
        new Date(p.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name}-participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">{event.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="space-y-2">
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Capacity:</strong> {participants.length} / {event.capacity}</p>
                <p><strong>Description:</strong> {event.description}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Enter Participant</h2>
              <form onSubmit={handleAddParticipant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ticket Number / Roll Number
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Scan
                  </label>
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Scan barcode or QR code"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={participants.length >= event.capacity}
                  className={`w-full px-4 py-2 rounded-md ${
                    participants.length >= event.capacity
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {participants.length >= event.capacity
                    ? 'Event Full'
                    : 'Enter'
                  }
                </button>
              </form>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">Participants</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {participants.length} / {event.capacity}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  {showParticipants ? (
                    <>
                      <EyeOff className="h-5 w-5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadParticipants}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {showParticipants && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Number/Roll Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {participant.ticket_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(participant.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}