// =====================================================
// CALENDAR SYNC SERVICE - iCalendar (.ics) Generation
// =====================================================

import { supabase } from '../lib/supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  organizer?: {
    name: string;
    email?: string;
  };
  url?: string;
}

/**
 * Generate iCalendar (.ics) content from events
 */
export function generateICS(events: CalendarEvent[], calendarName: string = 'Bloghead'): string {
  const now = new Date();
  const timestamp = formatICSDate(now);

  const ics: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bloghead//Calendar//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  // Add timezone definition
  ics.push(
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Berlin',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
  );

  // Add each event
  events.forEach(event => {
    const uid = `${event.id}@bloghead.de`;
    const status = event.status?.toUpperCase() || 'CONFIRMED';

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;TZID=Europe/Berlin:${formatICSDate(event.startDate)}`,
      `DTEND;TZID=Europe/Berlin:${formatICSDate(event.endDate)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `STATUS:${status}`,
    );

    if (event.description) {
      ics.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }

    if (event.location) {
      ics.push(`LOCATION:${escapeICS(event.location)}`);
    }

    if (event.url) {
      ics.push(`URL:${event.url}`);
    }

    if (event.organizer) {
      const organizerLine = event.organizer.email
        ? `ORGANIZER;CN=${escapeICS(event.organizer.name)}:mailto:${event.organizer.email}`
        : `ORGANIZER;CN=${escapeICS(event.organizer.name)}:`;
      ics.push(organizerLine);
    }

    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * Format date for iCalendar (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  return date.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Escape special characters for iCalendar
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Download ICS file
 */
export function downloadICS(content: string, filename: string = 'bloghead-calendar.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL for adding event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    details: event.description || '',
    location: event.location || '',
    ctz: 'Europe/Berlin',
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Format date for Google Calendar URL
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// =====================================================
// FETCH BOOKINGS FOR CALENDAR
// =====================================================

interface BookingClient {
  vorname: string;
  nachname: string;
  email: string;
}

interface BookingArtist {
  vorname: string;
  nachname: string;
  kuenstlername: string | null;
}

interface BookingData {
  id: string;
  event_name: string | null;
  event_description: string | null;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  location_city: string | null;
  status: string;
  client: BookingClient | BookingClient[] | null;
  artist: BookingArtist | BookingArtist[] | null;
}

/**
 * Get user's bookings as calendar events
 */
export async function getBookingsAsCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('booking_requests')
    .select(`
      id,
      event_name,
      event_description,
      event_date,
      event_start_time,
      event_end_time,
      location_name,
      location_address,
      location_city,
      status,
      client:users!client_id (
        vorname,
        nachname,
        email
      ),
      artist:users!artist_id (
        vorname,
        nachname,
        kuenstlername
      )
    `)
    .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
    .in('status', ['confirmed', 'deposit_paid', 'completed'])
    .order('event_date', { ascending: true });

  if (error) {
    console.error('[CalendarSync] Error fetching bookings:', error);
    throw error;
  }

  return ((data || []) as BookingData[]).map(booking => {
    const startDate = new Date(`${booking.event_date}T${booking.event_start_time || '18:00'}`);
    const endDate = new Date(`${booking.event_date}T${booking.event_end_time || '23:00'}`);

    const location = [booking.location_name, booking.location_address, booking.location_city]
      .filter(Boolean)
      .join(', ');

    // Handle both array and single object from Supabase joins
    const artist = Array.isArray(booking.artist) ? booking.artist[0] : booking.artist;
    const client = Array.isArray(booking.client) ? booking.client[0] : booking.client;

    const artistName = artist?.kuenstlername ||
      `${artist?.vorname} ${artist?.nachname}`;

    return {
      id: booking.id,
      title: booking.event_name || `Buchung: ${artistName}`,
      description: booking.event_description || undefined,
      location: location || undefined,
      startDate,
      endDate,
      status: booking.status === 'cancelled_client' || booking.status === 'cancelled_artist'
        ? 'cancelled' as const
        : 'confirmed' as const,
      organizer: client ? {
        name: `${client.vorname} ${client.nachname}`,
        email: client.email
      } : undefined,
      url: `https://blog-head.com/dashboard/bookings/${booking.id}`
    };
  });
}

interface AvailabilityData {
  id: string;
  date: string;
  status: string;
  event_name: string | null;
  notes: string | null;
}

/**
 * Get artist's availability as calendar events (blocked dates)
 */
export async function getAvailabilityAsCalendarEvents(artistId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('artist_availability')
    .select('*')
    .eq('artist_id', artistId)
    .in('status', ['booked', 'blocked'])
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('[CalendarSync] Error fetching availability:', error);
    throw error;
  }

  return ((data || []) as AvailabilityData[]).map(slot => {
    const date = new Date(slot.date);
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59);

    return {
      id: slot.id,
      title: slot.status === 'booked'
        ? (slot.event_name || 'Gebucht')
        : 'Blockiert',
      description: slot.notes || undefined,
      startDate,
      endDate,
      status: slot.status === 'blocked' ? 'cancelled' as const : 'confirmed' as const
    };
  });
}

/**
 * Export all bookings + availability to ICS
 */
export async function exportFullCalendar(userId: string): Promise<string> {
  const [bookings, availability] = await Promise.all([
    getBookingsAsCalendarEvents(userId),
    getAvailabilityAsCalendarEvents(userId)
  ]);

  const allEvents = [...bookings, ...availability];
  return generateICS(allEvents, 'Bloghead Kalender');
}
