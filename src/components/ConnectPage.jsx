import React from "react"

export function ConnectPage({ connectRequest, connectDetails, loading, notice, onApprove, onCancel, onLearnMore, onDataTransparency }) {
  const app = connectDetails?.app
  const scopes = connectDetails?.scopes || {}
  const categories = connectDetails?.activity_categories || {}
  const requestedScopes = connectDetails?.requested_scopes || connectRequest?.scopes || []
  const requestedCategories = connectDetails?.requested_categories || connectRequest?.categories || []
  const appName = app?.name || "this app"
  const canApprove = Boolean(app?.id && requestedScopes.length && requestedCategories.length && loading !== "approve")

  return (
    <section className="connect-shell">
      <article className="panel connect-card">
        <div className="connect-hero">
          <div>
            <p className="eyebrow">Connect app</p>
            <h2>{appName} wants to connect.</h2>
            <p className="muted">Review what this app wants to use before you connect it.</p>
          </div>
        </div>

        <div className="app-identity connect-identity">
          <span className="app-avatar" aria-hidden="true">{appName.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{appName}</strong>
            {app?.developer_url ? (
              <a className="muted" href={app.developer_url} target="_blank" rel="noreferrer">{app.developer_url}</a>
            ) : <span className="muted">Developer URL not provided.</span>}
          </div>
        </div>

        {loading === "loading" ? <p className="status-line">Loading app details.</p> : null}
        {notice ? <p className="notice notice-success" role="status">{notice}</p> : null}

        <section className="permission-list consent-summary-card">
          <div>
            <p className="eyebrow">Before you approve</p>
            <h3>What this connection allows</h3>
          </div>
          <div className="consent-points">
            <div className="mini-row">
              <strong>Approval is optional and scoped.</strong>
              <small>Permissions and categories limit what this app can use.</small>
            </div>
            <div className="mini-row">
              <strong>Data Transparency explains the details.</strong>
              <small>It shows what the app can send, what Memact may create, and what the app may receive.</small>
            </div>
            <div className="mini-row">
              <strong>You can disconnect later.</strong>
              <small>Removing access stops future Memact access for this app.</small>
            </div>
          </div>
          <div className="connect-link-row">
            <button type="button" className="learn-more-link connect-learn-more" onClick={onLearnMore}>Learn more</button>
            <button type="button" className="ghost connect-learn-more" onClick={onDataTransparency}>Data transparency</button>
          </div>
        </section>

        <div className="connect-grid">
          <section className="permission-list">
            <p className="eyebrow">Permissions</p>
            {requestedScopes.length ? requestedScopes.map((scope) => (
              <div className="mini-row" key={scope}>
                <strong>{scopeLabel(scopes, scope)}</strong>
                <small>{scopes[scope]?.description || scope}</small>
              </div>
            )) : <p className="muted">No permissions requested.</p>}
          </section>
          <section className="permission-list">
            <p className="eyebrow">Activity categories</p>
            {requestedCategories.length ? requestedCategories.map((category) => (
              <div className="mini-row" key={category}>
                <strong>{categoryLabel(categories, category)}</strong>
                <small>{categories[category]?.description || category}</small>
              </div>
            )) : <p className="muted">No categories requested.</p>}
          </section>
        </div>

        <div className="connect-actions">
          <button type="button" onClick={onApprove} disabled={!canApprove}>
            {loading === "approve" ? "Connecting..." : "Approve connection"}
          </button>
          <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        </div>
      </article>
    </section>
  )
}

function scopeLabel(scopes, scope) {
  return scopes?.[scope]?.label || scope
}

function categoryLabel(categories, category) {
  return categories?.[category]?.label || category
}
