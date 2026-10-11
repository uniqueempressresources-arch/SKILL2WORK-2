export interface AiRequest {
  userId: string;
  feature: 'career_coach' | 'cv_improvement' | 'skill_gap';
  input: string;
}

export interface AiResponse {
  text: string;
  provider: string;
  model: string;
}

export async function runAi(request: AiRequest): Promise<AiResponse> {
  if (process.env.AI_ENABLED !== 'true') {
    return {
      text: 'AI is currently unavailable. You can continue with the non-AI Skill2Work workflow.',
      provider: 'fallback',
      model: 'none',
    };
  }

  // Provider-specific implementation intentionally stays behind this adapter.
  // Add quota checks, token limits, timeout, cost logging and feature flags before enabling production calls.
  void request;
  return {
    text: 'AI provider adapter is configured but no provider call has been enabled yet.',
    provider: process.env.AI_PROVIDER ?? 'unset',
    model: process.env.AI_MODEL ?? 'unset',
  };
}
