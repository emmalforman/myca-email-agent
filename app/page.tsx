'use client';

import { useState, useEffect } from 'react';
import type { AgentResponse, LookupResult, DraftResponse } from '@/types';

type AppState = 
  | 'not_connected'
  | 'idle'
  | 'processing'
  | 'lookup'
  | 'questions'
  | 'draft_preview'
  | 'success';

type Mode = 'email' | 'substack';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<Mode>('email');
  const [state, setState] = useState<AppState>('idle');
  const [inputText, setInputText] = useState('');
  const [substackIdea, setSubstackIdea] = useState('');
  const [substackTone, setSubstackTone] = useState('');
  const [substackLength, setSubstackLength] = useState('');
  const [substackPost, setSubstackPost] = useState<any>(null);
  const [lookupResults, setLookupResults] = useState<LookupResult[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<LookupResult | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [previousFeedback, setPreviousFeedback] = useState('');

  useEffect(() => {
    // Get user email from localStorage or prompt
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      checkConnection(storedEmail);
    } else {
      const email = prompt('Enter your Gmail address:');
      if (email) {
        setUserEmail(email);
        localStorage.setItem('userEmail', email);
        checkConnection(email);
      }
    }
  }, []);

  const checkConnection = async (email: string) => {
    const res = await fetch(`/api/auth/status?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setConnected(data.connected);
    setState(data.connected ? 'idle' : 'not_connected');
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/google/start';
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setState('processing');

    try {
      const res = await fetch('/api/agent/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, userEmail }),
      });

      const data: AgentResponse = await res.json();

      if (data.type === 'lookup_needed' && data.lookup_results) {
        setLookupResults(data.lookup_results);
        setState('lookup');
      } else if (data.type === 'questions' && data.questions) {
        setQuestions(data.questions);
        setState('questions');
      } else if (data.type === 'draft' && data.data) {
        setDraft(data.data);
        setState('draft_preview');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process request');
      setState('idle');
    }
  };

  const handleSelectPerson = async (person: LookupResult) => {
    setSelectedPerson(person);
    setState('processing');

    try {
      const res = await fetch('/api/agent/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          selectedPerson: person,
          previousFeedback,
        }),
      });

      const data: AgentResponse = await res.json();

      if (data.type === 'questions' && data.questions) {
        setQuestions(data.questions);
        setState('questions');
      } else if (data.type === 'draft' && data.data) {
        setDraft(data.data);
        setState('draft_preview');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process selection');
      setState('idle');
    }
  };

  const handleAnswerQuestions = async () => {
    const answers = questions.map((q, i) => `${q}: ${questionAnswers[i] || ''}`).join('\n');
    const updatedText = `${inputText}\n\nAnswers:\n${answers}`;

    setState('processing');

    try {
      const res = await fetch('/api/agent/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: updatedText,
          selectedPerson,
          previousFeedback,
        }),
      });

      const data: AgentResponse = await res.json();

      if (data.type === 'draft' && data.data) {
        setDraft(data.data);
        setState('draft_preview');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process answers');
      setState('idle');
    }
  };

  const handleCreateDraft = async () => {
    if (!draft) return;

    setState('processing');

    try {
      const res = await fetch('/api/gmail/createDraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          userEmail,
          originalInput: inputText,
          selectedPerson,
          questions: questions.length > 0 ? questions : undefined,
          answers: Object.keys(questionAnswers).length > 0 ? questionAnswers : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setState('success');
        setInputText('');
        setDraft(null);
        setSelectedPerson(null);
        setQuestions([]);
        setQuestionAnswers({});
        setTimeout(() => setState('idle'), 3000);
      } else {
        alert(data.error || 'Failed to create draft');
        setState('draft_preview');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create draft');
      setState('draft_preview');
    }
  };

  const handleMarkBad = () => {
    const feedback = prompt('What was wrong with this draft? (e.g., "too salesy", "too long", "wrong tone")');
    if (feedback) {
      setPreviousFeedback(feedback);
      setState('idle');
      alert('Feedback saved. Next draft will avoid this issue.');
    }
  };

  if (state === 'not_connected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Gmail</h1>
          <p className="text-gray-600 mb-6">
            Connect your Gmail account to create drafts automatically.
          </p>
          <button
            onClick={handleConnect}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Connect Gmail
          </button>
        </div>
      </div>
    );
  }

  const handleSubstackDraft = async () => {
    if (!substackIdea.trim()) {
      alert('Please provide a post idea');
      return;
    }

    setState('processing');

    try {
      const res = await fetch('/api/substack/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: substackIdea,
          tone: substackTone,
          length: substackLength,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubstackPost(data.post);
        setState('draft_preview');
      } else {
        alert(data.error || 'Failed to draft post');
        setState('idle');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to draft post');
      setState('idle');
    }
  };

  const copySubstackToClipboard = () => {
    if (!substackPost) return;
    
    const fullContent = `${substackPost.title}\n\n${substackPost.subtitle ? `${substackPost.subtitle}\n\n` : ''}${substackPost.body}`;
    
    navigator.clipboard.writeText(fullContent).then(() => {
      alert('Copied to clipboard! Paste into Substack.');
    }).catch(() => {
      alert('Failed to copy. Please select and copy manually.');
    });
  };

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <h1 className="text-2xl font-bold mb-2">Myca Email Agent</h1>
        <p className="text-sm text-gray-600 mb-4">
          {connected ? `Connected as ${userEmail}` : 'Not connected'}
        </p>
        
        {/* Mode Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              setMode('email');
              setState('idle');
            }}
            className={`px-4 py-2 font-medium ${
              mode === 'email'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email Drafts
          </button>
          <button
            onClick={() => {
              setMode('substack');
              setState('idle');
            }}
            className={`px-4 py-2 font-medium ${
              mode === 'substack'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Substack Posts
          </button>
        </div>
      </div>

      {state === 'idle' && mode === 'email' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Email head of brand at Athletic Brewing to invite into Myca..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Draft Email
          </button>
        </div>
      )}

      {state === 'idle' && mode === 'substack' && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Post Idea *</label>
            <textarea
              value={substackIdea}
              onChange={(e) => setSubstackIdea(e.target.value)}
              placeholder="Write about how community building in food tech is changing..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tone (optional)</label>
              <input
                type="text"
                value={substackTone}
                onChange={(e) => setSubstackTone(e.target.value)}
                placeholder="thoughtful, casual, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Length (optional)</label>
              <input
                type="text"
                value={substackLength}
                onChange={(e) => setSubstackLength(e.target.value)}
                placeholder="800 words, short, long, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            onClick={handleSubstackDraft}
            disabled={!substackIdea.trim()}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Draft Substack Post
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing...</p>
        </div>
      )}

      {state === 'lookup' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Select a person:</h2>
          <div className="space-y-3">
            {lookupResults.map((person, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPerson(person)}
                className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="font-semibold">{person.name}</div>
                <div className="text-sm text-gray-600">{person.title}</div>
                <div className="text-xs text-gray-400">{person.company}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {state === 'questions' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick question:</h2>
          <div className="space-y-4">
            {questions.map((question, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium mb-2">{question}</label>
                <input
                  type="text"
                  value={questionAnswers[idx] || ''}
                  onChange={(e) =>
                    setQuestionAnswers({ ...questionAnswers, [idx]: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleAnswerQuestions}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </div>
      )}

      {state === 'draft_preview' && mode === 'email' && draft && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600">To:</div>
            <div className="font-semibold">{draft.to}</div>
          </div>
          <div className="mb-4">
            <div className="text-sm text-gray-600">Subject:</div>
            <div className="font-semibold">{draft.subject}</div>
          </div>
          <div className="mb-4">
            <div className="text-sm text-gray-600">Tag:</div>
            <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {draft.tag}
            </div>
          </div>
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Body:</div>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap border border-gray-200">
              {draft.body}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateDraft}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Create Gmail Draft
            </button>
            <button
              onClick={handleMarkBad}
              className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              Mark as Bad
            </button>
            <button
              onClick={() => {
                setState('idle');
                setDraft(null);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {state === 'draft_preview' && mode === 'substack' && substackPost && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600">Title:</div>
            <div className="font-semibold text-xl">{substackPost.title}</div>
          </div>
          {substackPost.subtitle && (
            <div className="mb-4">
              <div className="text-sm text-gray-600">Subtitle:</div>
              <div className="font-medium">{substackPost.subtitle}</div>
            </div>
          )}
          {substackPost.tags && substackPost.tags.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Tags:</div>
              <div className="flex flex-wrap gap-2">
                {substackPost.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Body:</div>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap border border-gray-200 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: substackPost.body.replace(/\n/g, '<br />') }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copySubstackToClipboard}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                setState('idle');
                setSubstackPost(null);
                setSubstackIdea('');
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Start Over
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600 text-center">
            Paste the copied content into your Substack editor
          </p>
        </div>
      )}

      {state === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 font-semibold text-lg mb-2">
            ✓ Draft created successfully!
          </div>
          <p className="text-green-700">
            {mode === 'email' ? 'Check your Gmail drafts.' : 'Check your Substack drafts.'}
          </p>
        </div>
      )}
    </div>
  );
}

