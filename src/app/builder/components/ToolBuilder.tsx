'use client';

import React, { useState } from 'react';
import { ToolConfig, ToolParameter, PARAMETER_TYPES, createEmptyParameter } from '../types';
import { ChevronRight, X, Plus } from 'lucide-react';

interface ToolBuilderProps {
  tool: ToolConfig;
  index: number;
  errors: Record<string, string>;
  onChange: (tool: ToolConfig) => void;
  onDelete: () => void;
}

export default function ToolBuilder({ tool, index, errors, onChange, onDelete }: ToolBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateTool = (updates: Partial<ToolConfig>) => {
    onChange({ ...tool, ...updates });
  };

  const addParameter = () => {
    updateTool({
      parameters: [...tool.parameters, createEmptyParameter()],
    });
  };

  const updateParameter = (paramIndex: number, updates: Partial<ToolParameter>) => {
    const newParams = [...tool.parameters];
    newParams[paramIndex] = { ...newParams[paramIndex], ...updates };
    updateTool({ parameters: newParams });
  };

  const deleteParameter = (paramIndex: number) => {
    updateTool({
      parameters: tool.parameters.filter((_, i) => i !== paramIndex),
    });
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20">
      {/* Tool Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
          />
          <span className="text-white font-medium text-sm tracking-wide">
            {tool.name || `Tool ${index + 1}`}
          </span>
          {tool.parameters.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white/60 rounded-full font-mono">
              {tool.parameters.length} param{tool.parameters.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tool Content */}
      {isExpanded && (
        <div className="p-5 space-y-6 border-t border-white/5">
          {/* Tool Name */}
          <div>
            <label className="block text-xs font-light text-white/40 mb-2 uppercase tracking-wider">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={tool.name}
              onChange={(e) => updateTool({ name: e.target.value })}
              placeholder="e.g., search_products"
              className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all font-mono ${
                errors[`tool_${index}_name`] ? 'border-red-500/50' : 'border-white/10'
              }`}
            />
            {errors[`tool_${index}_name`] && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors[`tool_${index}_name`]}
              </p>
            )}
          </div>

          {/* Tool Description */}
          <div>
            <label className="block text-xs font-light text-white/40 mb-2 uppercase tracking-wider">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={tool.description}
              onChange={(e) => updateTool({ description: e.target.value })}
              placeholder="Describe what this tool does and when it should be used..."
              rows={2}
              className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all resize-none ${
                errors[`tool_${index}_description`] ? 'border-red-500/50' : 'border-white/10'
              }`}
            />
            {errors[`tool_${index}_description`] && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors[`tool_${index}_description`]}
              </p>
            )}
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-light text-white/40 uppercase tracking-wider">
                Parameters
              </label>
              <button
                onClick={addParameter}
                className="flex items-center gap-1.5 text-xs font-medium text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Parameter
              </button>
            </div>

            {tool.parameters.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.02] rounded-lg border border-dashed border-white/10">
                <p className="text-xs text-white/30">No parameters defined</p>
                <button
                  onClick={addParameter}
                  className="mt-2 text-xs text-neon-cyan hover:underline"
                >
                  Add a parameter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tool.parameters.map((param, paramIndex) => (
                  <ParameterRow
                    key={paramIndex}
                    parameter={param}
                    onChange={(updates) => updateParameter(paramIndex, updates)}
                    onDelete={() => deleteParameter(paramIndex)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ParameterRowProps {
  parameter: ToolParameter;
  onChange: (updates: Partial<ToolParameter>) => void;
  onDelete: () => void;
}

function ParameterRow({ parameter, onChange, onDelete }: ParameterRowProps) {
  return (
    <div className="grid grid-cols-[1fr_120px_2fr_auto] gap-3 items-start p-3 bg-white/[0.03] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
      {/* Parameter Name */}
      <input
        type="text"
        value={parameter.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="name"
        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-black/60 font-mono"
      />

      {/* Parameter Type */}
      <div className="relative">
        <select
          value={parameter.type}
          onChange={(e) => onChange({ type: e.target.value as ToolParameter['type'] })}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs focus:outline-none focus:border-white/20 focus:bg-black/60 appearance-none cursor-pointer"
        >
          {PARAMETER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronRight className="w-3 h-3 text-white/20 rotate-90" />
        </div>
      </div>

      {/* Description */}
      <input
        type="text"
        value={parameter.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description"
        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-black/60"
      />

      {/* Actions */}
      <div className="flex items-center gap-3 h-full pt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            parameter.required 
              ? 'bg-neon-cyan border-neon-cyan' 
              : 'bg-transparent border-white/20 group-hover:border-white/40'
          }`}>
            {parameter.required && <div className="w-2 h-2 bg-black rounded-sm" />}
          </div>
          <input
            type="checkbox"
            checked={parameter.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="hidden"
          />
          <span className="text-[10px] text-white/40 group-hover:text-white/60 uppercase tracking-wide">Req</span>
        </label>

        <button
          onClick={onDelete}
          className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

