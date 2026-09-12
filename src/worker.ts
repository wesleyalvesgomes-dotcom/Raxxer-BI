import {
  callGeminiREST,
  buildChatPrompt,
  buildOnboardingPrompt,
  buildPrioritiesPrompt,
  buildExtractMemoryPrompt,
  buildWeeklyReviewPrompt,
  CHAT_RESPONSE_SCHEMA,
  ONBOARDING_RESPONSE_SCHEMA,
  EXTRACT_MEMORY_RESPONSE_SCHEMA,
  WEEKLY_REVIEW_RESPONSE_SCHEMA,
} from './lib/raxxerPrompts';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API Routes Handler
    if (url.pathname.startsWith('/api/')) {
      const apiKey = env.GEMINI_API_KEY;

      const jsonResponse = (data: any, status = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      };

      if (url.pathname === '/api/health') {
        return jsonResponse({ status: 'ok', runtime: 'cloudflare-worker' });
      }

      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Método não permitido. Utilize POST.' }, 405);
      }

      if (!apiKey) {
        return jsonResponse(
          {
            error:
              'Não consegui conectar à inteligência do RAXXER. A variável/secret GEMINI_API_KEY não foi configurada no Cloudflare Worker.',
          },
          500
        );
      }

      try {
        const body = (await request.json().catch(() => ({}))) as any;

        // 1. Chat Principal do Secretário RAXXER
        if (url.pathname === '/api/ai/chat') {
          const { message, profile, memories, goals, tasks, dailyHistory, chatHistory } = body;
          if (!message || typeof message !== 'string') {
            return jsonResponse({ error: 'O campo "message" é obrigatório.' }, 400);
          }

          const prompt = buildChatPrompt({
            message,
            profile,
            memories,
            goals,
            tasks,
            dailyHistory,
            chatHistory,
          });

          const rawResponse = await callGeminiREST({
            apiKey,
            prompt,
            responseMimeType: 'application/json',
            responseSchema: CHAT_RESPONSE_SCHEMA,
          });

          let text = rawResponse;
          let actions: any[] = [];

          try {
            const parsed = JSON.parse(rawResponse);
            if (parsed.text) text = parsed.text;
            if (Array.isArray(parsed.actions)) actions = parsed.actions;
          } catch {
            // Se não for JSON estrito, o texto bruto é mantido
          }

          return jsonResponse({ text, actions });
        }

        // 2. Resumo de Onboarding
        if (url.pathname === '/api/ai/onboarding-summary') {
          const { profileAnswers } = body;
          const prompt = buildOnboardingPrompt(profileAnswers || {});

          const rawResponse = await callGeminiREST({
            apiKey,
            prompt,
            responseMimeType: 'application/json',
            responseSchema: ONBOARDING_RESPONSE_SCHEMA,
          });

          const parsed = JSON.parse(rawResponse || '{}');
          return jsonResponse(parsed);
        }

        // 3. Análise de Prioridades do Dia
        if (url.pathname === '/api/ai/priorities') {
          const { profile, tasks, goals, memories } = body;
          const prompt = buildPrioritiesPrompt({ profile, tasks, goals, memories });

          const rawResponse = await callGeminiREST({
            apiKey,
            prompt,
          });

          return jsonResponse({ answer: rawResponse });
        }

        // 4. Extração de Memória
        if (url.pathname === '/api/ai/extract-memory') {
          const { inputStatement } = body;
          const prompt = buildExtractMemoryPrompt(inputStatement || '');

          const rawResponse = await callGeminiREST({
            apiKey,
            prompt,
            responseMimeType: 'application/json',
            responseSchema: EXTRACT_MEMORY_RESPONSE_SCHEMA,
          });

          const parsed = JSON.parse(rawResponse || '{}');
          return jsonResponse(parsed);
        }

        // 5. Relatório / Revisão Semanal
        if (url.pathname === '/api/ai/weekly-review') {
          const { completedTasks, pendingTasks, goals, memories, weekName } = body;
          const prompt = buildWeeklyReviewPrompt({
            completedTasks,
            pendingTasks,
            goals,
            memories,
            weekName,
          });

          const rawResponse = await callGeminiREST({
            apiKey,
            prompt,
            responseMimeType: 'application/json',
            responseSchema: WEEKLY_REVIEW_RESPONSE_SCHEMA,
          });

          const parsed = JSON.parse(rawResponse || '{}');
          return jsonResponse(parsed);
        }

        return jsonResponse({ error: 'Endpoint não encontrado.' }, 404);
      } catch (err: any) {
        console.error('Erro no Worker RAXXER:', err);
        return jsonResponse(
          {
            error: `Erro ao comunicar com a Gemini API: ${err.message || 'Falha desconhecida.'}`,
          },
          500
        );
      }
    }

    // Servir Frontend SPA estático usando Cloudflare Worker Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
