'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Image from 'next/image';

export interface InventoryItem {
  id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit: string;
  details?: string;
  ingredient_tag?: string | null;
  expiry_date?: string | null;
}

interface ProductCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
}

const SWIPE_THRESHOLD = 100;

export default function ProductCard({ item, onEdit, onDelete }: ProductCardProps) {
  const router = useRouter();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const viewOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      // Swipe left - Delete
      setSwipeDirection('left');
      setTimeout(() => {
        onDelete(item.id);
        setSwipeDirection(null);
        x.set(0);
      }, 200);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      // Swipe right - Navigate to product page
      setSwipeDirection('right');
      setTimeout(() => {
        // Navigate to product page using product name
        const productId = encodeURIComponent(item.product_name);
        router.push(`/product/${productId}`);
        setSwipeDirection(null);
        x.set(0);
      }, 200);
    } else {
      // Snap back
      x.set(0);
      setSwipeDirection(null);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="relative mb-3 overflow-hidden rounded-xl">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        {/* Delete Action (Left - Red) */}
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="flex flex-1 items-center justify-end bg-red-500 pr-6"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* View Product Action (Right - Green) */}
        <motion.div
          style={{ opacity: viewOpacity }}
          className="flex flex-1 items-center justify-start bg-[#1F6F54] pl-6"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* Product Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={{
          x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
          opacity: swipeDirection ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex items-center gap-4 rounded-xl bg-[#E5E5E0] p-4"
      >
        {/* Product Image */}
        <div className="shrink-0">
          {item.product_image ? (
            <Image
              src={item.product_image}
              alt={item.product_name}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-[#9FC5B5]">
              <svg
                width="30"
                height="30"
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
          )}
        </div>

        {/* Product Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[#2B2B2B]">
              {item.product_name}
            </h3>
            {!item.ingredient_tag && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="shrink-0 rounded-full bg-yellow-100 p-1 transition-colors hover:bg-yellow-200"
                aria-label="Tag ontbreekt - klik om toe te voegen"
                title="Tag ontbreekt - klik om toe te voegen"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-yellow-600"
                >
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 text-sm font-medium text-[#1F6F54]">
              {item.quantity} {item.unit}
            </span>
            {item.details && (
              <>
                <span className="shrink-0 text-sm text-[#2B2B2B]/60">•</span>
                <span className="truncate text-sm text-[#2B2B2B]/80">
                  {item.details}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Three Dots Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            className="p-2"
            aria-label="Meer opties"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
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
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                fill="currentColor"
              />
              <path
                d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                fill="currentColor"
              />
              <path
                d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg bg-white shadow-lg border border-[#E5E5E0] overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit(item);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[#2B2B2B] transition-colors hover:bg-[#E5E5E0]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#1F6F54]"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Tag bewerken</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
