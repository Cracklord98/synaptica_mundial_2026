"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string; // ISO date string
  title?: string;
}

export default function CountdownTimer({ targetDate, title = "Definición de Cruces Oficiales en" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [hasPassed, setHasPassed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setHasPassed(true);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted || hasPassed) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#1A2B3C] to-[#0A0A0A] border border-[#D4AF37]/50 rounded-xl p-4 mb-6 relative overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.1)]"
    >
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-300 font-semibold uppercase tracking-wider">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">Se revelarán los clasificados de la fase de grupos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Days */}
          <div className="flex flex-col items-center bg-[#0A0A0A] border border-[#1A2B3C] rounded-lg min-w-[60px] p-2">
            <span className="text-2xl font-black text-[#D4AF37] tabular-nums leading-none">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Días</span>
          </div>
          <span className="text-gray-600 font-bold">:</span>
          {/* Hours */}
          <div className="flex flex-col items-center bg-[#0A0A0A] border border-[#1A2B3C] rounded-lg min-w-[60px] p-2">
            <span className="text-2xl font-black text-white tabular-nums leading-none">
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Hrs</span>
          </div>
          <span className="text-gray-600 font-bold">:</span>
          {/* Minutes */}
          <div className="flex flex-col items-center bg-[#0A0A0A] border border-[#1A2B3C] rounded-lg min-w-[60px] p-2">
            <span className="text-2xl font-black text-white tabular-nums leading-none">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Min</span>
          </div>
          <span className="text-gray-600 font-bold">:</span>
          {/* Seconds */}
          <div className="flex flex-col items-center bg-[#0A0A0A] border border-[#1A2B3C] rounded-lg min-w-[60px] p-2">
            <span className="text-2xl font-black text-[#00B894] tabular-nums leading-none">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Seg</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
