'use client';

interface ProfileHeaderProps {
  name: string | null;
  email: string | null;
  onEditName: () => void;
}

export default function ProfileHeader({ name, email, onEditName }: ProfileHeaderProps) {
  const displayName = name || email || 'Gebruiker';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1F6F54]">Profiel</h1>
      </div>

      <div className="rounded-xl bg-white border border-[#E5E5E0] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#2B2B2B] mb-1">
              {displayName}
            </h2>
            {email && (
              <p className="text-sm text-[#2B2B2B]/60">{email}</p>
            )}
          </div>
          <button
            onClick={onEditName}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5E5E0] hover:bg-[#D5D5D0] transition-colors"
            aria-label="Naam bewerken"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2B2B2B]"
            >
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
