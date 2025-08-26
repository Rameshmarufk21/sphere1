import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Spotlight({ onAdded }) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [waitingForLocation, setWaitingForLocation] = useState(false)
  const [pickedCoords, setPickedCoords] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      const { lat, lng } = e.detail
      setPickedCoords({ lat, lng })
      setWaitingForLocation(false)
    }
    window.addEventListener('memory-add-location', handler)
    return () => window.removeEventListener('memory-add-location', handler)
  }, [])

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }, [file])

  const handleAttach = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const requestPickLocation = () => {
    setWaitingForLocation(true)
  }

  const submit = async () => {
    if (!pickedCoords) {
      requestPickLocation()
      return
    }
    const form = new FormData()
    form.append('id', 'm_' + Date.now())
    form.append('title', title)
    form.append('type', file ? 'photo' : 'text')
    form.append('createdAt', ''+Date.now())
    form.append('lat', ''+pickedCoords.lat)
    form.append('lng', ''+pickedCoords.lng)
    form.append('note', '')
    if (file) form.append('file', file)
    if (preview) form.append('preview', preview)

    try {
      await axios.post('http://localhost:5000/api/memories', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTitle(''); setFile(null); setPreview(null); setPickedCoords(null)
      onAdded && onAdded()
    } catch (err) {
      console.error(err)
      alert('Failed to save memory')
    }
  }

  return (
    <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[680px] p-4 rounded-2xl spotlight">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="What memory do you want to add?" className="w-full bg-transparent text-white text-xl placeholder:text-white/60 outline-none" />
          <div className="mt-2 flex items-center gap-2">
            <label className="text-sm text-white/70">Attach</label>
            <input type="file" accept="image/*,video/*,.pdf" onChange={handleAttach} />
            {file && <div className="text-xs text-white/60">{file.name}</div>}
          </div>
        </div>

        <div className="w-44">
          <div className="text-xs text-white/60 mb-2">Location</div>
          <div className="flex flex-col gap-2">
            <button onClick={requestPickLocation} className="px-3 py-2 rounded bg-white/6 text-sm">Pick on Globe</button>
            <button onClick={()=>{
              navigator.geolocation.getCurrentPosition(pos=>{
                const { latitude: lat, longitude: lng } = pos.coords
                setPickedCoords({ lat, lng })
              })
            }} className="px-3 py-2 rounded bg-white/6 text-sm">Use Current Location</button>
          </div>
          {pickedCoords && (<div className="mt-2 text-xs text-white/70">{pickedCoords.lat.toFixed(6)}, {pickedCoords.lng.toFixed(6)}</div>)}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button onClick={()=>{ setTitle(''); setFile(null); setPreview(null); setPickedCoords(null) }} className="px-4 py-2 rounded bg-white/6">Cancel</button>
        <button onClick={submit} className="px-4 py-2 rounded bg-blue-600">Save Memory</button>
      </div>

      {waitingForLocation && (<div className="mt-3 text-sm text-white/80">Click anywhere on the globe to pick the location.</div>)}
    </div>
  )
}
