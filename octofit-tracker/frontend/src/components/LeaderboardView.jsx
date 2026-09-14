function LeaderboardView({ leaderboard, teamLeaderboard }) {
  return (
    <div className="leaderboard-grid">
      <section className="panel list-panel">
        <div className="section-heading">
          <span className="eyebrow">Ranked users</span>
          <h2>User leaderboard</h2>
        </div>
        <div className="rank-list">
          {leaderboard.map((entry) => (
            <article className="rank-row" key={entry._id}>
              <span className="rank-number">#{entry.rank}</span>
              <div>
                <strong>{entry.userId?.name ?? 'Unknown user'}</strong>
                <span>{entry.totalDistance.toFixed(1)} km · {entry.totalDuration} min</span>
              </div>
              <strong>{entry.points} pts</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="panel list-panel">
        <div className="section-heading">
          <span className="eyebrow">Team standings</span>
          <h2>Team leaderboard</h2>
        </div>
        <div className="rank-list">
          {teamLeaderboard.map((team) => (
            <article className="rank-row" key={team._id}>
              <span className="rank-number">#{team.rank}</span>
              <div>
                <strong>{team.name}</strong>
                <span>{team.members?.length ?? 0} members · {team.totalDistance.toFixed(1)} km</span>
              </div>
              <strong>{team.points} pts</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default LeaderboardView