import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function MapGlobe({ memories, mode, onRefresh }) {
  const mapRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapboxgl.accessToken ? 'mapbox://styles/mapbox/satellite-streets-v12' : 'https://demotiles.maplibre.org/style.json',
      center: [-0.1276, 51.5074],
      zoom: 2,
      projection: 'globe'
    })

    map.on('load', () => {
      map.setFog({})
    })

    mapRef.current = map
    return () => map.remove()
  }, [])

  // update markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // remove existing DOM markers
    document.querySelectorAll('.memory-dom-marker').forEach(e => e.remove())

    memories.forEach(mem => {
      const el = document.createElement('div')
      el.className = 'memory-dom-marker'
      el.style.cursor = 'pointer'
      el.style.width = '84px'
      el.style.height = '84px'
      el.style.borderRadius = '14px'
      el.style.overflow = 'hidden'
      el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6)'
      el.style.border = '3px solid rgba(255,255,255,0.9)'
      el.style.background = '#111'

      if (mem.preview) {
        const img = document.createElement('img')
        img.src = mem.preview.startsWith('/') ? ('http://localhost:5000' + mem.preview) : mem.preview
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.objectFit = 'cover'
        el.appendChild(img)
      } else {
        el.innerText = mem.title || 'Memory'
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([mem.lng, mem.lat])
        .addTo(map)

      el.addEventListener('click', () => {
        // center and zoom in
        map.flyTo({ center: [mem.lng, mem.lat], zoom: 16, duration: 1200 })
      })

      el.addEventListener('mouseenter', () => {
        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
          .setLngLat([mem.lng, mem.lat])
          .setHTML(`<div style="min-width:160px"><div style="font-weight:600">${mem.title || 'Memory'}</div><div style="font-size:12px;color:#bbb">${new Date(mem.createdAt).toLocaleString()}</div></div>`)
          .addTo(map)
        el.addEventListener('mouseleave', () => popup.remove(), { once: true })
      })
    })
  }, [memories])

  // handle add mode click
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.getCanvas().style.cursor = mode === 'add' ? 'crosshair' : ''
    let handler = null
    if (mode === 'add') {
      handler = (e) => {
        const { lngLat } = e
        window.dispatchEvent(new CustomEvent('memory-add-location', { detail: { lat: lngLat.lat, lng: lngLat.lng } }))
      }
      map.on('click', handler)
    }
    return () => {
      if (handler) map.off('click', handler)
    }
  }, [mode])

  return <div ref={containerRef} className="map-container" />
}
