import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Key, Shield, ShieldCheck, ShieldAlert, Building2, Target, Users, Brain,
  Calendar, PenTool, TrendingUp, MessageSquare, Copy, Download, Check,
  Zap, ChevronRight, Sparkles, Activity, Lock, Unlock, AlertCircle,
  Loader2, Send, X, Menu, Home, Settings, LogOut
} from 'lucide-react';

// Types
interface CompanyProfile {
  businessName: string;
  industry: string;
  painPoint: string;
  idealCustomer: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type TabType = 'vault' | 'profile' | 'command' | 'chat';

// Utility Functions
const generatePDF = (content: string, title: string): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - NEXUS AI OS</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #A855F7; border-bottom: 2px solid #22D3EE; padding-bottom: 10px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <pre>${content}</pre>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

// Neural Load Bar Component
const NeuralLoadBar: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + Math.random() * 15));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  return (
    <div className="relative h-2 bg-black/50 rounded-full overflow-hidden border border-purple-500/30">
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-cyan-400 to-purple-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
        </div>
      )}
    </div>
  );
};

// Glowing Input Component
const GlowInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', icon, multiline }) => {
  const [focused, setFocused] = useState(false);
  
  const baseClasses = `
    w-full bg-black/60 rounded-lg px-4 py-3 pl-12
    border transition-all duration-300 outline-none
    text-gray-100 placeholder-gray-500
    ${focused 
      ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
      : 'border-purple-500/30 hover:border-purple-500/50'}
  `;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-purple-300">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">
          {icon}
        </div>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={3}
            className={`${baseClasses} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className={baseClasses}
          />
        )}
      </div>
    </div>
  );
};

// Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`
    relative rounded-2xl p-6
    bg-gradient-to-br from-gray-900/80 to-black/80
    backdrop-blur-xl
    border border-purple-500/20
    shadow-[0_0_40px_rgba(168,85,247,0.1)]
    ${className}
  `}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

// Heartbeat Button Component
const HeartbeatButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, onClick, disabled, variant = 'primary', icon, className = '' }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group px-6 py-3 rounded-xl font-semibold
        transition-all duration-300 flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isPrimary 
          ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400' 
          : 'bg-black/40 text-purple-300 border border-purple-500/30 hover:border-cyan-400/50 hover:text-cyan-300'}
        ${!disabled && 'animate-pulse-glow'}
        ${className}
      `}
      style={{
        animation: !disabled && isPrimary ? 'heartbeat 2s ease-in-out infinite' : undefined
      }}
    >
      {icon}
      {children}
      {isPrimary && !disabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/50 to-cyan-500/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );
};

// Response Display Component
const ResponseDisplay: React.FC<{
  content: string;
  title: string;
  isStreaming: boolean;
}> = ({ content, title, isStreaming }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <GlassCard className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-purple-300"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => generatePDF(content, title)}
            className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors text-cyan-300"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
          {content}
          {isStreaming && <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1" />}
        </pre>
      </div>
    </GlassCard>
  );
};

