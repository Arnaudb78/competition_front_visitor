"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Event {
  _id: string;
  title: string;
  organizer?: string;
  date: string;
  time?: string;
  location?: string;
  price: number;
  imageUrl?: string;
}

const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).replace(/^\w/, (c) => c.toUpperCase());
}

export default function CalendrierPage() {
  const router = useRouter();
  const today = new Date();

  const [events, setEvents] = useState<Event[]>([]);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  useEffect(() => {
    fetch(`${API}/events`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  // Build calendar grid (Monday-first)
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  // Monday = 0, ..., Sunday = 6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  // Events by day
  const eventDates = new Set(
    events.map((e) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  function hasEvent(date: Date) {
    return eventDates.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  }

  const selectedEvents = events.filter((e) => isSameDay(new Date(e.date), selectedDate));

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="min-h-dvh px-5 pt-12 pb-32">
      {/* Title */}
      <h1
        className="text-white text-2xl font-bold text-center mb-6"
        style={{ fontFamily: "'ESPeak', sans-serif" }}
      >
        Nos prochains évènements
      </h1>

      {/* Calendar card */}
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span
            className="text-white font-semibold text-base"
            style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
          >
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-white/40 text-xs font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const hasEv = hasEvent(date);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className="flex flex-col items-center justify-center h-9 rounded-full transition-colors relative"
                style={{
                  background: isSelected
                    ? "#FFCA44"
                    : isToday
                    ? "rgba(255,202,68,0.2)"
                    : "transparent",
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isSelected ? "#1a1a2e" : "white",
                    fontFamily: "'SpaceGrotesk', sans-serif",
                  }}
                >
                  {date.getDate()}
                </span>
                {hasEv && (
                  <span
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ background: isSelected ? "#1a1a2e" : "#FFCA44" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day label */}
      <h2
        className="text-white font-semibold text-lg mb-4"
        style={{ fontFamily: "'ESPeak', sans-serif" }}
      >
        {formatDayLabel(selectedDate)}
      </h2>

      {/* Events list */}
      {selectedEvents.length === 0 ? (
        <p className="text-white/30 text-sm">Aucun événement ce jour.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {selectedEvents.map((event) => (
            <button
              key={event._id}
              onClick={() => router.push(`/calendrier/${event._id}`)}
              className="w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-purple-600/30" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-white font-semibold text-sm truncate"
                  style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
                >
                  {event.title}
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  {event.organizer ? (
                    <>Par <span className="text-white/80 font-medium">{event.organizer}</span> • </>
                  ) : null}
                  {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  {event.time ? ` · ${event.time}` : ""}
                </p>
              </div>

              {/* Plus */}
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-white/60" strokeWidth={2} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
