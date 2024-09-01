import { useState, useEffect } from 'react';

import { store, bindHook, unbindHook } from './reducer';
import LoadingSpinner from './LoadingSpinner';
import stylesheet from './css/ticket-card.module.scss';

const getMaxDuration = (ticketSegments) => {
  let duration = 0;
  for (const seg of ticketSegments) {
    if (seg.duration > duration) duration = seg.duration;
  }
  return duration;
};

const sortFunctions = {
  cheapest: (a, b) => a.price - b.price,
  fastest: (a, b) => {
    a = { duration: getMaxDuration(a.segments) };
    b = { duration: getMaxDuration(b.segments) };
    return a.duration - b.duration;
  },
  optimal: (a, b) => {
    a = { price: a.price, duration: getMaxDuration(a.segments) };
    b = { price: b.price, duration: getMaxDuration(b.segments) };
    if (a.price > b.price) return a.duration - b.duration;
    return a.price - b.price;
  },
};

const formatTime = (date) => {
  if (!(date instanceof Date)) date = new Date(date);
  return ['getHours', 'getMinutes'].map((f) => ('0' + date[f]()).slice(-2)).join(':');
};

const formatDuration = (durationInMinutes) => {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  return `${hours}ч` + (minutes > 0 ? ` ${minutes}мин` : '');
};

const infoMessage = (msg) => (
  <div className={stylesheet['ticket-card']}>
    <div className={stylesheet['icon-info']}></div>
    {msg}
  </div>
);

const useStore = () => {
  const [data, setData] = useState(store.getState());
  useEffect(() => {
    const handler = () => {
      setData(store.getState());
    };
    bindHook(handler);
    return () => unbindHook(handler);
  });
  return data;
};

const Tickets = ({ paginator }) => {
  const data = useStore();
  const [ticketsLimit, setTicketsLimit] = useState(5);
  paginator.bindHook(setTicketsLimit);
  const { transfersFilter } = data;
  if (transfersFilter.size == 0) {
    paginator.domRef.current.style.display = 'none';
    return infoMessage('Выберите нужное количество пересадок');
  }
  let { tickets } = data;
  if (Array.isArray(tickets)) {
    const sortFn = sortFunctions[data.sortOrder];
    if (sortFn) tickets = [...tickets].sort(sortFn);
    tickets = tickets.filter((ticket) => {
      let stops = 0;
      for (const s of ticket.segments) {
        const l = s.stops.length;
        if (l > stops) stops = l;
      }
      return transfersFilter.has(stops);
    });
    if (!tickets.length) return infoMessage('По выбранному фильтру нет результатов');
    if (ticketsLimit >= tickets.length) paginator.domRef.current.style.display = 'none';
    else {
      const { domRef } = paginator;
      domRef && domRef.current && domRef.current.removeAttribute('style');
    }
    tickets = tickets.slice(0, ticketsLimit);
    return tickets.map((ticket) => {
      const segments = ticket.segments.map((s) => {
        const d = new Date(s.date).getTime();
        let stopsInfo = null;
        if (s.stops.length > 0) {
          stopsInfo = (
            <div>
              <h3>{s.stops.length + ' ' + (s.stops.length > 1 ? 'пересадки' : 'пересадка')}</h3>
              <p>{s.stops.join(', ')}</p>
            </div>
          );
        }
        return (
          <div key={ticket.segments.indexOf(s)} className={stylesheet.row}>
            <div>
              <h3>{`${s.origin} - ${s.destination}`}</h3>
              <p>{`${formatTime(d)} - ${formatTime(d + s.duration * 60 * 1000)}`}</p>
            </div>
            <div>
              <h3>В пути</h3>
              <p>{formatDuration(s.duration)}</p>
            </div>
            {stopsInfo}
          </div>
        );
      });
      return (
        <div key={ticket.id} className={stylesheet['ticket-card']}>
          <h2 className={stylesheet['price']}>
            {String(ticket.price).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' '}
            <span className={stylesheet.rub}>₽</span>
          </h2>
          <img src={`https://pics.avs.io/99/36/${ticket.carrier}.png`} />
          <div className={stylesheet.clearfix}></div>
          <div className={stylesheet['ticket-details']}>{segments}</div>
        </div>
      );
    });
  }
  return <LoadingSpinner />;
};

export default Tickets;
