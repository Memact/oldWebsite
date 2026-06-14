import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, BookOpen, Shield, Cpu, UserCheck } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  steps?: string[];
}

interface FAQCategory {
  id: string;
  title: string;
  icon: typeof BookOpen;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    id: 'general',
    title: 'Account & Address',
    icon: BookOpen,
    items: [
      {
        id: 'what-is-memact',
        question: 'What is Memact?',
        answer: 'Memact is a user-controlled memory layer for software. Instead of apps storing what they learn about you in hidden, siloed databases, Memact provides a single notebook where you own, view, and govern your digital profile.'
      },
      {
        id: 'what-is-address',
        question: 'What is a you.memact.me address?',
        answer: 'It is your permanent personal address. You can share it with others or use it to connect third-party apps. You control exactly who can see each entry (Public, Friends, or Private).'
      }
    ]
  },
  {
    id: 'memory',
    title: 'Memory Governance',
    icon: UserCheck,
    items: [
      {
        id: 'difference-chatbot',
        question: 'How is Memact different from a chatbot?',
        answer: 'Memact is not an AI companion or chatbot. It is a data utility. It provides a standard API and notebook stream that other software queries to personalize their services, with your consent.'
      },
      {
        id: 'how-suggestions-work',
        question: 'How do Suggestions work?',
        answer: 'When a connected app or AI learns something about you, it proposes it as a suggestion. The item is queued in your notebook under "Suggestions". It will never be added to your profile until you manually review and click "Add".'
      }
    ]
  },
  {
    id: 'connections',
    title: 'App Connections',
    icon: Cpu,
    items: [
      {
        id: 'how-to-connect',
        question: 'How do I connect an app to my notebook?',
        answer: 'Connect apps using the secure consent flow:',
        steps: [
          'Inside the third-party app, click "Connect Memact".',
          'Review the requested visibility scopes (e.g. read public entries).',
          'Click Approve. The app receives a unique connection ID to fetch allowed details.'
        ]
      },
      {
        id: 'how-to-revoke',
        question: 'How do I revoke an app\'s access?',
        answer: 'You can disconnect any app instantly:',
        steps: [
          'Open your Memact Notebook and select the "Connections" tab.',
          'Find the app or integration you want to remove.',
          'Click Disconnect. This immediately invalidates their access tokens and revokes all permissions.'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    items: [
      {
        id: 'data-storage',
        question: 'Where is my data stored?',
        answer: 'Your memory data is encrypted and saved inside your private profile. Memact secures this data and only exposes approved scopes to third-party integrations using cryptographic API keys.'
      },
      {
        id: 'can-apps-see-everything',
        question: 'Can connected apps read my entire notebook?',
        answer: 'No. Apps only see the specific visibility scopes you approved during the connection setup. They can never read your private entries.'
      }
    ]
  }
];

interface FaqPageProps {
  onBack: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function FaqPage({ onBack, isDark, onToggleDark }: FaqPageProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter items based on category and search query
  const filteredCategories = FAQ_DATA.map(category => {
    if (activeCategory !== 'all' && category.id !== activeCategory) {
      return { ...category, items: [] };
    }

    const matchedItems = category.items.filter(item =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    );

    return { ...category, items: matchedItems };
  }).filter(c => c.items.length > 0);

  const isEmpty = filteredCategories.length === 0;

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 h-[60px] bg-background/90 backdrop-blur-sm border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[18px] w-auto" />
        <div className="w-[60px]" />
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">How can we help?</h1>
          <p className="text-sm text-muted-foreground">Clear documentation and answers on how Memact governs your digital memory.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full bg-secondary border border-border focus:border-foreground/45 transition-colors pl-11 pr-4 py-3 text-sm rounded-sm outline-none text-foreground placeholder:text-muted-foreground/35 font-medium"
          />
        </div>

        {/* Layout split */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="space-y-1 md:col-span-1 border-r border-border/50 pr-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-sm transition-colors ${
                activeCategory === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Topics
            </button>
            {FAQ_DATA.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 ${
                  activeCategory === c.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <c.icon size={12} className="shrink-0" />
                {c.title}
              </button>
            ))}
          </aside>

          {/* Right Content */}
          <section className="md:col-span-3 space-y-8">
            {isEmpty ? (
              <div className="py-12 text-center border border-dashed border-border rounded-sm">
                <p className="text-sm text-muted-foreground">No questions found matching your search.</p>
              </div>
            ) : (
              filteredCategories.map(category => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <category.icon size={14} className="text-muted-foreground/60" />
                    <h2 className="text-xs font-semibold text-muted-foreground">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-2">
                    {category.items.map(item => {
                      const isExpanded = expandedItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-card/30 border border-border/80 rounded-sm overflow-hidden transition-colors hover:bg-card/50"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-foreground select-none"
                          >
                            <span>{item.question}</span>
                            {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                          </button>

                          {isExpanded && (
                            <div className="p-4 pt-0 border-t border-border/40 text-xs text-muted-foreground leading-relaxed space-y-2.5">
                              <p>{item.answer}</p>
                              {item.steps && (
                                <ol className="list-decimal pl-4 space-y-1 font-medium">
                                  {item.steps.map((s, idx) => (
                                    <li key={idx} className="pl-0.5">{s}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground/50">Need direct support? Contact dev@memact.me</span>
        <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()} Memact</span>
      </footer>
    </div>
  );
}
