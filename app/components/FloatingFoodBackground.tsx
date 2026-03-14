'use client';

import { motion } from 'framer-motion';
import { Pizza, Coffee, Utensils, Croissant, Carrot, Sandwich, IceCream } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingFoodBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const icons = [
    { Icon: Pizza, color: 'text-amber-300/30' },
    { Icon: Coffee, color: 'text-stone-300/40' },
    { Icon: Utensils, color: 'text-amber-200/35' },
    { Icon: Croissant, color: 'text-yellow-200/40' },
    { Icon: Carrot, color: 'text-orange-200/35' },
    { Icon: Sandwich, color: 'text-emerald-200/30' },
    { Icon: IceCream, color: 'text-rose-200/35' },
  ];

  // Generate random positions
  const items = Array.from({ length: 15 }).map((_, i) => {
    const IconData = icons[i % icons.length];
    return {
      id: i,
      Icon: IconData.Icon,
      color: IconData.color,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
    };
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={`absolute ${item.color}`}
          style={{ top: item.top, left: item.left }}
          animate={{
            y: [0, -50, 0],
            rotate: [0, 20, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon size={40 + Math.random() * 40} />
        </motion.div>
      ))}
    </div>
  );
}
