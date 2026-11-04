import express from 'express';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyMessage,
  CLARIFICATION_RESPONSE,
  hasStatisticsContext,
  OUT_OF_SCOPE_RESPONSE,
  ScopeClassification,
} from './utils/scopeGuard.js';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(appDirectory, '..');
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_HISTORY_MESSAGE_LENGTH = 6_000;
const MAX_HISTORY_LENGTH = 20;
const MAX_HISTORY_CHARS = 12_000;
const MAX_CONTEXT_CHARS = 20_000;

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function validateChatRequest(body) {
  if (!isRecord(body)) return 'Send a valid chat request.';
  if (typeof body.message !== 'string' || !body.message.trim()) {
    return 'Enter a message before sending.';
  }
  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }
  if (!Array.isArray(body.history) || body.history.length > MAX_HISTORY_LENGTH) {
    return `Conversation history must contain at most ${MAX_HISTORY_LENGTH} messages.`;
  }
  let historyChars = 0;
  for (const item of body.history) {
    if (
      !isRecord(item) ||
      !['user', 'assistant'].includes(item.role) ||
      typeof item.content !== 'string' ||
      !item.content.trim() ||
      item.content.length > MAX_HISTORY_MESSAGE_LENGTH
    ) {
      return 'Conversation history contains an invalid message.';
    }
    historyChars += item.content.length;
  }
  if (historyChars > MAX_HISTORY_CHARS) {
    return 'Conversation history is too long. Start a new conversation and try again.';
  }
  if (body.context !== null && body.context !== undefined) {
    if (
      !isRecord(body.context) ||
      !['regression', 'ztest'].includes(body.context.module) ||
      JSON.stringify(body.context).length > MAX_CONTEXT_CHARS
    ) {
      return 'Calculator context is invalid or too large.';
    }
  }
  return null;
}

export function createApp({
  generateResponse,
  requestLimit = 15,
  requestWindowMs = 60_000,
  serveStatic = false,
}) {
  if (typeof generateResponse !== 'function') {
    throw new TypeError('An AI response provider is required.');
  }

  const app = express();
  app.use(express.json({ limit: '32kb' }));

  const chatLimiter = rateLimit({
    windowMs: requestWindowMs,
    limit: requestLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many messages were sent. Please wait a moment and try again.',
        },
      });
    },
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/chat', chatLimiter, async (req, res) => {
    const validationError = validateChatRequest(req.body);
    if (validationError) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: validationError },
      });
    }

    const scope = classifyMessage(req.body.message, {
      history: req.body.history,
      context: req.body.context,
    });
    if (scope === ScopeClassification.OUT_OF_SCOPE) {
      return res.json({ reply: OUT_OF_SCOPE_RESPONSE });
    }
    if (
      scope === ScopeClassification.AMBIGUOUS &&
      !hasStatisticsContext({ history: req.body.history, context: req.body.context })
    ) {
      return res.json({ reply: CLARIFICATION_RESPONSE });
    }

    try {
      const reply = await generateResponse({
        message: req.body.message.trim(),
        history: req.body.history,
        context: req.body.context ?? null,
      });
      if (typeof reply !== 'string' || !reply.trim()) {
        throw new Error('The AI provider returned an invalid response.');
      }
      return res.json({ reply: reply.trim() });
    } catch (error) {
      const status = Number(error?.status);
      const code = typeof error?.code === 'string' ? error.code : 'AI_PROVIDER_ERROR';
      const isQuota = status === 429 || code === 'AI_QUOTA_EXCEEDED';
      const responseStatus = isQuota ? 429 : status === 503 ? 503 : 502;
      const message = isQuota
        ? 'The assistant has reached its current AI quota. Please try again later.'
        : code === 'AI_NOT_CONFIGURED'
          ? 'The statistics assistant is not configured yet.'
          : code === 'AI_RESPONSE_INCOMPLETE'
            ? error.message
          : status === 503
          ? 'AI is temporarily unavailable. Please try again in a moment.'
          : 'The assistant could not generate a response. Please try again shortly.';

      console.error('Statistics assistant request failed.', { code, status });
      return res.status(responseStatus).json({
        error: { code: isQuota ? 'AI_QUOTA_EXCEEDED' : code, message },
      });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'The requested API endpoint was not found.' },
    });
  });

  if (serveStatic) {
    const distDirectory = path.join(projectDirectory, 'dist');
    if (existsSync(distDirectory)) {
      app.use(express.static(distDirectory));
      app.get(/^(?!\/api\/).*/, (_req, res) => {
        res.sendFile(path.join(distDirectory, 'index.html'));
      });
    }
  }

  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({
        error: { code: 'REQUEST_TOO_LARGE', message: 'The request is too large.' },
      });
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({
        error: { code: 'INVALID_JSON', message: 'The request body must be valid JSON.' },
      });
    }
    console.error('Statistics assistant API error.', { message: error?.message });
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' },
    });
  });

  return app;
}
