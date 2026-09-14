import { useState } from 'react'

const initialForm = {
  userId: '',
  activityType: 'running',
  duration: '',
  distance: '',
  calories: '',
  date: new Date().toISOString().slice(0, 10),
}

function ActivityForm({ users, onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    const nextErrors = {}

    if (!form.userId) {
      nextErrors.userId = 'Choose a user.'
    }

    if (Number(form.duration) <= 0) {
      nextErrors.duration = 'Duration must be greater than zero.'
    }

    if (form.activityType !== 'strength' && Number(form.distance) <= 0) {
      nextErrors.distance = 'Distance is required for running and walking.'
    }

    if (Number(form.calories) < 0 || form.calories === '') {
      nextErrors.calories = 'Calories must be zero or greater.'
    }

    if (!form.date) {
      nextErrors.date = 'Choose a date.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function submitForm(event) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setIsSaving(true)

    try {
      await onSubmit({
        userId: form.userId,
        activityType: form.activityType,
        duration: Number(form.duration),
        distance: form.activityType === 'strength' ? 0 : Number(form.distance),
        calories: Number(form.calories),
        date: new Date(form.date).toISOString(),
      })
      setForm({ ...initialForm, userId: form.userId, activityType: form.activityType })
      setErrors({})
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="panel activity-form" onSubmit={submitForm} noValidate>
      <div>
        <span className="eyebrow">Log activity</span>
        <h2>Keep the board moving</h2>
      </div>
      <label>
        User
        <select className="form-select" name="userId" value={form.userId} onChange={updateField}>
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        {errors.userId && <span className="field-error">{errors.userId}</span>}
      </label>
      <label>
        Activity type
        <select className="form-select" name="activityType" value={form.activityType} onChange={updateField}>
          <option value="running">Running</option>
          <option value="walking">Walking</option>
          <option value="strength">Strength</option>
        </select>
      </label>
      <div className="form-row">
        <label>
          Duration
          <input className="form-control" min="1" name="duration" onChange={updateField} type="number" value={form.duration} />
          {errors.duration && <span className="field-error">{errors.duration}</span>}
        </label>
        <label>
          Distance
          <input className="form-control" min="0" name="distance" onChange={updateField} step="0.1" type="number" value={form.distance} />
          {errors.distance && <span className="field-error">{errors.distance}</span>}
        </label>
      </div>
      <div className="form-row">
        <label>
          Calories
          <input className="form-control" min="0" name="calories" onChange={updateField} type="number" value={form.calories} />
          {errors.calories && <span className="field-error">{errors.calories}</span>}
        </label>
        <label>
          Date
          <input className="form-control" name="date" onChange={updateField} type="date" value={form.date} />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </label>
      </div>
      <button className="btn btn-primary" disabled={isSaving} type="submit">
        {isSaving ? 'Saving...' : 'Log activity'}
      </button>
    </form>
  )
}

export default ActivityForm