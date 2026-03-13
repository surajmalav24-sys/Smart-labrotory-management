import { useMemo, useState } from 'react'

const demoUsers = [
  { id: 'fx-1', name: 'Lab Fixer', username: 'fixer', password: 'fixer123', role: 'fixer' },
  { id: 'st-1', name: 'James Wilson', username: 'james', password: 'student123', role: 'client' },
  { id: 'st-2', name: 'Michael Chen', username: 'michael', password: 'student123', role: 'client' },
]

const initialIssues = [
  {
    id: 1,
    title: 'Internet connection dropping',
    description:
      'WiFi disconnects every few minutes in Lab C and interrupts online practical assessments.',
    priority: 'High',
    status: 'Open',
    reporterId: 'st-1',
    reporterName: 'James Wilson',
    location: 'Computer Lab C - Room 305',
    category: 'Network',
    createdAt: '2026-06-02',
  },
  {
    id: 2,
    title: 'Software installation issue',
    description: 'Python 3.11 setup fails with error 1603 on assigned workstation.',
    priority: 'High',
    status: 'In Progress',
    reporterId: 'st-2',
    reporterName: 'Michael Chen',
    location: 'Computer Lab B - Room 203',
    category: 'Software',
    createdAt: '2026-06-02',
  },
  {
    id: 3,
    title: 'Projector not displaying',
    description: 'Projector turns on but HDMI signal is not detected during class.',
    priority: 'Medium',
    status: 'Resolved',
    reporterId: 'st-1',
    reporterName: 'James Wilson',
    location: 'Electronics Lab A - Room 110',
    category: 'Projector',
    createdAt: '2026-06-01',
  },
]

const statusOptions = ['All', 'Open', 'In Progress', 'Resolved']
const priorityOptions = ['All', 'High', 'Medium', 'Low']
const categoryOptions = ['Projector', 'Computers', 'Network', 'Software', 'Electrical', 'Other']

function getNextStatus(status) {
  if (status === 'Open') return 'In Progress'
  if (status === 'In Progress') return 'Resolved'
  return 'Resolved'
}

function formatDate(dateText) {
  return new Date(dateText).toLocaleDateString('en-GB')
}

