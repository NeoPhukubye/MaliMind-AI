import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { useSubscription } from '../hooks/useSubscription'

const SUGGESTED_PROMPTS = [
  "How can I save more on my current income?",
  "What's the 50/30/20 rule for my budget?",
  "Should I join a stokvel or open a TFSA?",
  "Help me create a debt repayment plan",
  "How much should my emergency fund be?",
  "Tips for reducing my grocery spending",
]

export default function Coach() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your MaliMind AI financial coach. I can see your budget, savings goals, and financial health score — so my advice is personalized to your situation. What would you like help with today?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { isPro, messageCount, maxFreeMessages } = useSubscription()
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e, overrideMessage) {
    if (e) e.preventDefault()
    const msg = overrideMessage || input
    if (!msg.trim() || loading) return
    if (!isPro && messageCount >= maxFreeMessages) return

    const userMsg = { role: 'user', content: msg }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/api/ai/coach', { message: msg, history: messages })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }])
    } catch (err) {
      const detail = err.response?.status === 429
        ? "You've reached your daily free message limit. Upgrade to Pro for unlimited coaching!"
        : "Sorry, I couldn't process that. Please try again."
      setMessages((prev) => [...prev, { role: 'assistant', content: detail }])
    } finally {
      setLoading(false)
    }
  }

  const showSuggestions = messages.length <= 1 && !loading

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4">AI Financial Coach</h1>

      {!isPro && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg px-4 py-2 mb-4 text-sm text-accent-800">
          Free tier: {messageCount}/{maxFreeMessages} messages used.
          <a href="/app/premium" className="ml-2 font-medium underline">Upgrade to Pro</a>
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
            )}
            <div className={`max-w-[70%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Suggested prompts */}
        {showSuggestions && (
          <div className="pt-2">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(null, prompt)}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition border border-primary-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-600" />
            </div>
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your financial coach..."
          className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
          disabled={!isPro && messageCount >= maxFreeMessages}
        />
        <button
          type="submit"
          disabled={loading || (!isPro && messageCount >= maxFreeMessages)}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
