function ChallengeTracker({ challenges, selectedUserId, onUpdateProgress }) {
  return (
    <section className="panel list-panel">
      <div className="section-heading">
        <span className="eyebrow">Challenges</span>
        <h2>Active goals</h2>
      </div>
      <div className="challenge-list">
        {challenges.map((challenge) => {
          const userProgress = challenge.userProgress ?? 0
          const percent = Math.min(100, Math.round((userProgress / challenge.goal) * 100))

          return (
            <article className="challenge-card" key={challenge._id}>
              <div>
                <strong>{challenge.name}</strong>
                <p>{challenge.description}</p>
              </div>
              <div className="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
                <div className="progress-bar" style={{ width: `${percent}%` }}>{percent}%</div>
              </div>
              <div className="challenge-meta">
                <span>{userProgress} / {challenge.goal}</span>
                <span>{challenge.rewardPoints} pts</span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={!selectedUserId}
                  onClick={() => onUpdateProgress(challenge._id)}
                  type="button"
                >
                  Update
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ChallengeTracker