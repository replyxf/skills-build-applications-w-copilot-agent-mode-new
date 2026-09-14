function UserDashboard({ users, activities, leaderboard }) {
  const featuredUser = users[0]
  const userActivities = featuredUser
    ? activities.filter((activity) => activity.userId === featuredUser._id || activity.userId?._id === featuredUser._id)
    : []
  const userRanking = featuredUser
    ? leaderboard.find((entry) => entry.userId?._id === featuredUser._id || entry.userId === featuredUser._id)
    : null
  const totalDistance = userActivities.reduce((total, activity) => total + Number(activity.distance || 0), 0)
  const totalDuration = userActivities.reduce((total, activity) => total + Number(activity.duration || 0), 0)

  return (
    <section className="dashboard-grid" aria-label="User dashboard">
      <div className="panel profile-panel">
        <span className="eyebrow">Featured profile</span>
        <h1>{featuredUser?.name ?? 'No users yet'}</h1>
        <p>{featuredUser?.email ?? 'Create a user through the API to begin tracking activity.'}</p>
        <div className="rank-badge">
          <span>Rank</span>
          <strong>{userRanking?.rank ?? '-'}</strong>
        </div>
      </div>
      <div className="metric-strip">
        <div className="metric-card">
          <span>Points</span>
          <strong>{userRanking?.points ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span>Distance</span>
          <strong>{totalDistance.toFixed(1)} km</strong>
        </div>
        <div className="metric-card">
          <span>Duration</span>
          <strong>{totalDuration} min</strong>
        </div>
      </div>
      <div className="panel activity-summary">
        <span className="eyebrow">Recent effort</span>
        <h2>{userActivities.length} logged activities</h2>
        <p>
          Running, walking, and strength sessions update the leaderboard as soon as the activity is saved.
        </p>
      </div>
    </section>
  )
}

export default UserDashboard