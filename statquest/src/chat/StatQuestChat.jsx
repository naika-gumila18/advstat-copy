import { useEffect, useRef, useState } from 'react';
import { matchQuestion } from './matcher.js';
import { SUGGESTED_QUESTIONS } from './knowledgeBase.js';
import mascot from '../assets/statquest-mascot.svg';
import './StatQuestChat.css';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hi! I’m StatQuest AI. Ask me about simple linear regression, correlation, R², or Z- and t-test hypothesis testing.',
};

export default function StatQuestChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const sendMessage = (message = draft) => {
    const content = message.trim();
    if (!content || typing) {
      if (!content) setError('Enter a question before sending.');
      return;
    }
    setError('');
    setDraft('');
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: 'user', content }]);
    setTyping(true);
    timerRef.current = window.setTimeout(() => {
      const result = matchQuestion(content);
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-assistant`, role: 'assistant', content: result.response },
      ]);
      setTyping(false);
    }, 350);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    window.clearTimeout(timerRef.current);
    setMessages([WELCOME_MESSAGE]);
    setTyping(false);
    setDraft('');
    setError('');
  };

  return (
    <aside className="sq-chat-widget">
      {open && (
        <section id="sq-chat-panel" className="sq-chat card" aria-label="StatQuest AI chat">
          <header className="sq-chat-header">
            <div className="sq-chat-brand">
              <img className="sq-chat-avatar" src={mascot} alt="" />
              <div>
                <h2>StatQuest AI</h2>
                <span>Statistics study guide</span>
              </div>
            </div>
            <div className="sq-chat-header-actions">
              <button type="button" className="sq-chat-icon-button" onClick={clearConversation} aria-label="Start a new chat" title="New chat">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7m-6.5 0 .7 10.7h7.6l.7-10.7M8 8.5v5M12 8.5v5" />
                </svg>
              </button>
              <button type="button" className="sq-chat-icon-button" onClick={() => setOpen(false)} aria-label="Close chat" title="Close">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="m5 5 10 10M15 5 5 15" />
                </svg>
              </button>
            </div>
          </header>

          <div className="sq-chat-messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((message) => (
              <article className={`sq-chat-message ${message.role}`} key={message.id}>
                <span className="sq-chat-author">{message.role === 'assistant' ? 'StatQuest AI' : 'You'}</span>
                <p>{message.content}</p>
              </article>
            ))}
            {typing && (
              <div className="sq-chat-typing" role="status" aria-label="StatQuest AI is responding">
                <span /> <span /> <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="sq-chat-suggestions" aria-label="Suggested questions">
              <span>Suggested questions</span>
              {SUGGESTED_QUESTIONS.map((question) => (
                <button type="button" className="sq-chat-suggestion" key={question} onClick={() => sendMessage(question)}>
                  {question}
                </button>
              ))}
            </div>
          )}

          <form
            className="sq-chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <label className="sq-chat-input-label" htmlFor="sq-chat-input">Your question</label>
            <div className="sq-chat-input-row">
              <textarea
                ref={inputRef}
                id="sq-chat-input"
                rows="2"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (error) setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about regression, p-values, Z-tests..."
                aria-describedby="sq-chat-hint"
                maxLength={1000}
              />
              <button type="submit" className="btn" disabled={!draft.trim() || typing}>Send</button>
            </div>
            <div className="sq-chat-form-footer">
              {error ? <span className="sq-chat-error" role="alert">{error}</span> : <span id="sq-chat-hint">Enter to send · Shift + Enter for a new line</span>}
              <span>{draft.length}/1000</span>
            </div>
          </form>
        </section>
      )}
      <button
        type="button"
        className="sq-chat-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close StatQuest AI chat' : 'Open StatQuest AI chat'}
        aria-expanded={open}
        aria-controls="sq-chat-panel"
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.5-.8L4 20l1.5-4A7.5 7.5 0 1 1 20 11.5Z" />
            <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
          </svg>
        )}
      </button>
    </aside>
  );
}
