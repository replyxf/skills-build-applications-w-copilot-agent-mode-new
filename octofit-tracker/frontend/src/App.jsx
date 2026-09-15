import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'

import ActivityForm from './components/ActivityForm.jsx'
import ActivityList from './components/ActivityList.jsx'
import BadgeDisplay from './components/BadgeDisplay.jsx'
import ChallengeTracker from './components/ChallengeTracker.jsx'
import LeaderboardView from './components/LeaderboardView.jsx'
import Navigation from './components/Navigation.jsx'
import NotificationCenter from './components/NotificationCenter.jsx'
import TeamManagement from './components/TeamManagement.jsx'
import UserDashboard from './components/UserDashboard.jsx'
import { API_BASE_URL, apiRequest } from './config/api.js'

async function fetchAppData(userId = '') {
  const [nextUsers, nextActivities, nextLeaderboard, nextTeamLeaderboard, nextTeams] = await Promise.all([
    apiRequest('/api/users'),
    apiRequest('/api/activities'),
    apiRequest('/api/leaderboard'),
    apiRequest('/api/leaderboard/teams'),
    apiRequest('/api/teams'),
  ])
  const activeUserId = userId || nextUsers[0]?._id || ''
  const [nextBadges, nextChallenges, nextNotifications] = activeUserId
    ? await Promise.all([
      apiRequest(`/api/badges/${activeUserId}`),
      apiRequest(`/api/challenges?userId=${activeUserId}`),
      apiRequest(`/api/notifications/${activeUserId}`),
    ])
    : [[], await apiRequest('/api/challenges'), []]

  return {
    activeUserId,
    nextActivities,
    nextBadges,
    nextChallenges,
    nextLeaderboard,
    nextNotifications,
    nextTeamLeaderboard,
    nextTeams,
    nextUsers,
  }
}

function App() {
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [teams, setTeams] = useState([])
  const [badges, setBadges] = useState([])
  const [challenges, setChallenges] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [toast, setToast] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData(userId = selectedUserId) {
    try {
      const data = await fetchAppData(userId)

      setError('')
      setSelectedUserId(data.activeUserId)
      setUsers(data.nextUsers)
      setActivities(data.nextActivities)
      setLeaderboard(data.nextLeaderboard)
      setTeamLeaderboard(data.nextTeamLeaderboard)
      setTeams(data.nextTeams)
      setBadges(data.nextBadges)
      setChallenges(data.nextChallenges)
      setNotifications(data.nextNotifications)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const data = await fetchAppData()

        setError('')
        setSelectedUserId(data.activeUserId)
        setUsers(data.nextUsers)
        setActivities(data.nextActivities)
        setLeaderboard(data.nextLeaderboard)
        setTeamLeaderboard(data.nextTeamLeaderboard)
        setTeams(data.nextTeams)
        setBadges(data.nextBadges)
        setChallenges(data.nextChallenges)
        setNotifications(data.nextNotifications)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    })
  }, [])

  async function createActivity(activity) {
    const result = await apiRequest('/api/activities', {
      body: JSON.stringify(activity),
      method: 'POST',
    })
    const earnedNames = result.badges?.map((badge) => badge.name).join(', ')
    setToast(earnedNames ? `Activity saved. Badge earned: ${earnedNames}` : 'Activity saved and leaderboard updated.')
    await loadData(activity.userId)
  }

  async function createTeam(team) {
    await apiRequest('/api/teams', {
      body: JSON.stringify(team),
      method: 'POST',
    })
    setToast('Team created.')
    await loadData()
  }

  async function addTeamMember(teamId, userId) {
    const result = await apiRequest(`/api/teams/${teamId}/members`, {
      body: JSON.stringify({ userId }),
      method: 'POST',
    })
    const earnedNames = result.badges?.map((badge) => badge.name).join(', ')
    setToast(earnedNames ? `Member added. Badge earned: ${earnedNames}` : 'Member added to team.')
    await loadData(userId)
  }

  async function updateChallengeProgress(challengeId) {
    await apiRequest(`/api/challenges/${challengeId}/progress`, {
      body: JSON.stringify({ userId: selectedUserId, progress: 1 }),
      method: 'POST',
    })
    setToast('Challenge progress updated.')
    await loadData(selectedUserId)
  }

  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-main">
        <section className="status-bar" aria-live="polite">
          <span>API</span>
          <code>{API_BASE_URL}</code>
          <select className="form-select user-switcher" onChange={(event) => loadData(event.target.value)} value={selectedUserId}>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
          <button className="btn btn-sm btn-outline-dark" onClick={loadData} type="button">Refresh</button>
        </section>
        {toast && (
          <div className="toast-banner" role="status">
            <span>{toast}</span>
            <button className="btn-close" onClick={() => setToast('')} type="button" aria-label="Dismiss notification"></button>
          </div>
        )}
        {isLoading && <div className="alert alert-info">Loading OctoFit data...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!isLoading && !error && (
          <Routes>
            <Route
              path="/"
              element={(
                <div className="dashboard-stack">
                  <UserDashboard activities={activities} leaderboard={leaderboard} users={users} />
                  <div className="content-grid">
                    <BadgeDisplay badges={badges} />
                    <NotificationCenter notifications={notifications} />
                  </div>
                </div>
              )}
            />
            <Route
              path="/activities"
              element={(
                <div className="content-grid">
                  <ActivityForm onSubmit={createActivity} users={users} />
                  <ActivityList activities={activities} users={users} />
                </div>
              )}
            />
            <Route
              path="/leaderboard"
              element={(
                <div className="dashboard-stack">
                  <LeaderboardView leaderboard={leaderboard} teamLeaderboard={teamLeaderboard} />
                  <ChallengeTracker challenges={challenges} onUpdateProgress={updateChallengeProgress} selectedUserId={selectedUserId} />
                </div>
              )}
            />
            <Route path="/teams" element={<TeamManagement onAddMember={addTeamMember} onCreateTeam={createTeam} teams={teams} users={users} />} />
          </Routes>
        )}
      </main>
    </div>
  )
}

export default App
