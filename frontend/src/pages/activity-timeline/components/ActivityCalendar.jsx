import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Video, MapPin, Users } from 'lucide-react';
import activitiesService from '../../../services/activitiesService';
import './ActivityCalendar.css';

const localizer = momentLocalizer(moment);

const ActivityCalendar = ({ filters, currentUser }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [view, setView] = useState('month');

  // Fetch calendar activities for the current view
  const fetchCalendarActivities = useCallback(async (date) => {
    setLoading(true);
    try {
      // Calculate date range based on current view
      let startDate, endDate;

      if (view === 'month') {
        startDate = moment(date).startOf('month').subtract(7, 'days').format('YYYY-MM-DD');
        endDate = moment(date).endOf('month').add(7, 'days').format('YYYY-MM-DD');
      } else if (view === 'week') {
        startDate = moment(date).startOf('week').format('YYYY-MM-DD');
        endDate = moment(date).endOf('week').format('YYYY-MM-DD');
      } else if (view === 'day') {
        startDate = moment(date).format('YYYY-MM-DD');
        endDate = moment(date).format('YYYY-MM-DD');
      } else { // agenda
        startDate = moment(date).format('YYYY-MM-DD');
        endDate = moment(date).add(1, 'month').format('YYYY-MM-DD');
      }

      const activities = await activitiesService.getCalendarActivities(startDate, endDate);

      // Transform activities to calendar events
      const calendarEvents = activities.map(activity => ({
        id: activity.id,
        title: activity.subject,
        start: new Date(activity.scheduled_at),
        end: activity.end_time ? new Date(activity.end_time) : new Date(activity.scheduled_at),
        resource: {
          ...activity,
          type: activity.type,
          source: activity.sync_source || 'crm',
          location: activity.location,
          meeting_link: activity.meeting_link,
          attendees: activity.attendees,
          contact: activity.contact,
          deal: activity.deal,
          sync_status: activity.sync_status,
          outlook_event_id: activity.outlook_event_id
        }
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to fetch calendar activities:', error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  // Initial load and when date/view changes
  useEffect(() => {
    fetchCalendarActivities(calendarDate);
  }, [calendarDate, view, fetchCalendarActivities]);

  // Handle navigation (month/week/day change)
  const handleNavigate = (newDate) => {
    setCalendarDate(newDate);
  };

  // Handle view change (month, week, day, agenda)
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handle clicking on an event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Handle clicking on empty calendar slot to create new activity
  const handleSelectSlot = (slotInfo) => {
    // TODO: Open create activity modal with pre-filled dates
    console.log('Create new activity:', slotInfo);
  };

  // Custom event styling based on type and source
  const eventStyleGetter = (event) => {
    const resource = event.resource;
    let style = {
      borderRadius: '4px',
      opacity: 0.9,
      border: '0px',
      display: 'block',
      fontSize: '13px'
    };

    // Color by activity type
    if (resource.type === 'meeting') {
      style.backgroundColor = '#10b981'; // Green
    } else if (resource.type === 'call') {
      style.backgroundColor = '#f59e0b'; // Orange
    } else if (resource.type === 'email') {
      style.backgroundColor = '#3b82f6'; // Blue
    } else if (resource.type === 'task') {
      style.backgroundColor = '#8b5cf6'; // Purple
    } else {
      style.backgroundColor = '#6b7280'; // Gray
    }

    // Add border for Outlook synced events
    if (resource.source === 'outlook') {
      style.borderLeft = '4px solid #0078D4';
      style.paddingLeft = '4px';
    }

    return { style };
  };

  // Custom event component showing icon and title
  const EventComponent = ({ event }) => {
    const resource = event.resource;

    return (
      <div className="calendar-event-content">
        <div className="calendar-event-header">
          {resource.source === 'outlook' && (
            <span className="calendar-event-badge" title="Synced from Outlook">☁️</span>
          )}
          {resource.type === 'meeting' && <CalendarIcon size={12} />}
          {resource.type === 'call' && <span>📞</span>}
          {resource.type === 'email' && <span>📧</span>}
          {resource.type === 'task' && <span>✓</span>}
        </div>
        <div className="calendar-event-title">{event.title}</div>
        {resource.meeting_link && (
          <div className="calendar-event-link">
            <Video size={10} /> Teams
          </div>
        )}
        {resource.location && (
          <div className="calendar-event-location">
            <MapPin size={10} /> {resource.location}
          </div>
        )}
      </div>
    );
  };

  // Custom toolbar with additional controls
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = moment(toolbar.date);
      if (toolbar.view === 'month') {
        return date.format('MMMM YYYY');
      } else if (toolbar.view === 'week') {
        return `${date.startOf('week').format('MMM D')} - ${date.endOf('week').format('MMM D, YYYY')}`;
      } else if (toolbar.view === 'day') {
        return date.format('MMMM D, YYYY');
      } else {
        return date.format('MMMM YYYY');
      }
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={goToToday}>Today</button>
          <button type="button" onClick={goToBack}>Back</button>
          <button type="button" onClick={goToNext}>Next</button>
        </span>
        <span className="rbc-toolbar-label">{label()}</span>
        <span className="rbc-btn-group">
          <button
            type="button"
            className={toolbar.view === 'month' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={toolbar.view === 'week' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={toolbar.view === 'day' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('day')}
          >
            Day
          </button>
          <button
            type="button"
            className={toolbar.view === 'agenda' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('agenda')}
          >
            Agenda
          </button>
        </span>
      </div>
    );
  };

  return (
    <div className="activity-calendar-container">
      {loading && (
        <div className="calendar-loading-overlay">
          <div className="spinner"></div>
          <span>Loading calendar...</span>
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        views={['month', 'week', 'day', 'agenda']}
        view={view}
        date={calendarDate}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar
        }}
        step={30}
        showMultiDayTimes
        defaultDate={new Date()}
      />

      {/* Event Detail Modal - will be created separately */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onRefresh={() => fetchCalendarActivities(calendarDate)}
        />
      )}
    </div>
  );
};

// Placeholder for EventDetailModal - will create separately
const EventDetailModal = ({ event, onClose, onRefresh }) => {
  const resource = event.resource;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event.title}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          <div className="event-detail-row">
            <strong>Type:</strong>
            <span className="event-type-badge">{resource.type}</span>
          </div>

          <div className="event-detail-row">
            <strong>Date & Time:</strong>
            <span>{moment(event.start).format('MMMM D, YYYY h:mm A')} - {moment(event.end).format('h:mm A')}</span>
          </div>

          {resource.location && (
            <div className="event-detail-row">
              <strong><MapPin size={16} /> Location:</strong>
              <span>{resource.location}</span>
            </div>
          )}

          {resource.meeting_link && (
            <div className="event-detail-row">
              <strong><Video size={16} /> Meeting Link:</strong>
              <a href={resource.meeting_link} target="_blank" rel="noopener noreferrer" className="meeting-link">
                Join Teams Meeting
              </a>
            </div>
          )}

          {resource.attendees && resource.attendees.length > 0 && (
            <div className="event-detail-row">
              <strong><Users size={16} /> Attendees:</strong>
              <div className="attendees-list">
                {resource.attendees.map((email, idx) => (
                  <span key={idx} className="attendee-badge">{email}</span>
                ))}
              </div>
            </div>
          )}

          {resource.contact && (
            <div className="event-detail-row">
              <strong>Contact:</strong>
              <span>{resource.contact.first_name} {resource.contact.last_name}</span>
            </div>
          )}

          {resource.deal && (
            <div className="event-detail-row">
              <strong>Deal:</strong>
              <span>{resource.deal.name}</span>
            </div>
          )}

          {resource.description && (
            <div className="event-detail-row">
              <strong>Description:</strong>
              <p>{resource.description}</p>
            </div>
          )}

          {resource.source === 'outlook' && (
            <div className="event-detail-badge outlook-badge">
              ☁️ Synced from Outlook
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Close</button>
          {/* Add Edit, Delete buttons later */}
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
