import { useState } from 'react'

function TeamManagement({ teams, users, onCreateTeam, onAddMember }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [memberSelections, setMemberSelections] = useState({})
  const [error, setError] = useState('')

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function createTeam(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.description.trim()) {
      setError('Team name and description are required.')
      return
    }

    await onCreateTeam({ ...form, members: [] })
    setForm({ name: '', description: '' })
    setError('')
  }

  async function addMember(teamId) {
    const userId = memberSelections[teamId]

    if (!userId) {
      setError('Choose a user before adding a member.')
      return
    }

    await onAddMember(teamId, userId)
    setMemberSelections((current) => ({ ...current, [teamId]: '' }))
    setError('')
  }

  return (
    <div className="team-grid">
      <form className="panel team-form" onSubmit={createTeam}>
        <span className="eyebrow">Team management</span>
        <h2>Create a team</h2>
        <label>
          Name
          <input className="form-control" name="name" onChange={updateForm} value={form.name} />
        </label>
        <label>
          Description
          <textarea className="form-control" name="description" onChange={updateForm} rows="3" value={form.description} />
        </label>
        {error && <div className="alert alert-warning py-2">{error}</div>}
        <button className="btn btn-primary" type="submit">Create team</button>
      </form>
      <section className="panel list-panel">
        <div className="section-heading">
          <span className="eyebrow">Membership</span>
          <h2>Teams and members</h2>
        </div>
        <div className="team-list">
          {teams.map((team) => (
            <article className="team-card" key={team._id}>
              <div>
                <strong>{team.name}</strong>
                <p>{team.description}</p>
              </div>
              <div className="member-list">
                {(team.members ?? []).map((member) => (
                  <span key={member._id ?? member}>{member.name ?? member}</span>
                ))}
              </div>
              <div className="add-member-row">
                <select
                  className="form-select"
                  onChange={(event) => setMemberSelections((current) => ({ ...current, [team._id]: event.target.value }))}
                  value={memberSelections[team._id] ?? ''}
                >
                  <option value="">Add member</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
                <button className="btn btn-outline-primary" onClick={() => addMember(team._id)} type="button">Add</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default TeamManagement