// Main App Component
const NexusAIOS: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('vault');
  const [profile, setProfile] = useState<CompanyProfile>({
    businessName: '',
    industry: '',
    painPoint: '',
    idealCustomer: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [responseTitle, setResponseTitle] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('nexus_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeyValid(true);
    }
  }, []);

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('nexus_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Save API Key
  const saveApiKey = () => {
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      localStorage.setItem('nexus_api_key', apiKey);
      setIsKeyValid(true);
    } else {
      setIsKeyValid(false);
    }
  };

  // Save Profile
  const saveProfile = () => {
    localStorage.setItem('nexus_profile', JSON.stringify(profile));
  };

  // API Call with Streaming
  const callOpenAI = useCallback(async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const key = localStorage.getItem('nexus_api_key');
    if (!key) throw new Error('API key not found');

    const response = await fetch('[api.openai.com](https://api.openai.com/v1/chat/completions)', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      setIsStreaming(true);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullContent += content;
              setResponse(fullContent);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
      setIsStreaming(false);
    }

    return fullContent;
  }, []);

  // Command Functions
  const generateContentCalendar = async () => {
    if (!profile.businessName) {
      alert('Please complete your company profile first');
      setActiveTab('profile');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setResponseTitle('30-Day Strategic Content Calendar');

    try {
      const systemPrompt = `You are an elite content strategist. Create detailed, actionable content calendars that drive engagement and conversions.`;
      const userPrompt = `Create a comprehensive 30-day content calendar for:
      
Business: ${profile.businessName}
Industry: ${profile.industry}
Main Pain Point to Address: ${profile.painPoint}
Target Customer: ${profile.idealCustomer}

Include for each day:
- Content type (blog, video, social post, email, etc.)
- Topic/headline
- Key talking points
- Call-to-action
- Best posting time
- Platform recommendation

Focus on addressing the pain point while building authority in the industry.`;

      await callOpenAI(systemPrompt, userPrompt);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSalesCopy = async () => {
    if (!profile.businessName) {
      alert('Please complete your company profile first');
      setActiveTab('profile');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setResponseTitle('AIDA Sales Copy');

    try {
      const systemPrompt = `You are a world-class copywriter who specializes in high-conversion sales copy using the AIDA framework (Attention, Interest, Desire, Action).`;
      const userPrompt = `Write compelling sales copy using the AIDA framework for:

Business: ${profile.businessName}
Industry: ${profile.industry}
Pain Point to Solve: ${profile.painPoint}
Ideal Customer: ${profile.idealCustomer}

Create:
1. Attention-grabbing headline options (3 variations)
2. Interest-building opening paragraph
3. Desire-creating benefits section with bullet points
4. Powerful call-to-action variations
5. Complete long-form sales page copy
6. Short-form ad copy for social media`;

      await callOpenAI(systemPrompt, userPrompt);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSWOT = async () => {
    if (!profile.businessName) {
      alert('Please complete your company profile first');
      setActiveTab('profile');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setResponseTitle('SWOT Analysis Report');

    try {
      const systemPrompt = `You are a senior business strategist with expertise in competitive analysis and strategic planning.`;
      const userPrompt = `Conduct a comprehensive SWOT analysis for:

Business: ${profile.businessName}
Industry: ${profile.industry}
Current Challenge: ${profile.painPoint}
Target Market: ${profile.idealCustomer}

Provide:
1. STRENGTHS - Internal advantages and unique capabilities
2. WEAKNESSES - Internal limitations and areas for improvement
3. OPPORTUNITIES - External factors to capitalize on
4. THREATS - External risks and competitive pressures

For each section:
- List 5-7 specific points
- Explain the strategic implications
- Provide actionable recommendations

Conclude with:
- Top 3 strategic priorities
- Quick wins (next 30 days)
- Long-term strategic initiatives`;

      await callOpenAI(systemPrompt, userPrompt);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat Function
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const key = localStorage.getItem('nexus_api_key');
      if (!key) throw new Error('API key not found');

      const contextPrompt = profile.businessName 
        ? `You are an AI business consultant. Context about the user's business:
           Business: ${profile.businessName}
           Industry: ${profile.industry}
           Main Challenge: ${profile.painPoint}
           Target Customer: ${profile.idealCustomer}
           
           Provide helpful, strategic advice based on this context.`
        : `You are an AI business consultant. Provide helpful, strategic advice.`;

      const response = await fetch('[api.openai.com](https://api.openai.com/v1/chat/completions)', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: contextPrompt },
            ...chatMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: chatInput }
          ],
          stream: true
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                assistantContent += content;
                setChatMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation Items
  const navItems = [
    { id: 'vault' as TabType, label: 'Secure Vault', icon: <Shield className="w-5 h-5" /> },
    { id: 'profile' as TabType, label: 'Intelligence Core', icon: <Building2 className="w-5 h-5" /> },
    { id: 'command' as TabType, label: 'Command Center', icon: <Zap className="w-5 h-5" /> },
    { id: 'chat' as TabType, label: 'Neural Query', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Custom Styles */}
      <style>{`
        @import url('[fonts.googleapis.com](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap)');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .font-display {
          font-family: 'Orbitron', sans-serif;
        }
        
        @keyframes heartbeat {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4), 0 0 20px rgba(34, 211, 238, 0.2);
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0), 0 0 40px rgba(34, 211, 238, 0.4);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(168, 85, 247, 0.1);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #A855F7, #22D3EE);
          border-radius: 3px;
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-900/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="w-8 h-8 text-purple-400" />
                <div className="absolute inset-0 w-8 h-8 bg-purple-400 blur-lg opacity-50" />
              </div>
              <span className="font-display text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                NEXUS AI OS
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-white border border-purple-500/50' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Connection Status */}
            <div className="flex items-center gap-4">
              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                ${isKeyValid 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'}
              `}>
                {isKeyValid ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Connected</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Disconnected</span>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-purple-500/20 bg-black/90 backdrop-blur-xl">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-6 py-4 transition-colors
                  ${activeTab === item.id 
                    ? 'bg-purple-600/20 text-white border-l-2 border-cyan-400' 
                    : 'text-gray-400 hover:bg-white/5'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Neural Load Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Neural Load
            </span>
            {isLoading && <span className="text-cyan-400 animate-pulse">Processing...</span>}
          </div>
          <NeuralLoadBar isLoading={isLoading} />
        </div>

        {/* Secure Vault Tab */}
        {activeTab === 'vault' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Secure Vault
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                Initialize your neural connection by providing your OpenAI API credentials.
                Your key is encrypted and stored locally.
              </p>
            </div>

            <GlassCard className="max-w-xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {isKeyValid ? (
                      <Unlock className="w-16 h-16 text-green-400" />
                    ) : (
                      <Lock className="w-16 h-16 text-purple-400" />
                    )}
                    <div className={`absolute inset-0 blur-xl ${isKeyValid ? 'bg-green-400' : 'bg-purple-400'} opacity-30`} />
                  </div>
                </div>

                <GlowInput
                  label="OpenAI API Key"
                  value={apiKey}
                  onChange={setApiKey}
                  type="password"
                  placeholder="sk-..."
                  icon={<Key className="w-5 h-5" />}
                />

                {isKeyValid === false && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Invalid API key format. Please check and try again.
                  </div>
                )}

                <HeartbeatButton onClick={saveApiKey} className="w-full">
                  {isKeyValid ? 'Update Connection' : 'Initialize Connection'}
                </HeartbeatButton>

                <p className="text-xs text-gray-500 text-center">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Intelligence Core Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Intelligence Core
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                Feed the AI with your business DNA. The more context you provide,
                the more powerful and personalized your outputs will be.
              </p>
            </div>

            <GlassCard className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <GlowInput
                  label="Business Name"
                  value={profile.businessName}
                  onChange={(v) => setProfile(p => ({ ...p, businessName: v }))}
                  placeholder="Enter your company name"
                  icon={<Building2 className="w-5 h-5" />}
                />

                <GlowInput
                  label="Industry / Niche"
                  value={profile.industry}
                  onChange={(v) => setProfile(p => ({ ...p, industry: v }))}
                  placeholder="e.g., SaaS, E-commerce, Healthcare"
                  icon={<Target className="w-5 h-5" />}
                />

                <GlowInput
                  label="Primary Pain Point"
                  value={profile.painPoint}
                  onChange={(v) => setProfile(p => ({ ...p, painPoint: v }))}
                  placeholder="The main problem your business solves"
                  icon={<AlertCircle className="w-5 h-5" />}
                  multiline
                />

                <GlowInput
                  label="Ideal Customer Persona"
                  value={profile.idealCustomer}
                  onChange={(v) => setProfile(p => ({ ...p, idealCustomer: v }))}
                  placeholder="Describe your target customer in detail"
                  icon={<Users className="w-5 h-5" />}
                  multiline
                />

                <HeartbeatButton onClick={saveProfile} className="w-full">
                  Save Intelligence Profile
                </HeartbeatButton>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Command Center Tab */}
        {activeTab === 'command' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Command Center
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                Unleash the full power of NEXUS AI. Select an operation module
                to generate premium business intelligence.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Content Calendar */}
              <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-transform" onClick={generateContentCalendar}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Strategic Content Engine</h3>
                  <p className="text-gray-400 text-sm">
                    Generate a comprehensive 30-day content calendar tailored to your business and audience.
                  </p>
                  <div className="flex items-center text-purple-400 text-sm font-medium">
                    Launch Module <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>

              {/* Sales Copy */}
              <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-transform" onClick={generateSalesCopy}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PenTool className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">The Ghostwriter</h3>
                  <p className="text-gray-400 text-sm">
                    Create high-conversion sales copy using the proven AIDA framework.
                  </p>
                  <div className="flex items-center text-purple-400 text-sm font-medium">
                    Launch Module <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>

              {/* SWOT Analysis */}
              <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-transform" onClick={generateSWOT}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">SWOT Auditor</h3>
                  <p className="text-gray-400 text-sm">
                    Deep-dive analysis of your business strengths, weaknesses, opportunities, and threats.
                  </p>
                  <div className="flex items-center text-purple-400 text-sm font-medium">
                    Launch Module <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>

              {/* Chat */}
              <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setActiveTab('chat')}>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Custom Neural Query</h3>
                  <p className="text-gray-400 text-sm">
                    Free-form conversation with context-aware AI that knows your business.
                  </p>
                  <div className="flex items-center text-purple-400 text-sm font-medium">
                    Launch Module <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Response Display */}
            {response && (
              <ResponseDisplay content={response} title={responseTitle} isStreaming={isStreaming} />
            )}
          </div>
        )}

        {/* Neural Query (Chat) Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Neural Query Interface
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto">
                {profile.businessName 
                  ? `Connected to ${profile.businessName}'s intelligence profile`
                  : 'Add your company profile for context-aware responses'}
              </p>
            </div>

            <GlassCard className="h-[500px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 p-4">
                {chatMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center space-y-4">
                      <Brain className="w-16 h-16 mx-auto text-purple-500/30" />
                      <p>Start a conversation with your AI business consultant</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                      max-w-[80%] rounded-2xl px-4 py-3
                      ${msg.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white' 
                        : 'bg-gray-800/80 text-gray-100 border border-purple-500/20'}
                    `}>
                      <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-purple-500/20 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendChatMessage()}
                    placeholder="Ask anything about your business..."
                    className="flex-1 bg-black/60 rounded-xl px-4 py-3 border border-purple-500/30 
                             focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_20px_rgba(34,211,238,0.2)]
                             text-gray-100 placeholder-gray-500 transition-all"
                  />
                  <HeartbeatButton 
                    onClick={sendChatMessage} 
                    disabled={isLoading || !chatInput.trim()}
                    icon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  >
                    Send
                  </HeartbeatButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>NEXUS AI OS • Premium Business Intelligence</span>
            </div>
            <div className="text-gray-600 text-xs">
              Powered by OpenAI GPT-4
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NexusAIOS;
