import { useState, useEffect } from 'react';
import { ArrowRight, Moon, Sun, Check, Terminal, Calendar, Sliders, Shield, ArrowUpRight, CheckCircle2, Globe, Users, Lock } from 'lucide-react';
import textLogoLight from '../../imports/text_logo_nobg_light.png';
import textLogoDark  from '../../imports/text_logo_nobg_dark.png';

// ─── Interactive Query Simulator ─────────────────────────────────────────────

function QuerySimulator() {
  const [activeApp, setActiveApp] = useState<'none' | 'cursor' | 'claude' | 'cal'>('none');
  const [status, setStatus] = useState<'idle' | 'requesting' | 'authorized'>('idle');

  useEffect(() => {
    if (activeApp === 'none') {
      setStatus('idle');
      return;
    }
    setStatus('requesting');
    const timer = setTimeout(() => {
      setStatus('authorized');
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeApp]);

  return (
    <div
      className="w-full rounded-sm overflow-hidden border border-border bg-card/65 shadow-[0_20px_50px_rgba(0,1,27,0.08)] flex flex-col h-[460px]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Browser Bar / Address header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40 select-none">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <div className="flex-1 flex justify-center mr-10">
          <div className="bg-background border border-border rounded-sm px-4 py-0.5 text-[11px] text-muted-foreground font-semibold tracking-tight flex items-center gap-1 font-mono">
            alex.memact.me
          </div>
        </div>
      </div>

      {/* Simulator Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left: Alex's Notebook Stream */}
        <div className="md:col-span-5 border-r border-border p-4 bg-background/40 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">Approved Stream</div>
            
            <div className="p-3 bg-card rounded-sm border border-border/80 space-y-2 relative group">
              <div className="text-xs text-foreground font-medium leading-relaxed">
                Building Memact address protocol beta.
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                <span>By you</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-chart-2">
                  <Globe size={9} /> Public
                </span>
              </div>
            </div>

            <div className="p-3 bg-card rounded-sm border border-border/80 space-y-2 relative group">
              <div className="text-xs text-foreground font-medium leading-relaxed">
                Available for booking on afternoons only.
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                <span>By you</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-chart-2">
                  <Globe size={9} /> Public
                </span>
              </div>
            </div>

            <div className="p-3 bg-card rounded-sm border border-border/80 space-y-2 relative group opacity-60">
              <div className="text-xs text-foreground/80 font-medium leading-relaxed">
                Tokyo subway architecture research & essay.
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/80 font-semibold">
                <span>By Claude</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock size={9} className="text-muted-foreground/60" /> Private
                </span>
              </div>
            </div>
          </div>
          <div className="text-[9px] text-muted-foreground/60 italic pt-3 select-none">
            Hosted securely. You control who sees what.
          </div>
        </div>

        {/* Right: The App Connection Sandbox */}
        <div className="md:col-span-7 p-4 flex flex-col justify-between bg-card/10 overflow-y-auto">
          {/* Top selection */}
          <div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'cursor', label: 'Cursor IDE', icon: <Terminal size={12} /> },
                { id: 'claude', label: 'Claude AI', icon: <Sliders size={12} /> },
                { id: 'cal', label: 'Cal.com', icon: <Calendar size={12} /> },
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveApp(app.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border transition-all ${
                    activeApp === app.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background hover:bg-secondary/60 text-muted-foreground border-border'
                  }`}
                >
                  {app.icon} {app.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center visual logs */}
          <div className="flex-1 flex flex-col justify-center my-4">
            {activeApp === 'none' ? (
              <div className="text-center py-8 px-4 border border-dashed border-border rounded-sm bg-secondary/20">
                <Shield className="mx-auto text-muted-foreground/40 mb-2" size={24} />
                <div className="text-xs font-bold text-foreground mb-1">Select an app to connect</div>
                <div className="text-[11px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                  Watch how apps personalize instantly using your address instead of sign-up forms.
                </div>
              </div>
            ) : (
              <div className="bg-background border border-border p-4 rounded-sm flex-1 flex flex-col justify-between font-mono text-[11px] leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] min-h-[180px]">
                {status === 'requesting' && (
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
                      <span>Connecting to alex.memact.me...</span>
                    </div>
                    <div>[Query] Requesting read access to Public entries...</div>
                    <div className="text-[10px] text-muted-foreground/60 italic">Validating authorization...</div>
                  </div>
                )}

                {status === 'authorized' && activeApp === 'cursor' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle2 size={12} /> Connected to alex.memact.me
                    </div>
                    <div className="text-muted-foreground text-[10px] space-y-0.5">
                      <div>&gt; Read Public entries ... Success</div>
                      <div>&gt; Found focus: <span className="text-foreground font-semibold">"Building Memact address..."</span></div>
                      <div>&gt; Private entries (Tokyo Subway) ... <span className="text-yellow-600 dark:text-yellow-400">[Access Denied]</span></div>
                      <div className="mt-1">&gt; Configuring TypeScript &amp; React environment...</div>
                    </div>
                    <div className="text-foreground font-bold mt-1 pt-1 border-t border-border/40 text-[10px]">
                      Cursor initialized instantly. You skipped the setup profile forms.
                    </div>
                  </div>
                )}

                {status === 'authorized' && activeApp === 'claude' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle2 size={12} /> Connected to alex.memact.me
                    </div>
                    <div className="text-muted-foreground text-[10px] space-y-0.5">
                      <div>&gt; Read Public entries ... Success</div>
                      <div>&gt; Current focus loaded: <span className="text-foreground font-semibold">"Building Memact address..."</span></div>
                      <div>&gt; Private entries ... <span className="text-yellow-600 dark:text-yellow-400">[Access Denied]</span></div>
                    </div>
                    <div className="text-foreground mt-1 pt-1 border-t border-border/40 leading-normal font-semibold text-[10px]">
                      "Welcome back. Let's write the code for the Memact address protocol."
                    </div>
                  </div>
                )}

                {status === 'authorized' && activeApp === 'cal' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle2 size={12} /> Connected to alex.memact.me
                    </div>
                    <div className="text-muted-foreground text-[10px] space-y-0.5">
                      <div>&gt; Read Public entries ... Success</div>
                      <div>&gt; Found preference: <span className="text-foreground font-semibold">"Booking on afternoons only"</span></div>
                      <div>&gt; Private entries ... <span className="text-yellow-600 dark:text-yellow-400">[Access Denied]</span></div>
                    </div>
                    <div className="text-foreground font-bold mt-1 pt-1 border-t border-border/40 text-[10px]">
                      Calendar synced. Available slots configured instantly.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset button */}
          {activeApp !== 'none' && (
            <button
              onClick={() => setActiveApp('none')}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors self-start underline underline-offset-2 select-none"
            >
              Reset simulator
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion cards preview ─────────────────────────────────────────────────

function SuggestionPreview() {
  const cards = [
    { from: 'Claude',   color: '#7C6FAE', text: 'Suggested update: Systems thinking' },
    { from: 'GitHub',   color: '#4A7C94', text: 'Suggested update: Open source contributor' },
    { from: 'Sofia M.', color: '#4255FF', text: 'Suggested update: Rock climbing' },
  ];
  return (
    <div className="space-y-3">
      {cards.map((c) => (
        <div key={c.from} className="flex items-start gap-3 p-4 bg-card rounded-sm border-l-2" style={{ borderLeftColor: c.color + '80' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ background: c.color }}>
            {c.from[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold mb-0.5" style={{ color: c.color }}>{c.from}</div>
            <div className="text-sm text-foreground font-medium leading-snug">{c.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

interface LandingProps {
  onNavigate: (page: 'identity' | 'auth' | 'faq', tab?: 'login' | 'signup', email?: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function Landing({ onNavigate, isDark, onToggleDark }: LandingProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-[60px] bg-background/90 backdrop-blur-sm border-b border-border">
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[18px] w-auto" />
        <div className="flex items-center gap-5">
          <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle dark mode">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => onNavigate('faq')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            FAQ
          </button>
          <button onClick={() => onNavigate('auth', 'login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            Sign in
          </button>
          <button onClick={() => onNavigate('auth', 'signup')} className="bg-foreground text-background text-sm px-4 py-2 font-semibold hover:opacity-80 transition-opacity">
            Create account
          </button>
        </div>
      </nav>

      {/* Hero — two columns */}
      <section className="pt-[60px] min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left */}
        <div className="flex flex-col justify-center px-12 py-16 lg:pl-16 lg:pr-8">
          <div className="max-w-lg">
            <h1 className="text-[clamp(36px,5.5vw,56px)] font-bold leading-[1.06] tracking-tight text-foreground mb-5">
              Stop reintroducing<br />yourself to the world.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
              Claim <span className="text-foreground font-semibold">username.memact.me</span>: a personal address where apps, agents, and users read and write about you.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('auth', 'signup')}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                Claim your address <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('identity')}
                className="text-sm text-muted-foreground border border-border px-6 py-3 hover:bg-card transition-colors font-medium"
              >
                See it live
              </button>
            </div>
          </div>
        </div>

        {/* Right — query simulator */}
        <div className="relative flex items-center justify-center px-8 py-16 lg:pl-4 lg:pr-12 bg-card/40">
          <div className="w-full max-w-xl relative">
            <QuerySimulator />
          </div>
        </div>
      </section>

      {/* Three points — tight, no gap */}
      <section className="border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[
            { title: 'Claim your address.', body: 'Create your username.memact.me link. It belongs entirely to you.' },
            { title: 'Own your data.', body: 'Store your preferences, focus, and links in one place, not scattered across fifty apps.' },
            { title: 'Skip the setup forms.', body: 'When you open a new app, it reads allowed details from your address. You never start from zero.' },
          ].map((item, i) => (
            <div key={item.title} className={`px-10 py-12 ${i < 2 ? 'border-b md:border-b-0 md:border-r border-border' : ''}`}>
              <div className="text-sm font-semibold text-foreground mb-2">{item.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggestions section */}
      <section className="border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-10 py-14 lg:border-r border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 leading-snug tracking-tight">
              Let apps update you.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              When a connected tool or collaborator notices a change in your stack or focus, they can suggest an update. You approve, edit, or reject it.
            </p>
            <ul className="space-y-2">
              {['You own every profile card', 'Nothing changes without your permission', 'All edits are transparent'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check size={13} className="text-accent shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-10 py-14">
            <SuggestionPreview />
          </div>
        </div>
      </section>

      {/* The URL section */}
      <section className="border-t border-border px-10 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-[clamp(22px,4vw,48px)] font-bold tracking-tight text-foreground mb-4">
            <span className="text-muted-foreground">username.</span>memact.me
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-10">
            A secure, readable link for your digital self. Share it, connect it to apps, or keep it private.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-4xl mx-auto">
            <div className="p-5 bg-card/60 border border-border/80 rounded-sm">
              <div className="text-xs font-bold text-foreground mb-2">Paste it to AI agents</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tell ChatGPT, Claude, or Cursor: <span className="font-mono text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded-xs text-foreground font-semibold">"Read alex.memact.me to know what I am working on."</span> They instantly adapt to your context.
              </p>
            </div>
            
            <div className="p-5 bg-card/60 border border-border/80 rounded-sm">
              <div className="text-xs font-bold text-foreground mb-2">Skip signup forms</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When joining a new app, connect your link. The tool reads your allowed focus and timezone automatically, so you never start from zero.
              </p>
            </div>

            <div className="p-5 bg-card/60 border border-border/80 rounded-sm">
              <div className="text-xs font-bold text-foreground mb-2">Share with connections</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send your link to friends or collaborators. They can view your public notebook stream or authenticate to see "Friends Only" updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — adaptive theme */}
      <section className="px-10 py-20 border-t border-border bg-card">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[clamp(26px,4vw,40px)] font-bold mb-3 tracking-tight leading-tight text-foreground">
            Stop starting from scratch.
          </h2>
          <p className="text-sm mb-10 text-muted-foreground">Get your personal address today.</p>
          <form
            className="flex flex-col sm:flex-row gap-2 justify-center"
            onSubmit={(e) => { e.preventDefault(); onNavigate('auth', 'signup', email); }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 max-w-xs bg-secondary border border-border focus:border-foreground/45 transition-colors px-4 py-3 text-sm outline-none rounded-sm text-foreground placeholder:text-muted-foreground/30 font-medium"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-semibold hover:opacity-85 transition-opacity whitespace-nowrap rounded-sm"
            >
              Claim your address <ArrowRight size={13} />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-border flex items-center justify-between">
        <img src={isDark ? textLogoDark : textLogoLight} alt="memact" className="h-[14px] w-auto opacity-40" />
        <div className="flex gap-6">
          <button onClick={() => onNavigate('faq')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
          {['Privacy', 'Terms', 'Contact'].map((item) => (
            <button key={item} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{item}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
