import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  APIProvider, 
  Map, 
  Marker,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps'
import { fetchAllPlaces } from '../lib/places'
import { addToCollection, removeFromCollection, isInCollection } from '../lib/collections'
import { useUserStore } from '../store/userStore.js'
import '../App.css'

// CURA 미니멀 차콜 + 보라 라벨 v5
const curaMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#2a2a30' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a8a0c4' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a0f2e' }, { weight: 3 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#3a3a42' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#404049' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4a4a55' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e8e0ff' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: '#1a0f2e' }, { weight: 4 }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#a78bfa' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.stroke', stylers: [{ color: '#1a0f2e' }, { weight: 4 }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#8b5cf6' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.station.bus', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.station.airport', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#2d2a35' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a1a20' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7c6dab' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0a0613' }, { weight: 2 }] }
]

const curaMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <defs>
    <radialGradient id="grad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f5f0ff"/>
      <stop offset="28%" stop-color="#c4b5fd"/>
      <stop offset="58%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="20" cy="20" r="14" fill="#8b5cf6" opacity="0.3" filter="url(#glow)"/>
  <circle cx="20" cy="20" r="9" fill="url(#grad)" stroke="#f5f0ff" stroke-width="2"/>
</svg>
`
const curaMarkerIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(curaMarkerSvg)}`

const userLocationSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="userGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="16" cy="16" r="12" fill="#4285F4" opacity="0.25" filter="url(#userGlow)"/>
  <circle cx="16" cy="16" r="7" fill="#4285F4" stroke="#ffffff" stroke-width="2.5"/>
</svg>
`
const userLocationIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userLocationSvg)}`

function MapController({ targetCenter }) {
  const map = useMap()
  
  useEffect(() => {
    if (map && targetCenter) {
      map.panTo(targetCenter)
      map.setZoom(15)
    }
  }, [map, targetCenter])
  
  return null
}

function MapPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const user = useUserStore((state) => state.user)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [moveTarget, setMoveTarget] = useState(null)
  const [places, setPlaces] = useState([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true)
  
  // 💜 컬렉션 저장 상태 관리
  const [savedPlaceIds, setSavedPlaceIds] = useState(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const defaultCenter = {
    lat: 37.5665,
    lng: 126.9780
  }

  // Firestore에서 장소 데이터 불러오기
  useEffect(() => {
    async function loadPlaces() {
      setIsLoadingPlaces(true)
      const data = await fetchAllPlaces()
      setPlaces(data)
      setIsLoadingPlaces(false)
    }
    loadPlaces()
  }, [])

  // 💜 로그인된 사용자의 컬렉션 상태 미리 불러오기
  useEffect(() => {
    async function loadSavedStatus() {
      if (!user || places.length === 0) {
        setSavedPlaceIds(new Set())
        return
      }
      
      const savedSet = new Set()
      for (const place of places) {
        const isSaved = await isInCollection(user.uid, place.id)
        if (isSaved) savedSet.add(place.id)
      }
      setSavedPlaceIds(savedSet)
    }
    loadSavedStatus()
  }, [user, places])

  // 토스트 메시지 자동 사라짐
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(newLocation)
        setMoveTarget(newLocation)
        setIsLocating(false)
      },
      (error) => {
        let message = '위치를 가져올 수 없습니다.'
        if (error.code === 1) message = '위치 권한이 거부되었습니다.'
        if (error.code === 2) message = '위치 정보를 사용할 수 없습니다.'
        if (error.code === 3) message = '위치 요청 시간이 초과되었습니다.'
        setLocationError(message)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  useEffect(() => {
    fetchUserLocation()
  }, [])

  const openKakaoMap = (place) => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`
    window.open(url, '_blank')
  }

  const openNaverMap = (place) => {
    const url = `https://map.naver.com/v5/directions/-/${place.lng},${place.lat},${encodeURIComponent(place.name)},,/-/transit`
    window.open(url, '_blank')
  }

  const openGoogleMap = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
    window.open(url, '_blank')
  }

  // 💜 컬렉션 저장/삭제 토글
  const handleToggleCollection = async (place) => {
    if (!user) {
      setToast({ type: 'warning', message: '로그인이 필요해요!' })
      return
    }

    setIsSaving(true)
    const isSaved = savedPlaceIds.has(place.id)

    if (isSaved) {
      // 삭제
      const success = await removeFromCollection(user.uid, place.id)
      if (success) {
        const newSet = new Set(savedPlaceIds)
        newSet.delete(place.id)
        setSavedPlaceIds(newSet)
        setToast({ type: 'info', message: '컬렉션에서 삭제됐어요' })
      } else {
        setToast({ type: 'error', message: '삭제에 실패했어요' })
      }
    } else {
      // 저장
      const success = await addToCollection(user.uid, place)
      if (success) {
        const newSet = new Set(savedPlaceIds)
        newSet.add(place.id)
        setSavedPlaceIds(newSet)
        setToast({ type: 'success', message: '💜 컬렉션에 저장됐어요!' })
      } else {
        setToast({ type: 'error', message: '저장에 실패했어요' })
      }
    }
    setIsSaving(false)
  }

  const selectedPlace = places.find(p => p.id === selectedPlaceId)
  const isSelectedSaved = selectedPlace && savedPlaceIds.has(selectedPlace.id)

  return (
    <div className="app">
      {/* 우상단 사용자 프로필 (로그인 시) */}
      {user && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            right: '32px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px 6px 6px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '100px',
            color: '#c4b5fd',
            fontSize: '13px',
            fontWeight: '500',
            fontFamily: 'Pretendard, sans-serif',
            backdropFilter: 'blur(10px)'
          }}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid rgba(139, 92, 246, 0.5)'
              }}
            />
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              {user.displayName?.[0] || '?'}
            </div>
          )}
          <span>{user.displayName?.split(' ')[0] || '사용자'}</span>
        </div>
      )}

      <header
        className="top-section"
        style={{ padding: '60px 32px 30px 32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="brand-tagline"
            style={{
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            ← 메인으로
          </Link>
          
          {user && (
            <Link
              to="/my"
              style={{
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '2px',
                color: '#c4b5fd',
                padding: '6px 14px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '100px',
                background: 'rgba(139, 92, 246, 0.08)',
                backdropFilter: 'blur(10px)'
              }}
            >
              💜 내 컬렉션
            </Link>
          )}
        </div>
        
        <h1 className="brand-name" style={{ fontSize: '32px' }}>
          지도
        </h1>
        <p className="brand-tagline">
          {isLoadingPlaces 
            ? '장소를 불러오는 중...'
            : `서울의 감각적인 공간 ${places.length}곳`
          }
        </p>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        <APIProvider apiKey={apiKey}>
          <Map
            style={{ width: '100%', height: '70vh' }}
            defaultCenter={defaultCenter}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={false}
            styles={curaMapStyle}
          >
            <MapController targetCenter={moveTarget} />

            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: userLocationIcon,
                  scaledSize: { width: 32, height: 32 },
                  anchor: { x: 16, y: 16 }
                }}
                title="내 위치"
              />
            )}

            {places.map((place) => (
              <Marker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelectedPlaceId(place.id)}
                icon={{
                  url: curaMarkerIcon,
                  scaledSize: { width: 40, height: 40 },
                  anchor: { x: 20, y: 20 }
                }}
                title={place.name}
              />
            ))}

            {selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                onCloseClick={() => setSelectedPlaceId(null)}
                pixelOffset={[0, -20]}
              >
                <div style={{ padding: '8px 4px', minWidth: '240px', fontFamily: 'Pretendard, sans-serif' }}>
                  
                  {/* 카테고리 + 하트 버튼 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {selectedPlace.category}
                    </div>
                    <button
                      onClick={() => handleToggleCollection(selectedPlace)}
                      disabled={isSaving}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: isSaving ? 'wait' : 'pointer',
                        fontSize: '18px',
                        padding: '2px 4px',
                        lineHeight: '1'
                      }}
                      title={isSelectedSaved ? '컬렉션에서 삭제' : '컬렉션에 저장'}
                    >
                      {isSelectedSaved ? '💜' : '🤍'}
                    </button>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1a0f2e', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                    {selectedPlace.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b5b95', margin: '0 0 6px 0' }}>
                    {selectedPlace.address}
                  </p>
                  
                  {selectedPlace.description && (
                    <p style={{ fontSize: '12px', color: '#5b4b85', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                      {selectedPlace.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                    {selectedPlace.tags && selectedPlace.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', fontWeight: '500' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 컬렉션 저장 버튼 (큰 버튼) */}
                  <button
                    onClick={() => handleToggleCollection(selectedPlace)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: isSelectedSaved 
                        ? 'rgba(139, 92, 246, 0.1)' 
                        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: isSelectedSaved ? '#7c3aed' : '#ffffff',
                      border: isSelectedSaved ? '1px solid rgba(139, 92, 246, 0.4)' : 'none',
                      borderRadius: '8px',
                      cursor: isSaving ? 'wait' : 'pointer',
                      marginBottom: '12px',
                      fontFamily: 'Pretendard, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSaving 
                      ? '⏳ 처리 중...' 
                      : isSelectedSaved 
                        ? '💜 내 컬렉션에 저장됨' 
                        : '🤍 내 컬렉션에 저장'
                    }
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(139, 92, 246, 0.15)', paddingTop: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#9b8fc4', marginBottom: '2px', fontWeight: '500' }}>
                      길찾기
                    </div>
                    <button
                      onClick={() => openKakaoMap(selectedPlace)}
                      style={{ padding: '7px 12px', fontSize: '12px', fontWeight: '600', background: '#FEE500', color: '#1a0f2e', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      카카오맵으로
                    </button>
                    <button
                      onClick={() => openNaverMap(selectedPlace)}
                      style={{ padding: '7px 12px', fontSize: '12px', fontWeight: '600', background: '#03C75A', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      네이버지도로
                    </button>
                    <button
                      onClick={() => openGoogleMap(selectedPlace)}
                      style={{ padding: '7px 12px', fontSize: '12px', fontWeight: '600', background: '#ffffff', color: '#1a0f2e', border: '1px solid #e8e2f5', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      구글맵으로
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>

          {/* 토스트 알림 */}
          {toast && (
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 20px',
                background: toast.type === 'warning' 
                  ? 'rgba(255, 180, 100, 0.95)'
                  : toast.type === 'error'
                  ? 'rgba(255, 100, 100, 0.95)'
                  : toast.type === 'info'
                  ? 'rgba(155, 143, 196, 0.95)'
                  : 'rgba(139, 92, 246, 0.95)',
                color: '#ffffff',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                fontFamily: 'Pretendard, sans-serif'
              }}
            >
              {toast.message}
            </div>
          )}

          <button
            onClick={fetchUserLocation}
            disabled={isLocating}
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(26, 15, 46, 0.85)',
              backdropFilter: 'blur(10px)',
              cursor: isLocating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(139, 92, 246, 0.15)',
              transition: 'all 0.2s ease',
              zIndex: 5
            }}
            title="내 위치로 이동"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.4)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(26, 15, 46, 0.85)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isLocating ? '⏳' : '📍'}
          </button>

          {locationError && (
            <div style={{ position: 'absolute', bottom: '90px', right: '24px', padding: '10px 16px', background: 'rgba(26, 15, 46, 0.95)', border: '1px solid rgba(255, 100, 100, 0.4)', borderRadius: '12px', color: '#ffaaaa', fontSize: '12px', maxWidth: '240px', backdropFilter: 'blur(10px)', zIndex: 5 }}>
              ⚠ {locationError}
            </div>
          )}

          {isLoadingPlaces && (
            <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', padding: '8px 16px', background: 'rgba(26, 15, 46, 0.85)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '100px', color: '#c4b5fd', fontSize: '12px', backdropFilter: 'blur(10px)', zIndex: 5 }}>
              ✨ 장소를 불러오는 중...
            </div>
          )}
        </APIProvider>
      </main>
    </div>
  )
}

export default MapPage