import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"

// ─────────────────────────────────────────────────────────────
// Filter config
// ─────────────────────────────────────────────────────────────
const FILTERS = [
  { id: "approved", label: "Approved" },
  { id: "pending",  label: "Pending"  },
  { id: "rejected", label: "Rejected" },
  { id: "self",     label: "Added by you" },
  { id: "archived", label: "Archived" },
]

// ─────────────────────────────────────────────────────────────
// Time helpers — no moment, no dayjs, no dependencies
// ─────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  if (mins < 2)   return "Just now"
  if (hours < 1)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "Yesterday"
  if (days < 7)   return `${days} days ago`
  if (days < 30)  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`
  return new Date(iso).getFullYear().toString()
}

function shortDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─────────────────────────────────────────────────────────────
// Map a raw contribution from the API to a display-safe shape.
// Field names come from the server: entry_id, title, status,
// source_app, category, confidence, proposed_at, created_at,
// updated_at, context (object), source_type
// ─────────────────────────────────────────────────────────────
function normalizeContribution(raw) {
  if (!raw) return null
  return {
    id:          raw.entry_id || raw.id || raw.contribution_id || "",
    // Readable claim text — prefer the proposal title, fallback to context.title
    text:        raw.title || raw.context?.title || raw.subject || "",
    status:      raw.status || "pending",           // pending | approved | rejected | archived
    source:      raw.source_app || raw.app_name || null,
    source_type: raw.source_type || "app",          // app | self
    category:    raw.category || "",
    observed_at: raw.proposed_at || raw.created_at || null,
    approved_at: raw.approved_at || null,
    updated_at:  raw.updated_at || raw.created_at || null,
    user_added:  raw.source_type === "self" || raw.source_app === "you" || false,
    shared_with: raw.shared_with || [],             // populated if backend returns it
  }
}

function filterContributions(items, filter) {
  switch (filter) {
    case "approved": return items.filter(c => c.status === "approved" && !c.user_added)
    case "pending":  return items.filter(c => c.status === "pending")
    case "rejected": return items.filter(c => c.status === "rejected")
    case "self":     return items.filter(c => c.user_added)
    case "archived": return items.filter(c => c.status === "archived")
    default:         return items
  }
}

function cardTimeLabel(item) {
  if (item.status === "archived") return timeAgo(item.updated_at)
  if (item.user_added && item.approved_at) {
    const d = new Date(item.approved_at)
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }
  return timeAgo(item.updated_at || item.observed_at)
}

// ─────────────────────────────────────────────────────────────
// Side sheet (desktop) / bottom sheet (mobile)
// ─────────────────────────────────────────────────────────────
function ClaimSheet({ item, onClose, onAction, saving }) {
  const overlayRef = useRef(null)
  const [editText, setEditText] = useState(item?.text || "")
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setEditText(item?.text || "")
    setEditing(false)
  }, [item?.id])

  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const handleOverlay = useCallback(e => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  if (!item) return null

  const isPending  = item.status === "pending"
  const isArchived = item.status === "archived"

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Details: ${item.text}`}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,1,27,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(460px, 100%)",
          height: "100%",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
          background: "linear-gradient(160deg, rgba(255,255,255,0.082), rgba(255,255,255,0.052))",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          display: "flex", flexDirection: "column",
          padding: "clamp(1.25rem, 3vw, 2rem)",
          gap: "1.5rem",
          overflowY: "auto",
          animation: "slideInSheet 200ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Close */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className="ghost"
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.88rem", color: "var(--muted)", minHeight: "auto" }}
          >
            Close
          </button>
        </div>

        {/* Claim text / edit */}
        <div style={{ display: "grid", gap: "0.35rem" }}>
          {item.source && (
            <span className="card-source-label">{item.source}</span>
          )}
          {editing ? (
            <textarea
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              style={{ minHeight: "80px", borderRadius: "16px", padding: "0.75rem 1rem", fontSize: "1rem" }}
              aria-label="Edit claim text"
            />
          ) : (
            <h2 style={{
              margin: 0,
              fontSize: "clamp(1.35rem, 3.5vw, 1.85rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              fontWeight: 800,
            }}>
              {item.text || "Untitled"}
            </h2>
          )}
        </div>

        {/* Timeline */}
        {!isPending && (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {[
              { label: "Observed",     value: shortDate(item.observed_at) },
              { label: item.user_added ? "Added" : "Approved", value: shortDate(item.approved_at) },
              { label: "Last updated", value: timeAgo(item.updated_at) },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.6rem" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                  {row.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{row.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Shared with */}
        {item.shared_with?.length > 0 && (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Shared with
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
              {item.shared_with.map(app => (
                <span key={app} className="app-chip" style={{ fontSize: "0.88rem", fontWeight: 600, padding: "0.38rem 0.8rem", pointerEvents: "none" }}>
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pending actions */}
        {isPending && (
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button onClick={() => onAction("approve", item.id)} disabled={saving} style={{ flex: 1, minWidth: 0 }}>
              Save
            </button>
            <button className="ghost" onClick={() => onAction("reject", item.id)} disabled={saving}
              style={{ flex: 1, minWidth: 0, color: "var(--muted)" }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Edit save / cancel */}
        {editing && !isPending && (
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={() => onAction("edit", item.id, { text: editText })} disabled={saving || !editText.trim()} style={{ flex: 1 }}>
              Save changes
            </button>
            <button className="ghost" onClick={() => { setEditing(false); setEditText(item.text) }}
              style={{ flex: 1, color: "var(--muted)" }}>
              Cancel
            </button>
          </div>
        )}

        {/* Approved / archived actions */}
        {!isPending && !editing && (
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", display: "grid", gap: "0.4rem" }}>
            {!item.user_added && (
              <button className="ghost" onClick={() => setEditing(true)}
                style={{ color: "var(--muted)" }}>
                Edit
              </button>
            )}
            {isArchived ? (
              <button className="ghost" onClick={() => onAction("approve", item.id)} disabled={saving}
                style={{ color: "var(--text)" }}>
                Restore
              </button>
            ) : (
              <button className="ghost" onClick={() => onAction("archive", item.id)} disabled={saving}
                style={{ color: "var(--muted)" }}>
                Archive
              </button>
            )}
            <button className="danger" onClick={() => onAction("delete", item.id)} disabled={saving}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Approved / Archived / Rejected card
// ─────────────────────────────────────────────────────────────
function ClaimCard({ item, onClick }) {
  const isArchived = item.status === "archived"
  const isRejected = item.status === "rejected"
  const timeLabel  = cardTimeLabel(item)

  return (
    <button
      className="app-card"
      onClick={() => onClick(item)}
      style={{
        display: "grid",
        gap: "1rem",
        padding: "1.25rem",
        borderRadius: "24px",
        textAlign: "left",
        minHeight: "120px",
        alignContent: "space-between",
        opacity: isArchived || isRejected ? 0.58 : 1,
        transition: "border-color 140ms ease, background 140ms ease, opacity 140ms ease",
      }}
      aria-label={`Open: ${item.text}`}
    >
      <div style={{ display: "grid", gap: "0.28rem" }}>
        {item.user_added && (
          <span className="card-source-label">Added by you</span>
        )}
        <div style={{
          fontSize: "clamp(0.97rem, 1.5vw, 1.08rem)",
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: "-0.022em",
          color: "var(--text)",
        }}>
          {item.text || "Untitled"}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ display: "grid", gap: "0.08rem" }}>
          {isArchived && (
            <span style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Last updated
            </span>
          )}
          <span style={{ fontSize: "0.84rem", color: "var(--muted)", fontWeight: 600 }}>
            {timeLabel}
          </span>
        </div>
        <span style={{ color: "var(--soft)", fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>⋮</span>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Pending card
// ─────────────────────────────────────────────────────────────
function PendingCard({ item, onApprove, onDismiss, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={e => e.key === "Enter" && onClick(item)}
      style={{
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "24px",
        padding: "1.25rem",
        background: "rgba(255,255,255,0.055)",
        display: "grid",
        gap: "1rem",
        cursor: "pointer",
        transition: "border-color 140ms ease, background 140ms ease",
      }}
    >
      <div style={{ display: "grid", gap: "0.25rem" }}>
        {item.source && <span className="card-source-label">{item.source}</span>}
        <div style={{
          fontSize: "clamp(0.97rem, 1.5vw, 1.08rem)",
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: "-0.022em",
        }}>
          {item.text || "Untitled"}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.55rem" }} onClick={e => e.stopPropagation()}>
        <button
          onClick={e => { e.stopPropagation(); onApprove(item.id) }}
          style={{ flex: 1, minWidth: 0, padding: "0.58rem 0.8rem", fontSize: "0.9rem", fontWeight: 800 }}
        >
          Save
        </button>
        <button
          className="ghost"
          onClick={e => { e.stopPropagation(); onDismiss(item.id) }}
          style={{ flex: 1, minWidth: 0, padding: "0.58rem 0.8rem", fontSize: "0.9rem", color: "var(--muted)" }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────
const EMPTY_COPY = {
  approved: ["Nothing approved yet.", "Claims suggested by apps appear here once you accept them."],
  pending:  ["Nothing pending.",       "When apps notice something about you, it will show up here."],
  rejected: ["Nothing dismissed.",     "Claims you have rejected appear here."],
  self:     ["Nothing added yet.",     "You can add things apps would never know about you."],
  archived: ["Nothing archived.",      "Claims that fade over time move here automatically."],
}

function EmptyState({ filter }) {
  const [title, sub] = EMPTY_COPY[filter] || ["Nothing here.", ""]
  return (
    <div style={{
      gridColumn: "1 / -1",
      padding: "3.5rem 1rem",
      textAlign: "center",
      display: "grid",
      gap: "0.35rem",
    }}>
      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--muted)" }}>{title}</div>
      {sub && <div style={{ fontSize: "0.87rem", color: "var(--soft)", lineHeight: 1.5 }}>{sub}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="error" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
      <span>{message}</span>
      {onRetry && (
        <button className="ghost inline-retry" onClick={onRetry} style={{ flexShrink: 0, color: "var(--error)", borderColor: "rgba(255,180,180,0.4)" }}>
          Retry
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AddressPage — the main component
// Props:
//   client  — AccessClient instance (from main.jsx)
//   session — auth session token string
//   user    — { email, ... } from auth
// ─────────────────────────────────────────────────────────────
export function AddressPage({ client, session, user }) {
  const [filter,       setFilter]       = useState("approved")
  const [rawItems,     setRawItems]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [loadError,    setLoadError]    = useState("")
  const [saving,       setSaving]       = useState(false)
  const [activeItem,   setActiveItem]   = useState(null)

  // Derive address from user email username
  const address = useMemo(() => {
    if (!user?.email) return "your.memact.com"
    const username = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "")
    return `${username}.memact.com`
  }, [user?.email])

  // Normalised items
  const items = useMemo(() => rawItems.map(normalizeContribution).filter(Boolean), [rawItems])

  const pendingCount = useMemo(() => items.filter(c => c.status === "pending").length, [items])

  const visible = useMemo(() => filterContributions(items, filter), [items, filter])

  // ── Load ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      const result = await client.contributions(session)
      // Server returns { contributions: [...] } or { proposals: [...] } or array
      const list = result?.contributions || result?.proposals || result?.entries || (Array.isArray(result) ? result : [])
      setRawItems(list)
    } catch (err) {
      setLoadError(err?.message || "Could not load your claims.")
    } finally {
      setLoading(false)
    }
  }, [client, session])

  useEffect(() => { load() }, [load])

  // ── Actions ───────────────────────────────────────────────
  const handleAction = useCallback(async (action, id, body = {}) => {
    setSaving(true)
    try {
      switch (action) {
        case "approve":
          await client.approveContribution(session, id, body)
          setRawItems(prev => prev.map(r =>
            (r.entry_id || r.id) === id ? { ...r, status: "approved", approved_at: new Date().toISOString() } : r
          ))
          break
        case "reject":
          await client.rejectContribution(session, id)
          setRawItems(prev => prev.map(r =>
            (r.entry_id || r.id) === id ? { ...r, status: "rejected" } : r
          ))
          break
        case "edit":
          await client.editContribution(session, id, body)
          setRawItems(prev => prev.map(r =>
            (r.entry_id || r.id) === id ? { ...r, title: body.text, updated_at: new Date().toISOString() } : r
          ))
          break
        case "archive":
          await client.editContribution(session, id, { status: "archived" })
          setRawItems(prev => prev.map(r =>
            (r.entry_id || r.id) === id ? { ...r, status: "archived" } : r
          ))
          break
        case "delete":
          await client.deleteContribution(session, id)
          setRawItems(prev => prev.filter(r => (r.entry_id || r.id) !== id))
          break
        default:
          break
      }
      setActiveItem(null)
    } catch (err) {
      // Surface inline — keep sheet open so user sees the error
      alert(err?.message || "Action failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }, [client, session])

  return (
    <>
      <style>{`
        @keyframes slideInSheet {
          from { transform: translateX(28px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .claim-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(252px, 1fr));
          gap: 0.75rem;
        }
        @media (max-width: 480px) {
          .claim-grid { grid-template-columns: 1fr; }
        }
        .filter-row {
          display: flex;
          gap: 0.38rem;
          align-items: center;
        }
        @media (max-width: 700px) {
          .filter-row {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 2px;
          }
          .filter-row::-webkit-scrollbar { display: none; }
        }
        .filter-btn {
          flex-shrink: 0;
          padding: 0.52rem 0.95rem;
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          white-space: nowrap;
          transition: border-color 130ms ease, background 130ms ease, color 130ms ease;
          min-height: auto;
        }
        .filter-btn:hover {
          border-color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.06);
          color: var(--text);
        }
        .filter-btn.is-active {
          border-color: #fff;
          background: #fff;
          color: #00011b;
        }
        .filter-btn.is-active:hover {
          background: #fff;
          color: #00011b;
        }
        .pending-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          color: #00011b;
          font-size: 0.58rem;
          font-weight: 900;
          margin-left: 3px;
          vertical-align: middle;
          line-height: 1;
        }
        .filter-btn.is-active .pending-badge {
          background: rgba(0,1,27,0.72);
          color: #fff;
        }
        .skeleton-card {
          border: 1px solid var(--line);
          border-radius: 24px;
          min-height: 120px;
          background: rgba(255,255,255,0.035);
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      <div className="page" style={{ paddingTop: 0 }}>

        {/* Topbar */}
        <header className="topbar" role="banner">
          <a href="/" className="logo-link" aria-label="Memact home">
            <img src="/logo.png" alt="Memact" className="logo-img" />
          </a>
          <nav aria-label="Account navigation">
            <a
              href="/Account"
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--muted)",
                textDecoration: "none",
                padding: "0.45rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid var(--line)",
                background: "transparent",
                transition: "color 130ms, border-color 130ms",
              }}
            >
              Settings
            </a>
          </nav>
        </header>

        {/* Address */}
        <div style={{ textAlign: "center", padding: "2.25rem 0 0.5rem" }} aria-label={`Memact address: ${address}`}>
          <div style={{
            fontSize: "clamp(1.05rem, 2.2vw, 1.42rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--muted)",
          }}>
            {address}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.09)", margin: "1.15rem 0 1.25rem" }} />

        {/* Filter bar */}
        <nav aria-label="Claim filters" style={{ marginBottom: "1.35rem" }}>
          <div className="filter-row" role="tablist">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-btn${filter === f.id ? " is-active" : ""}`}
                onClick={() => setFilter(f.id)}
                role="tab"
                aria-selected={filter === f.id}
                id={`tab-${f.id}`}
              >
                {f.label}
                {f.id === "pending" && pendingCount > 0 && (
                  <span className="pending-badge" aria-label={`${pendingCount} pending`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Grid */}
        <main className="claim-grid" role="tabpanel" aria-labelledby={`tab-${filter}`}>

          {/* Loading skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" aria-hidden="true" />
          ))}

          {/* Error */}
          {!loading && loadError && (
            <ErrorState message={loadError} onRetry={load} />
          )}

          {/* Empty */}
          {!loading && !loadError && visible.length === 0 && (
            <EmptyState filter={filter} />
          )}

          {/* Cards */}
          {!loading && !loadError && visible.map(item => {
            if (item.status === "pending") {
              return (
                <PendingCard
                  key={item.id}
                  item={item}
                  onApprove={id => handleAction("approve", id)}
                  onDismiss={id => handleAction("reject", id)}
                  onClick={setActiveItem}
                />
              )
            }
            return (
              <ClaimCard key={item.id} item={item} onClick={setActiveItem} />
            )
          })}

        </main>

        {/* Self-add CTA */}
        {filter === "self" && !loading && !loadError && (
          <div style={{ marginTop: "1.35rem" }}>
            <button
              className="ghost"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.58rem 1rem", fontSize: "0.9rem", color: "var(--muted)", fontWeight: 700 }}
              onClick={() => {
                const text = window.prompt("What would you like to add?")
                if (text?.trim()) handleAction("approve", "__self__", { text: text.trim(), source_type: "self" })
              }}
            >
              + Add something
            </button>
          </div>
        )}

      </div>

      {/* Sheet */}
      {activeItem && (
        <ClaimSheet
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onAction={handleAction}
          saving={saving}
        />
      )}
    </>
  )
}
