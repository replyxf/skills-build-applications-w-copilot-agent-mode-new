function ActivityList({ activities, users }) {
  function userNameFor(activity) {
    const userId = activity.userId?._id ?? activity.userId
    return users.find((user) => user._id === userId)?.name ?? 'Unknown user'
  }

  return (
    <section className="panel list-panel">
      <div className="section-heading">
        <span className="eyebrow">Recent activities</span>
        <h2>Training log</h2>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <article className="activity-item" key={activity._id}>
            <div>
              <strong>{userNameFor(activity)}</strong>
              <span>{new Date(activity.date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="activity-type">{activity.activityType}</span>
              <span>{activity.duration} min</span>
              <span>{Number(activity.distance).toFixed(1)} km</span>
              <span>{activity.calories} cal</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ActivityList