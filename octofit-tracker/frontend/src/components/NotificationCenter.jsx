function NotificationCenter({ notifications }) {
  return (
    <section className="panel notification-panel">
      <div className="section-heading">
        <span className="eyebrow">Notifications</span>
        <h2>Latest alerts</h2>
      </div>
      <div className="notification-list">
        {notifications.length === 0 && <p>No alerts yet.</p>}
        {notifications.map((notification) => (
          <article className="notification-item" key={notification._id}>
            <strong>{notification.type}</strong>
            <p>{notification.message}</p>
            <span>{new Date(notification.createdAt).toLocaleString()}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default NotificationCenter