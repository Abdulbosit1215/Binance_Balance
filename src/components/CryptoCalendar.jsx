import React from 'react';
import './CryptoCalendar.css';

const CryptoCalendar = () => {
  const events = [
    { date: '2025-01-15', title: 'Major Blockchain Conference', description: 'Annual gathering of industry leaders.' },
    { date: '2025-01-22', title: 'New Token Listing', description: 'Exciting new token to be listed on major exchange.' },
    { date: '2025-02-01', title: 'Network Upgrade', description: 'Scheduled upgrade for a leading blockchain network.' },
    { date: '2025-02-10', title: 'NFT Art Exhibition', description: 'Virtual exhibition showcasing top NFT artists.' },
    { date: '2025-02-28', title: 'Q4 Earnings Call', description: 'Leading crypto company reports quarterly earnings.' },
    { date: '2025-03-05', title: 'Decentralized Finance Summit', description: 'Exploring the future of DeFi.' },
  ];

  const getDayEvents = (date) => {
    return events.filter(event => event.date === date);
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday

    // Fill preceding empty days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Fill days of the month
    for (let i = 1; i <= numDaysInMonth; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      const formattedDate = dayDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayEvents = getDayEvents(formattedDate);

      days.push(
        <div key={i} className="calendar-day">
          <div className="day-number">{i}</div>
          {dayEvents.length > 0 && (
            <div className="events-list">
              {dayEvents.map((event, eventIndex) => (
                <div key={eventIndex} className="calendar-event" title={event.description}>
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="crypto-calendar-container">
      <h2>Crypto Calendar</h2>
      <div className="calendar-header">
        <h3>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
      </div>
      <div className="calendar-grid-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CryptoCalendar;

