import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Laptop,
  Guitar,
  Music,
  Code,
  Paintbrush,
  UtensilsCrossed,
  BookOpen,
  Camera,
  Dumbbell,
  Palette,
  Languages,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Target,
  Zap,
} from 'lucide-react';

const skillIcons = [
  { Icon: Laptop, label: 'Technology' },
  { Icon: Guitar, label: 'Music' },
  { Icon: Target, label: 'Sports' },
  { Icon: Music, label: 'Music' },
  { Icon: Code, label: 'Programming' },
  { Icon: Paintbrush, label: 'Art' },
  { Icon: UtensilsCrossed, label: 'Cooking' },
  { Icon: BookOpen, label: 'Education' },
  { Icon: Camera, label: 'Photography' },
  { Icon: Dumbbell, label: 'Fitness' },
  { Icon: Palette, label: 'Design' },
  { Icon: Languages, label: 'Languages' },
  { Icon: Gamepad2, label: 'Gaming' },
  { Icon: GraduationCap, label: 'Learning' },
  { Icon: Briefcase, label: 'Business' },
  { Icon: Zap, label: 'Skills' },
];

interface FloatingIconProps {
  Icon: React.ComponentType<{ className?: string }>;
  index: number;
  mouseX: number;
  mouseY: number;
}

function FloatingIcon({ Icon, index, mouseX, mouseY }: FloatingIconProps) {
  const [position, setPosition] = useState(() => ({
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
  }));

  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  const springConfig = { damping: 30, stiffness: 50 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  useEffect(() => {
    let animationFrame: number;
    
    const updatePosition = () => {
      // Calculate distance from mouse to icon
      const dx = mouseX - position.x;
      const dy = mouseY - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // React to mouse movement - icons move away from cursor
      const maxDistance = 250;
      const influence = Math.max(0, 1 - distance / maxDistance);
      
      // Base floating movement
      const time = Date.now() * 0.0005;
      const floatX = Math.sin(time + index) * 2;
      const floatY = Math.cos(time + index * 0.7) * 2;
      
      // Mouse repulsion effect
      const repulsionStrength = influence * 15;
      const angle = Math.atan2(dy, dx);
      const repulseX = -Math.cos(angle) * repulsionStrength;
      const repulseY = -Math.sin(angle) * repulsionStrength;
      
      // Calculate new position
      const newX = position.x + floatX + repulseX;
      const newY = position.y + floatY + repulseY;
      
      // Keep icons within bounds with padding
      const padding = 60;
      const boundedX = Math.max(padding, Math.min(window.innerWidth - padding, newX));
      const boundedY = Math.max(padding, Math.min(window.innerHeight - padding, newY));
      
      setPosition({ x: boundedX, y: boundedY });
      
      animationFrame = requestAnimationFrame(updatePosition);
    };

    animationFrame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrame);
  }, [mouseX, mouseY, index]);

  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position, x, y]);

  // Calculate rotation based on mouse position
  const rotation = Math.atan2(
    position.y - mouseY,
    position.x - mouseX
  ) * (180 / Math.PI);

  // Size and opacity vary per icon for visual interest
  const size = 28 + (index % 4) * 6;
  const opacity = 0.12 + (index % 5) * 0.04;

  return (
    <motion.div
      style={{
        x: xSpring,
        y: ySpring,
        rotate: rotation + 90,
      }}
      className="absolute pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity,
        scale: 1,
      }}
      transition={{
        duration: 1.5,
        delay: index * 0.08,
        ease: "easeOut",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          filter: 'drop-shadow(0 0 10px rgba(72, 240, 184, 0.2))',
        }}
        className="text-white/20 transition-opacity duration-300"
      >
        <Icon className="w-full h-full" />
      </div>
    </motion.div>
  );
}

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Number of icons based on screen size
  const [iconCount, setIconCount] = useState(15);

  useEffect(() => {
    const updateIconCount = () => {
      const count = typeof window !== 'undefined' 
        ? Math.min(18, Math.floor((window.innerWidth * window.innerHeight) / 60000))
        : 15;
      setIconCount(count);
    };

    updateIconCount();
    window.addEventListener('resize', updateIconCount);
    return () => window.removeEventListener('resize', updateIconCount);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: 'transparent',
      }}
    >
      {skillIcons.slice(0, iconCount).map((skill, index) => (
        <FloatingIcon
          key={`${skill.label}-${index}`}
          Icon={skill.Icon}
          index={index}
          mouseX={mousePosition.x}
          mouseY={mousePosition.y}
        />
      ))}
    </div>
  );
}

