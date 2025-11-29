import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert at creating voice agent configurations. Given a user's description of what kind of agent they want, you generate a complete, production-ready agent configuration.

Your response must be a valid JSON object with this exact structure:
{
  "name": "agentName (camelCase, no spaces)",
  "voice": "one of: sage, alloy, echo, fable, onyx, shimmer",
  "handoffDescription": "A brief description of what this agent handles (1-2 sentences)",
  "instructions": "Detailed instructions for the agent including personality, capabilities, guidelines, and example interactions (use markdown formatting)",
  "tools": [
    {
      "name": "tool_name_snake_case",
      "description": "What this tool does",
      "parameters": [
        {
          "name": "param_name",
          "type": "string | number | boolean",
          "description": "What this parameter is for",
          "required": true or false
        }
      ]
    }
  ]
}

Guidelines for generating agents:
1. **Name**: Use camelCase, descriptive but concise (e.g., "snowboardShopAssistant")
2. **Voice**: Choose based on personality:
   - sage: Calm, wise, professional
   - alloy: Neutral, balanced
   - echo: Soft, reflective
   - fable: Warm, narrative, friendly
   - onyx: Deep, authoritative
   - shimmer: Bright, energetic
3. **Instructions**: Be detailed! Include:
   - Personality and tone section
   - Core responsibilities
   - Guidelines for behavior
   - Example interactions
   - What NOT to do
4. **Tools**: Create 2-5 relevant tools that would be useful for this agent. Be creative but practical.

Example for "snowboard shop assistant":
- Tools: check_inventory, get_product_recommendations, check_weather_conditions, book_lesson, get_sizing_guide

Always respond with ONLY the JSON object, no markdown code blocks or extra text.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create a voice agent for: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let agentConfig;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      agentConfig = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: content },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!agentConfig.name || !agentConfig.instructions) {
      return NextResponse.json(
        { error: 'Invalid agent configuration', config: agentConfig },
        { status: 500 }
      );
    }

    // Add default values and IDs
    const finalConfig = {
      id: crypto.randomUUID(),
      name: agentConfig.name,
      voice: agentConfig.voice || 'sage',
      handoffDescription: agentConfig.handoffDescription || '',
      instructions: agentConfig.instructions,
      tools: (agentConfig.tools || []).map((tool: any) => ({
        id: crypto.randomUUID(),
        name: tool.name,
        description: tool.description || '',
        parameters: (tool.parameters || []).map((param: any) => ({
          name: param.name,
          type: param.type || 'string',
          description: param.description || '',
          required: param.required ?? false
        }))
      })),
      handoffs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ agent: finalConfig });
  } catch (error) {
    console.error('Generate agent error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate agent' },
      { status: 500 }
    );
  }
}

