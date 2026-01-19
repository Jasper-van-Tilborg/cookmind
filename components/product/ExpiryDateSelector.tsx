'use client';

interface ExpiryDateSelectorProps {
  day: number | null;
  month: number | null;
  year: number | null;
  onDayChange: (day: number | null) => void;
  onMonthChange: (month: number | null) => void;
  onYearChange: (year: number | null) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  'Januari',
  'Februari',
  'Maart',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Augustus',
  'September',
  'Oktober',
  'November',
  'December',
];
const YEARS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);

export default function ExpiryDateSelector({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
}: ExpiryDateSelectorProps) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-[#2B2B2B]">
        Houdbaarheidsdatum
      </h3>
      <div className="flex gap-2">
        {/* Day selector */}
        <div className="flex-1">
          <select
            value={day || ''}
            onChange={(e) => onDayChange(e.target.value ? parseInt(e.target.value) : null)}
            className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-sm text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
          >
            <option value="">Dag</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* Month selector */}
        <div className="flex-1">
          <select
            value={month !== null ? month : ''}
            onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
            className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-sm text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
          >
            <option value="">Maand</option>
            {MONTHS.map((m, index) => (
              <option key={index} value={index + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Year selector */}
        <div className="flex-1">
          <select
            value={year || ''}
            onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
            className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-sm text-[#2B2B2B] focus:border-[#1F6F54] focus:outline-none"
          >
            <option value="">Jaar</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
