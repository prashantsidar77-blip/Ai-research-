import React, { useEffect, useRef } from 'react';

interface ArcReactorProps {
  size?: number;
  isActive?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  rmsLevel?: number;
  onClick?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  size = 140,
  isActive = true,
  isSpeaking = false,
  isListening = false,
  rmsLevel = 0,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleOuter = 0;
    let angleInner = 0;
    let pulseAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = (canvas.width / 2) * 0.88;

      angleOuter += isSpeaking ? 0.04 : 0.015;
      angleInner -= isSpeaking ? 0.05 : 0.02;
      pulseAngle += isSpeaking ? 0.12 : 0.04;

      const dynamicRms = Math.min(rmsLevel * 0.4, 0.3);
      const pulseScale = 1 + Math.sin(pulseAngle) * (isSpeaking ? 0.12 : 0.05) + dynamicRms;

      // Outer radial glow
      const glowGrad = ctx.createRadialGradient(cx, cy, maxR * 0.2, cx, cy, maxR * pulseScale);
      glowGrad.addColorStop(0, isListening ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 210, 255, 0.3)');
      glowGrad.addColorStop(0.6, isSpeaking ? 'rgba(7, 91, 206, 0.25)' : 'rgba(7, 91, 206, 0.15)');
      glowGrad.addColorStop(1, 'rgba(5, 8, 17, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Outer dashed ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleOuter);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([16, 12, 6, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Outer ticks
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleOuter * 0.5);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 16; i++) {
        const theta = (i * Math.PI * 2) / 16;
        const x1 = Math.cos(theta) * (maxR * 0.78);
        const y1 = Math.sin(theta) * (maxR * 0.78);
        const x2 = Math.cos(theta) * (maxR * 0.86);
        const y2 = Math.sin(theta) * (maxR * 0.86);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // Inner reversed rotating segmented ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleInner);
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([28, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner circular core
      const coreR = maxR * 0.38 * pulseScale;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#00f0ff');
      coreGrad.addColorStop(0.7, '#075bce');
      coreGrad.addColorStop(1, 'rgba(7, 91, 206, 0.5)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Center bright reactor dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.12 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, isSpeaking, isListening, rmsLevel]);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center select-none cursor-pointer group"
      style={{ width: size, height: size }}
      title="JARVIS Arc Reactor Core"
    >
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        className="w-full h-full transform transition-transform group-hover:scale-105"
      />
    </div>
  );
};
