import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'

import ActivityForm from './components/ActivityForm.jsx'
import ActivityList from './components/ActivityList.jsx'
import LeaderboardView from './components/LeaderboardView.jsx'
import Navigation from './components/Navigation.jsx'
import TeamManagement from './components/TeamManagement.jsx'
import UserDashboard from './components/UserDashboard.jsx'
import { API_BASE_URL, apiRequest } from './config/api.js'

function App() {
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      const [nextUsers, nextActivities, nextLeaderboard, nextTeamLeaderboard, nextTeams] = await Promise.all([
        apiRequest('/api/users'),
        apiRequest('/api/activities'),
        apiRequest('/api/leaderboard'),
        apiRequest('/api/leaderboard/teams'),
        apiRequest('/api/teams'),
      ])

      setError('')
      setUsers(nextUsers)
      setActivities(nextActivities)
      setLeaderboard(nextLeaderboard)
      setTeamLeaderboard(nextTeamLeaderboard)
      setTeams(nextTeams)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(loadData)
  }, [])

  async function createActivity(activity) {
    await apiRequest('/api/activities', {
      body: JSON.stringify(activity),
      method: 'POST',
    })
    await loadData()
  }

  async function createTeam(team) {
    await apiRequest('/api/teams', {
      body: JSON.stringify(team),
      method: 'POST',
    })
    await loadData()
  }

  async function addTeamMember(teamId, userId) {
    await apiRequest(`/api/teams/${teamId}/members`, {
      body: JSON.stringify({ userId }),
      method: 'POST',
    })
    await loadData()
  }

  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-main">
        <section className="status-bar" aria-live="polite">
          <span>API</span>
          <code>{API_BASE_URL}</code>
          <button className="btn btn-sm btn-outline-dark" onClick={loadData} type="button">Refresh</button>
        </section>
        {isLoading && <div className="alert alert-info">Loading OctoFit data...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!isLoading && !error && (
          <Routes>
            <Route path="/" element={<UserDashboard activities={activities} leaderboard={leaderboard} users={users} />} />
            <Route
              path="/activities"
              element={(
                <div className="content-grid">
                  <ActivityForm onSubmit={createActivity} users={users} />
                  <ActivityList activities={activities} users={users} />
                </div>
              )}
            />
            <Route path="/leaderboard" element={<LeaderboardView leaderboard={leaderboard} teamLeaderboard={teamLeaderboard} />} />
            <Route path="/teams" element={<TeamManagement onAddMember={addTeamMember} onCreateTeam={createTeam} teams={teams} users={users} />} />
          </Routes>
        )}
      </main>
    </div>
  )
}

export default App
