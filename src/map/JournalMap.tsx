import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Spot } from '../models/types';

export function JournalMap({ spots, onSelect, picking = false, onPick, focusTarget }: { spots: Spot[]; onSelect: (id: string) => void; picking?: boolean; onPick?: (lat: number, lng: number) => void; focusTarget?: { id: string; request: number } | null }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const locationLayer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const callbacks = useRef({ onSelect, onPick, picking }); callbacks.current = { onSelect, onPick, picking };
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [hasLocation, setHasLocation] = useState(false);

  function locate() {
    const instance = map.current;
    if (!instance || locating) return;
    if (!window.isSecureContext) {
      setLocationStatus('Location needs HTTPS. Open the deployed site on your phone to use this feature.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus('This browser does not support device location.');
      return;
    }
    setLocating(true);
    setLocationStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(position => {
      if (map.current !== instance || !locationLayer.current) return;
      const { latitude, longitude, accuracy } = position.coords;
      const coordinates: L.LatLngExpression = [latitude, longitude];
      locationLayer.current.clearLayers();
      const area = L.circle(coordinates, { radius: accuracy, color: '#276eae', weight: 1, fillOpacity: 0.12 }).addTo(locationLayer.current);
      L.circleMarker(coordinates, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#276eae', fillOpacity: 1 }).bindTooltip('Your current location').addTo(locationLayer.current);
      instance.fitBounds(area.getBounds(), { maxZoom: 16, padding: [40, 40], animate: false });
      setHasLocation(true);
      setLocating(false);
      setLocationStatus(`Location found. Reported accuracy: approximately ${Math.round(accuracy)} metres. Tap My location again to update.`);
    }, failure => {
      if (map.current !== instance) return;
      setLocating(false);
      setLocationStatus(failure.code === 1
        ? 'Location permission was denied. Allow location for this site in your browser settings, then try again.'
        : failure.code === 3
          ? 'Finding your location timed out. Try again where your phone has a clearer signal.'
          : 'Your location is unavailable. Check that device location is enabled, then try again.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }

  function hideLocation() {
    locationLayer.current?.clearLayers();
    setHasLocation(false);
    setLocationStatus('Your position is hidden.');
  }
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current).setView([59.4, 15.2], 7);
    map.current = instance; layer.current = L.layerGroup().addTo(instance);
    locationLayer.current = L.layerGroup().addTo(instance);
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}config/map.json`, { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(config => {
      if (controller.signal.aborted) return;
      if (typeof config.tileUrl !== 'string' || !config.tileUrl.startsWith('https://')) throw new Error();
      // Attribution is fixed trusted application text, not arbitrary config HTML.
      L.tileLayer(config.tileUrl, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).on('tileerror', () => setError('Map tiles are unavailable. Your spots are still available in the list.')).addTo(instance);
    }).catch(e => { if (e.name !== 'AbortError') setError('The base map could not load. Use the list to browse your spots.'); });
    instance.on('click', e => { if (callbacks.current.picking) callbacks.current.onPick?.(e.latlng.lat, e.latlng.lng); });
    const resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(container.current);
    return () => { controller.abort(); resize.disconnect(); instance.remove(); map.current = null; layer.current = null; locationLayer.current = null; };
  }, []);
  useEffect(() => {
    const group = layer.current; const instance = map.current; if (!group || !instance) return;
    group.clearLayers(); markers.current.clear();
    for (const spot of spots) {
      const fish = spot.category === 'fishing';
      const icon = L.divIcon({ className: 'spot-marker', html: `<span class="pin ${fish ? 'water' : 'forest'}">${fish ? '≈' : '♠'}</span>`, iconSize: [38, 44], iconAnchor: [19, 40] });
      const popup = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = spot.name; popup.append(title);
      const summary = document.createElement('p'); summary.textContent = `${spot.category} · ${spot.approximate ? 'Approximate area' : 'Saved coordinates'}`; popup.append(summary);
      const button = document.createElement('button'); button.textContent = 'Read journal'; button.onclick = () => callbacks.current.onSelect(spot.id); popup.append(button);
      const marker = L.marker([spot.latitude, spot.longitude], { icon, title: `${spot.name} (${spot.category})`, alt: `${spot.name} marker` }).bindPopup(popup).addTo(group);
      markers.current.set(spot.id, marker);
      if (spot.approximate) L.circle([spot.latitude, spot.longitude], { radius: spot.precisionKm * 1000, weight: 1, fillOpacity: 0.08 }).addTo(group);
    }
    if (spots.length) instance.fitBounds(L.latLngBounds(spots.map(s => [s.latitude, s.longitude] as [number, number])), { padding: [48, 48], maxZoom: 13 });
  }, [spots]);
  useEffect(() => {
    if (!focusTarget || !map.current) return;
    const marker = markers.current.get(focusTarget.id);
    const spot = spots.find(s => s.id === focusTarget.id);
    if (!marker || !spot) return;
    map.current.setView(marker.getLatLng(), spot.approximate ? 13 : 15, { animate: false });
    marker.openPopup();
    container.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }, [focusTarget, spots]);
  return <div className={`map-shell ${picking ? 'picking' : ''}`}><div ref={container} className="journal-map" aria-label="Spot map. Use the list for keyboard-accessible spot details." /><div className="map-location-controls"><button type="button" className="secondary" disabled={locating} onClick={locate}>{locating ? 'Locating…' : '⌖ My location'}</button>{hasLocation && <button type="button" className="secondary" disabled={locating} onClick={hideLocation}>Hide position</button>}</div>{locationStatus && <p className="map-location-status" role="status">{locationStatus}</p>}{picking && <p className="map-note">Tap the map to choose a location</p>}{error && <p className="map-error" role="status">{error}</p>}<a className="map-issue" href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">Report a map issue ↗</a></div>;
}
