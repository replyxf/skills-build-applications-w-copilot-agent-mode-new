function BadgeDisplay({ badges }) {
  const earnedCount = badges.filter((badge) => badge.earned).length

  return (
    <section className="panel list-panel">
      <div className="section-heading">
        <span className="eyebrow">Badges</span>
        <h2>{earnedCount} earned</h2>
      </div>
      <div className="badge-grid">
        {badges.map((badge) => (
          <article className={`badge-card${badge.earned ? ' earned' : ''}`} key={badge.badgeId}>
            <span className="badge-icon">{badge.icon}</span>
            <div>
              <strong>{badge.name}</strong>
              <p>{badge.description}</p>
              <small>{badge.earned ? `Earned ${new Date(badge.earnedAt).toLocaleDateString()}` : badge.criteria}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BadgeDisplay