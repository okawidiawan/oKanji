import { useState, useEffect } from 'react'
import { getHealth, getUsers } from './api'
import './index.css'

function App() {
  const [health, setHealth] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthData = await getHealth()
        setHealth(healthData)
        
        const usersData = await getUsers()
        setUsers(usersData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      <h1>oKanji Fullstack</h1>
      <p className="subtitle">React + Express + Prisma + MySQL</p>

      {loading ? (
        <p>Connecting to backend...</p>
      ) : (
        <div className="card">
          <div className={`status-box ${error ? 'error' : ''}`}>
            {error ? 'Backend Offline' : 'Backend Online: ' + health?.message}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Users from Database</h3>
            {users.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No users found. Did you run migrations and seed?</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map(user => (
                  <li key={user.id} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', fontSize: '0.8rem', opacity: 0.5 }}>
        <p>Ready for implementation by Junior Developer / AI Model</p>
      </div>
    </div>
  )
}

export default App
