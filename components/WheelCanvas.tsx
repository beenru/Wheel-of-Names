
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getSegmentColor } from '../utils/colors';

interface WheelCanvasProps {
  items: string[];
  onFinished: (winner: string) => void;
  isSpinning: boolean;
  setIsSpinning: (state: boolean) => void;
}

export interface WheelRef {
  spin: () => void;
}

const WheelCanvas = forwardRef<WheelRef, WheelCanvasProps>(({ items, onFinished, isSpinning, setIsSpinning }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics state stored in refs to avoid re-renders during animation loop
  const stateRef = useRef({
    angle: 0, // Current rotation angle in radians
    startAngle: 0,
    targetAngle: 0,
    startTime: 0,
    duration: 5000, // Fixed 5 seconds duration
    isSpinningInternal: false,
  });

  // Handle Resize
  const [size, setSize] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const dim = Math.min(width, height);
        setSize(dim);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Expose spin method
  useImperativeHandle(ref, () => ({
    spin: () => {
      if (stateRef.current.isSpinningInternal || items.length === 0) return;
      
      const now = performance.now();
      stateRef.current.startTime = now;
      stateRef.current.startAngle = stateRef.current.angle;
      stateRef.current.duration = 5000;
      stateRef.current.isSpinningInternal = true;
      
      // Calculate target angle
      // Minimum 5 full spins (10PI) + random additional spins + random final offset
      const rotations = 5 + Math.random() * 5; // 5 to 10 rotations
      const extraAngle = Math.random() * 2 * Math.PI; 
      
      stateRef.current.targetAngle = stateRef.current.startAngle + (rotations * 2 * Math.PI) + extraAngle;
      
      setIsSpinning(true);
    }
  }));

  // Drawing & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size === 0 || items.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    
    // Config
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 14; // Margin for border
    const arcSize = (2 * Math.PI) / items.length;

    // Performance optimizations
    const shouldRenderText = items.length <= 200; 
    const skipStroke = items.length > 500; // Skip borders for very large lists to improve FPS

    const render = (now: number) => {
      // Clear
      ctx.clearRect(0, 0, size, size);

      // Time-based Physics Update
      if (stateRef.current.isSpinningInternal) {
        const elapsed = now - stateRef.current.startTime;
        
        if (elapsed >= stateRef.current.duration) {
          // Finish Spin
          stateRef.current.angle = stateRef.current.targetAngle;
          stateRef.current.isSpinningInternal = false;
          setIsSpinning(false);
          
          const normalizedAngle = stateRef.current.angle % (2 * Math.PI);
          const rotationOffset = (2 * Math.PI) - normalizedAngle;
          // Calculate index safely handling modulo negative or large numbers
          const winningIndex = (Math.floor(rotationOffset / arcSize) % items.length + items.length) % items.length;
          
          onFinished(items[winningIndex]);
        } else {
          // Easing Function: Quartic Ease Out (Fast start, slow end)
          const t = elapsed / stateRef.current.duration;
          const ease = 1 - Math.pow(1 - t, 4);
          
          stateRef.current.angle = stateRef.current.startAngle + 
            (stateRef.current.targetAngle - stateRef.current.startAngle) * ease;
        }
      }

      // Draw Outer Glow
      ctx.save();
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();
      ctx.restore();

      // Draw Segments
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(stateRef.current.angle);

      items.forEach((item, i) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * arcSize, (i + 1) * arcSize);
        ctx.fillStyle = getSegmentColor(i, items.length);
        ctx.fill();
        
        if (!skipStroke) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Text
        if (shouldRenderText) {
          ctx.save();
          ctx.rotate(i * arcSize + arcSize / 2);
          
          const fontSize = Math.max(10, Math.min(24, 400 / items.length)); 
          ctx.font = `600 ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'white';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 2;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          
          const textRadius = radius - 20;
          ctx.fillText(item.substring(0, 20) + (item.length > 20 ? '...' : ''), textRadius, 0);
          
          ctx.restore();
        }
      });

      // Draw Center Circle (Hub) - Snowy
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.15, 0, 2 * Math.PI);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Restore rotation
      ctx.restore();

      // Draw Festive Border Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#fbbf24'; // Gold
      ctx.stroke();
      
      // Inner thin border
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 4, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff'; // White accent
      ctx.stroke();

      // Loop
      if (stateRef.current.isSpinningInternal) {
        requestAnimationFrame(render);
      }
    };

    const rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [items, size, onFinished, setIsSpinning, isSpinning]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
    >
      <div style={{ width: size, height: size }} className="relative flex-shrink-0 z-10">
        <canvas 
          ref={canvasRef} 
          style={{ width: size, height: size }}
        />
        {/* Golden Indicator */}
        <div 
          className="absolute top-1/2 -right-4 -translate-y-1/2 w-0 h-0 border-t-[25px] border-t-transparent border-b-[25px] border-b-transparent border-r-[40px] border-r-yellow-400 filter drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
        ></div>
        {/* Indicator accent dot */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md"></div>
      </div>
    </div>
  );
});

WheelCanvas.displayName = 'WheelCanvas';

export default WheelCanvas;
