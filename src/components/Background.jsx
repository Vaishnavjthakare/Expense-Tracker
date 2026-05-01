import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Background() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="animated-bg">
      {/* Moving gradient background */}
      <div className="gradient-bg"></div>
      
      {/* Dynamic Grid Pattern */}
      <div className="grid-pattern"></div>
      
      {/* Interactive cursor glow */}
      <motion.div 
        className="cursor-glow"
        animate={{ 
          x: mousePosition.x - 400, 
          y: mousePosition.y - 400 
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.8 }}
      />
    </div>
  );
}
