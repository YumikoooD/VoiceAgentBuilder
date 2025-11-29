'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Wand2, ArrowRight } from 'lucide-react';
import { AgentConfig } from '../types';

interface AIAgentGeneratorProps {
  onGenerated: (agent: AgentConfig) => void;
  onClose: () => void;
}

const EXAMPLE_PROMPTS = [
  "Snowboard shop assistant that helps customers find gear",
  "Personal fitness coach for home workouts",
  "Restaurant booking assistant for a fine dining place",
  "Tech support agent for a SaaS product",
  "Language learning tutor for Spanish",
  "Travel planning assistant for adventure trips",
];

export default function AIAgentGenerator({ onGenerated, onClose }: AIAgentGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate agent');
      }

      if (data.agent) {
        onGenerated(data.agent);
      } else {
        throw new Error('No agent configuration returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl mx-4 bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="px-10 pt-10 pb-2">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-6 shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)] border border-white/5">
              <Wand2 className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-3xl font-light text-white mb-2 tracking-tight">AI Agent Generator</h2>
            <p className="text-white/40 text-sm max-w-md">
              Describe your perfect agent, and our AI will craft the instructions, voice persona, and tools instantly.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="px-10 pb-10">
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-[#111] border border-white/10 rounded-3xl p-2 focus-within:border-neon-cyan/30 focus-within:bg-[#151515] transition-all duration-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A friendly yoga instructor who helps me create daily routines and tracks my progress..."
                rows={3}
                disabled={isGenerating}
                className="w-full px-6 py-4 bg-transparent text-white placeholder-white/20 text-lg font-light focus:outline-none resize-none disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleGenerate();
                  }
                }}
              />
              <div className="flex justify-between items-center px-4 pb-2">
                <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                  POWERED BY GPT-4o
                </div>
                <div className="text-xs text-white/20 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                  ⌘ + Enter
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.slice(0, 4).map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-all disabled:opacity-50"
                >
                  {example.length > 35 ? example.slice(0, 35) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple animate-gradient-x opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-black rounded-2xl group-hover:bg-black/90 transition-colors">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-white font-medium">Crafting your agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-neon-cyan group-hover:rotate-12 transition-transform" />
                  <span className="text-white font-medium text-lg">Generate Agent</span>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>

        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-neon-purple/10 to-transparent opacity-50 blur-3xl pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
