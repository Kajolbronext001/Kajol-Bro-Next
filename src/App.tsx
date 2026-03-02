/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Hash, 
  Power, 
  Maximize2, 
  Clipboard, 
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useTOTP, generateRandomText } from './utils/totp';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isBallActive, setIsBallActive] = useState(false);
  const [isDjLightActive, setIsDjLightActive] = useState(false);
  const [djColor, setDjColor] = useState('#ffffff');
  const [ballSize, setBallSize] = useState(60);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDjLightActive) {
      const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', 
        '#ffffff', '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#88ff00'
      ];
      interval = setInterval(() => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setDjColor(randomColor);
        
        // Vibration sync - short pulse
        if ('vibrate' in navigator) {
          navigator.vibrate(40);
        }
      }, 60); // ~16 colors per second
    } else {
      if ('vibrate' in navigator) {
        navigator.vibrate(0); // Stop vibration
      }
    }
    return () => {
      clearInterval(interval);
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    };
  }, [isDjLightActive]);

  const handleExit = () => {
    if (window.confirm('Exit the application?')) {
      window.close();
      // Fallback if window.close() is blocked
      setIsBallActive(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] relative overflow-hidden">
      {/* DJ Light Overlay */}
      <AnimatePresence>
        {isDjLightActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: djColor }}
            className="fixed inset-0 z-[2000] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Status Indicator for Debugging */}
      <div className="fixed top-4 left-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full z-[100]">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">App Active</span>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Main UI Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl z-[2500]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-500/20 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Floating TOTP</h1>
            <p className="text-white/50 text-sm">Utility Control Center</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Toggle Option */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Power className={cn("w-5 h-5", isBallActive ? "text-emerald-400" : "text-white/30")} />
              <span className="font-medium">Floating Ball</span>
            </div>
            <button 
              onClick={() => setIsBallActive(!isBallActive)}
              className={cn(
                "w-14 h-8 rounded-full transition-colors relative",
                isBallActive ? "bg-emerald-500" : "bg-white/10"
              )}
            >
              <motion.div 
                animate={{ x: isBallActive ? 26 : 4 }}
                className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          {/* Size Control */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-white/50" />
                <span className="font-medium">Ball Size</span>
              </div>
              <span className="text-sm font-mono text-emerald-400">{ballSize}px</span>
            </div>
            <input 
              type="range" 
              min="40" 
              max="120" 
              value={ballSize}
              onChange={(e) => setBallSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* DJ Light Button */}
          <button 
            onClick={() => setIsDjLightActive(!isDjLightActive)}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 border-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
              "bg-black border-white text-red-600 uppercase tracking-tighter",
              isDjLightActive && "animate-pulse scale-105"
            )}
            style={{ zIndex: 3000 }}
          >
            <Zap className={cn("w-6 h-6", isDjLightActive ? "fill-current" : "")} />
            {isDjLightActive ? "STOP DJ LIGHT" : "START DJ LIGHT"}
          </button>

          {/* Exit Button */}
          <button 
            onClick={handleExit}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Exit Application
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono">
            System Alert Window Simulation
          </p>
        </div>
      </motion.div>

      {/* Floating Ball Overlay */}
      <AnimatePresence>
        {isBallActive && (
          <FloatingBall 
            size={ballSize} 
            isMenuOpen={isMenuOpen} 
            setIsMenuOpen={setIsMenuOpen}
            secret={secret}
            setSecret={setSecret}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[1000]",
              toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FloatingBallProps {
  size: number;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  secret: string | null;
  setSecret: (secret: string | null) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

function FloatingBall({ size, isMenuOpen, setIsMenuOpen, secret, setSecret, showToast }: FloatingBallProps) {
  const constraintsRef = useRef(null);
  const { code, timeLeft } = useTOTP(secret);

  const handleReadClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        showToast('Clipboard API not supported', 'error');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text && text.length > 4) {
        setSecret(text.trim());
        showToast('Secret loaded from clipboard');
      } else {
        showToast('Invalid secret in clipboard', 'error');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      showToast('Clipboard access denied. Please allow permissions.', 'error');
    }
  };

  const handleCopyTOTP = () => {
    if (code === '------' || code === 'INVALID') {
      showToast('No valid code to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(code);
    showToast('TOTP copied to clipboard');
  };

  const handleRandomText = () => {
    const random = generateRandomText();
    navigator.clipboard.writeText(random);
    showToast(`Copied: ${random}`);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]" ref={constraintsRef}>
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        className="pointer-events-auto absolute"
        style={{ width: size, height: size, left: '20px', top: '20px' }}
      >
        {/* The Ball */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full h-full rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center relative z-20 border-2 border-white/20"
        >
          <ShieldCheck className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
          
          {/* Pulse animation when active */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-emerald-400 -z-10"
          />
        </motion.button>

        {/* Expandable Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
                className="absolute left-full ml-4 top-0 w-72 glass rounded-3xl p-5 shadow-2xl z-30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-white/50">Utility Menu</h3>
                  <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* TOTP Section */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">TOTP GENERATOR</span>
                      </div>
                      <div className="relative w-6 h-6">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            className="text-white/10"
                          />
                          <motion.circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            strokeDasharray="62.8"
                            animate={{ strokeDashoffset: 62.8 - (62.8 * timeLeft) / 30 }}
                            className="text-emerald-400"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono">
                          {timeLeft}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="text-3xl font-mono font-bold tracking-[0.2em] text-emerald-400">
                        {code}
                      </div>
                      <div className="flex w-full gap-2">
                        <button 
                          onClick={handleReadClipboard}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Clipboard className="w-3 h-3" />
                          READ SECRET
                        </button>
                        <button 
                          onClick={handleCopyTOTP}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Clipboard className="w-3 h-3" />
                          COPY CODE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Random Text Section */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">RANDOM TEXT (6-12)</span>
                    </div>
                    <button 
                      onClick={handleRandomText}
                      className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Hash className="w-4 h-4" />
                      GENERATE & COPY
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
