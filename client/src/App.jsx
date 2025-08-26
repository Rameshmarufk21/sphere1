import React, { useEffect, useState } from 'react'
import MapGlobe from './components/MapGlobe'
import Spotlight from './components/Spotlight'
import axios from 'axios'

export default function App() {
  const [mode, setMode] = useState('view')
  const [memories, setMemories] = useState([])

  const fetchMemories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/memories')
      setMemories(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchMemories()
  }, [])

  return (
    <div style={{width:'100%', height:'100vh', position:'relative'}}>
      <MapGlobe memories={memories} mode={mode} onRefresh={fetchMemories} />
      <div className="absolute top-4 left-4 z-40">
        <div className="bg-white/6 text-white rounded-lg p-2 shadow-lg flex items-center space-x-2">
          <label className="text-xs opacity-80">Mode</label>
          <select value={mode} onChange={e=>setMode(e.target.value)} className="bg-transparent text-white text-sm outline-none">
            <option value="view">View</option>
            <option value="add">Add Memory</option>
          </select>
        </div>
      </div>
      {mode === 'add' && <Spotlight onAdded={() => { setMode('view'); fetchMemories(); }} />}
    </div>
  )
}
