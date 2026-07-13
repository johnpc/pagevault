import { useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setCell, addRow } from './tableData';
import { monthGrid, shiftAnchor, firstDateColumn } from './calendarGrid';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS =
  'January February March April May June July August September October November December'.split(
    ' ',
  );

/** The current month as a "YYYY-MM" anchor. Reads the wall clock, so it lives
 * here (component init) rather than in the pure calendar helpers. */
function thisMonth(): string {
  const now = new Date();
  const m = now.getMonth() + 1;
  return `${now.getFullYear()}-${m < 10 ? `0${m}` : m}`;
}

/** The calendar view of a table: rows placed on a month grid by their first
 * `date` column. Navigate months; a row's title (first column) shows as a chip
 * on its day, and "+" on a day adds a row dated to it. Render-only. */
export function CalendarView({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  const [anchor, setAnchor] = useState(thisMonth);
  const dateCol = firstDateColumn(data);
  if (dateCol === -1) {
    return (
      <p className="pv-muted pv-calendar-empty">Add a Date column to use the calendar view.</p>
    );
  }
  const weeks = monthGrid(data, dateCol, anchor);
  const [year, month] = anchor.split('-');
  const addOn = (iso: string) => {
    const withRow = addRow(data);
    save(setCell(withRow, withRow.rows.length - 1, dateCol, iso));
  };
  return (
    <div className="pv-calendar">
      <div className="pv-calendar-nav">
        <button aria-label="Previous month" onClick={() => setAnchor(shiftAnchor(anchor, -1))}>
          ‹
        </button>
        <span className="pv-calendar-title">{`${MONTHS[Number(month) - 1]} ${year}`}</span>
        <button aria-label="Next month" onClick={() => setAnchor(shiftAnchor(anchor, 1))}>
          ›
        </button>
      </div>
      <div className="pv-calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pv-calendar-weekday">
            {d}
          </div>
        ))}
        {weeks.flat().map((cell) => (
          <div
            key={cell.iso}
            className={`pv-calendar-day${cell.inMonth ? '' : ' pv-calendar-day--spill'}`}
          >
            <div className="pv-calendar-daynum">
              {cell.day}
              <button
                className="pv-calendar-add"
                aria-label={`Add on ${cell.iso}`}
                onClick={() => addOn(cell.iso)}
              >
                +
              </button>
            </div>
            {cell.rows.map((r) => (
              <div key={r} className="pv-calendar-event">
                {data.rows[r][0] || 'Untitled'}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