export default function App() {
  const [issues, setIssues] = useState(initialIssues)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Projector',
    priority: 'Medium',
  })

  const visibleIssues = useMemo(() => {
    if (!currentUser) return []
    return currentUser.role === 'fixer'
      ? issues
      : issues.filter((issue) => issue.reporterId === currentUser.id)
  }, [currentUser, issues])

  const filteredIssues = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return visibleIssues.filter((issue) => {
      const statusMatch = statusFilter === 'All' || issue.status === statusFilter
      const priorityMatch = priorityFilter === 'All' || issue.priority === priorityFilter
      const searchMatch =
        normalized.length === 0 ||
        [issue.title, issue.location, issue.category, issue.reporterName]
          .join(' ')
          .toLowerCase()
          .includes(normalized)

      return statusMatch && priorityMatch && searchMatch
    })
  }, [priorityFilter, query, statusFilter, visibleIssues])

  const summary = useMemo(() => {
    const fromList = currentUser?.role === 'fixer' ? issues : visibleIssues
    const open = fromList.filter((issue) => issue.status === 'Open').length
    const inProgress = fromList.filter((issue) => issue.status === 'In Progress').length
    const resolved = fromList.filter((issue) => issue.status === 'Resolved').length
    const high = fromList.filter((issue) => issue.priority === 'High').length

    return [
      { label: 'Total Issues', value: fromList.length },
      { label: 'Open', value: open },
      { label: 'In Progress', value: inProgress },
      { label: 'Resolved', value: resolved },
      { label: 'High Priority', value: high },
    ]
  }, [currentUser?.role, issues, visibleIssues])

  const handleLogin = (event) => {
    event.preventDefault()
    const user = demoUsers.find((item) => item.username === username && item.password === password)

    if (!user) {
      setAuthError('Invalid credentials. Try demo accounts shown below.')
      return
    }

    setCurrentUser(user)
    setAuthError('')
    setQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUsername('')
    setPassword('')
  }

  const handleIssueSubmit = (event) => {
    event.preventDefault()
    if (!currentUser || currentUser.role !== 'client') return

    const created = {
      id: Date.now(),
      title: newIssue.title.trim(),
      description: newIssue.description.trim(),
      location: newIssue.location.trim(),
      category: newIssue.category,
      priority: newIssue.priority,
      status: 'Open',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
    }

    if (!created.title || !created.description || !created.location) return

    setIssues((prev) => [created, ...prev])
    setNewIssue({
      title: '',
      description: '',
      location: '',
      category: 'Projector',
      priority: 'Medium',
    })
  }

  const handleStatusUpdate = (issueId) => {
    if (currentUser?.role !== 'fixer') return
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: getNextStatus(issue.status) } : issue,
      ),
    )
  }

  if (!currentUser) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <h1>🔧 LabFix Login</h1>
          <p>Login as a requester (student/client) or lab fixer (admin resolver).</p>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Username
              <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit">Login</button>
          </form>

          {authError ? <p className="error">{authError}</p> : null}

          <div className="demo-box">
            <p>
              <strong>Demo accounts:</strong>
            </p>
            <p>Fixer: fixer / fixer123</p>
            <p>Student: james / student123</p>
            <p>Student: michael / student123</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand">🔧 LabFix</p>
          <p className="sub">{currentUser.role === 'fixer' ? 'Lab Fixer Dashboard' : 'Client Requester Portal'}</p>
        </div>
        <div className="userbar">
          <span>{currentUser.name}</span>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {currentUser.role === 'client' ? (
        <section className="create-panel">
          <h2>Post a Lab Fault</h2>
          <form className="create-form" onSubmit={handleIssueSubmit}>
            <input
              placeholder="Issue title"
              value={newIssue.title}
              onChange={(event) => setNewIssue((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              placeholder="Lab location"
              value={newIssue.location}
              onChange={(event) => setNewIssue((prev) => ({ ...prev, location: event.target.value }))}
            />
            <textarea
              placeholder="Describe the fault (projector, computers, network, etc.)"
              value={newIssue.description}
              onChange={(event) =>
                setNewIssue((prev) => ({ ...prev, description: event.target.value }))
              }
            />
            <div className="row-inputs">
              <select
                value={newIssue.category}
                onChange={(event) => setNewIssue((prev) => ({ ...prev, category: event.target.value }))}
              >
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select
                value={newIssue.priority}
                onChange={(event) => setNewIssue((prev) => ({ ...prev, priority: event.target.value }))}
              >
                {priorityOptions.filter((item) => item !== 'All').map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
              <button type="submit">Post Issue</button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="stat-grid">
        {summary.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h3>{stat.value}</h3>
          </article>
        ))}
      </section>

      <section className="filter-panel">
        <input
          className="search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search issues..."
        />
        <div className="filter-row">
          <div className="chips">
            {statusOptions.map((status) => (
              <button
                type="button"
                className={`chip ${statusFilter === status ? 'active' : ''}`}
                key={status}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="chips">
            {priorityOptions.map((priority) => (
              <button
                type="button"
                className={`chip ${priorityFilter === priority ? 'active' : ''}`}
                key={priority}
                onClick={() => setPriorityFilter(priority)}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">
          {currentUser.role === 'fixer' ? 'All Reported Issues' : 'My Posted Issues'} ({filteredIssues.length})
        </h2>
        <div className="issue-list">
          {filteredIssues.map((issue) => (
            <article className="issue-card" key={issue.id}>
              <div className="badges">
                <span className={`badge ${issue.priority === 'High' ? 'danger' : 'neutral'}`}>
                  {issue.priority}
                </span>
                <span className="badge info">{issue.status}</span>
                <span className="badge neutral">{issue.category}</span>
              </div>
              <h4>{issue.title}</h4>
              <p>{issue.description}</p>
              <div className="meta">
                <span>📍 {issue.location}</span>
                <span>📅 {formatDate(issue.createdAt)}</span>
                {currentUser.role === 'fixer' ? <span>👤 {issue.reporterName}</span> : null}
              </div>
              {currentUser.role === 'fixer' ? (
                <button
                  type="button"
                  className="resolve-btn"
                  onClick={() => handleStatusUpdate(issue.id)}
                  disabled={issue.status === 'Resolved'}
                >
                  {issue.status === 'Resolved' ? 'Resolved' : 'Move to Next Stage'}
                </button>
              ) : null}
            </article>
          ))}

          {filteredIssues.length === 0 ? (
            <article className="empty-state">
              <p>No issues found for selected filters.</p>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  )
}
