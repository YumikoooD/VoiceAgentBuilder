// Types for the Agent Builder

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enumValues?: string[]; // For enum types
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  // Webhook configuration for custom tools
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookHeaders?: Record<string, string>;
}

export interface AgentConfig {
  id: string;
  name: string;
  voice: VoiceOption;
  handoffDescription: string;
  instructions: string;
  tools: ToolConfig[];
  handoffs: string[]; // Agent IDs
  createdAt: string;
  updatedAt: string;
  isReadOnly?: boolean;
}

// Voices supported by OpenAI Realtime API (gpt-realtime models)
// Note: fable, onyx, nova are TTS-only and NOT supported by Realtime API
export type VoiceOption = 'sage' | 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'shimmer' | 'verse';

export const VOICE_OPTIONS: { value: VoiceOption; label: string; description: string }[] = [
  { value: 'sage', label: 'Sage', description: 'Calm and wise' },
  { value: 'alloy', label: 'Alloy', description: 'Neutral and balanced' },
  { value: 'ash', label: 'Ash', description: 'Warm and conversational' },
  { value: 'ballad', label: 'Ballad', description: 'Expressive and melodic' },
  { value: 'coral', label: 'Coral', description: 'Friendly and approachable' },
  { value: 'echo', label: 'Echo', description: 'Soft and reflective' },
  { value: 'shimmer', label: 'Shimmer', description: 'Bright and energetic' },
  { value: 'verse', label: 'Verse', description: 'Clear and articulate' },
];

export const PARAMETER_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
] as const;

export function createEmptyAgent(): AgentConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    voice: 'sage',
    handoffDescription: '',
    instructions: '',
    tools: [],
    handoffs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyTool(): ToolConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    parameters: [],
  };
}

export function createEmptyParameter(): ToolParameter {
  return {
    name: '',
    type: 'string',
    description: '',
    required: false,
  };
}

