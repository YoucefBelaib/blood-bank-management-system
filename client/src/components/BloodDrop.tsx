import { motion } from "framer-motion";

interface BloodDropProps {
  size?: number;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function BloodDrop({ size = 20, delay = 0, duration = 2, className = "", style }: BloodDropProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={style}
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: [null, 150],
        opacity: [0, 0.9, 0.9, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeIn",
      }}
    >
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 20 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 0C10 0 0 10 0 16C0 20.4183 4.47715 24 10 24C15.5228 24 20 20.4183 20 16C20 10 10 0 10 0Z"
          fill="url(#bloodGradient)"
        />
        <defs>
          <linearGradient id="bloodGradient" x1="10" y1="0" x2="10" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dc2626" stopOpacity="1" />
            <stop offset="1" stopColor="#991b1b" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

export function BloodDropsAnimation({ fullScreen = false }: { fullScreen?: boolean }) {
  const dropCount = fullScreen ? 25 : 15;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(dropCount)].map((_, i) => (
        <BloodDrop
          key={i}
          size={fullScreen ? Math.random() * 20 + 15 : Math.random() * 15 + 10}
          delay={Math.random() * 5}
          duration={fullScreen ? Math.random() * 4 + 3 : Math.random() * 3 + 2}
          className="left-[var(--drop-left)] top-[var(--drop-top)]"
          style={{ 
            "--drop-left": `${Math.random() * 100}%`,
            "--drop-top": fullScreen ? `${Math.random() * 80}%` : '0%'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
