'use client';

interface Statistics {
  inventoryCount: number;
  basicInventoryCount: number;
  adaptedRecipesCount: number;
}

interface StatisticsSectionProps {
  statistics: Statistics;
}

export default function StatisticsSection({ statistics }: StatisticsSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-[#2B2B2B] mb-3">Statistieken</h2>
      <div className="grid grid-cols-3 gap-3">
        {/* Inventory Count */}
        <div className="rounded-xl bg-white border border-[#E5E5E0] p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#1F6F54]"
            >
              <path
                d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-[#1F6F54] mb-1">
            {statistics.inventoryCount}
          </p>
          <p className="text-xs text-[#2B2B2B]/60">Producten</p>
        </div>

        {/* Basic Inventory Count */}
        <div className="rounded-xl bg-white border border-[#E5E5E0] p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#1F6F54]"
            >
              <path
                d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 21V11C16 10.4477 15.5523 10 15 10H9C8.44772 10 8 10.4477 8 11V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-[#1F6F54] mb-1">
            {statistics.basicInventoryCount}
          </p>
          <p className="text-xs text-[#2B2B2B]/60">Basis</p>
        </div>

        {/* Adapted Recipes Count */}
        <div className="rounded-xl bg-white border border-[#E5E5E0] p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#1F6F54]"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-[#1F6F54] mb-1">
            {statistics.adaptedRecipesCount}
          </p>
          <p className="text-xs text-[#2B2B2B]/60">AI Recepten</p>
        </div>
      </div>
    </div>
  );
}
