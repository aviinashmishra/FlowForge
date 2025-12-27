'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthFormContainer({ 
  children, 
  title, 
  subtitle, 
  className = '' 
}: AuthFormContainerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Outer glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-2xl opacity-0"
          animate={{
            opacity: isHovered ? 0.6 : 0.3,
          }}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
            backgroundSize: '300% 300%',
            filter: 'blur(20px)',
          }}
        >
          <motion.div
            className="w-full h-full"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
              backgroundSize: '300% 300%',
            }}
          />
        </motion.div>

        {/* Main container */}
        <motion.div
          className="relative backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          whileHover={{
            scale: 1.02,
            rotateX: 2,
            rotateY: 2,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-50"
            animate={{
              background: [
                'linear-gradient(0deg, #3b82f6, #8b5cf6)',
                'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                'linear-gradient(180deg, #06b6d4, #3b82f6)',
                'linear-gradient(270deg, #3b82f6, #8b5cf6)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              padding: '1px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.h1
                className="text-3xl font-bold text-white mb-2"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
                }}
              >
                {title}
              </motion.h1>
              
              <AnimatePresence>
                {subtitle && (
                  <motion.p
                    className="text-gray-300 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Form Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              ],
              backgroundPosition: ['-100% -100%', '100% 100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}