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
import { signInWithGoogle, signOut } from '../lib/auth'
import '../App.css'

// CURA 미니멀 차콜 + 보라 라벨 v6
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

// 17개 시·도 정보 (시청/도청 좌표)
const KOREA_CITIES = [
  { id: 'seoul', name: '서울', fullName: '서울특별시', lat: 37.5665, lng: 126.9780 },
  { id: 'busan', name: '부산', fullName: '부산광역시', lat: 35.1796, lng: 129.0756 },
  { id: 'daegu', name: '대구', fullName: '대구광역시', lat: 35.8714, lng: 128.6014 },
  { id: 'incheon', name: '인천', fullName: '인천광역시', lat: 37.4563, lng: 126.7052 },
  { id: 'gwangju', name: '광주', fullName: '광주광역시', lat: 35.1595, lng: 126.8526 },
  { id: 'daejeon', name: '대전', fullName: '대전광역시', lat: 36.3504, lng: 127.3845 },
  { id: 'ulsan', name: '울산', fullName: '울산광역시', lat: 35.5384, lng: 129.3114 },
  { id: 'sejong', name: '세종', fullName: '세종특별자치시', lat: 36.4800, lng: 127.2890 },
  { id: 'gyeonggi', name: '경기', fullName: '경기도', lat: 37.2750, lng: 127.0094 },
  { id: 'chungbuk', name: '충북', fullName: '충청북도', lat: 36.6357, lng: 127.4914 },
  { id: 'chungnam', name: '충남', fullName: '충청남도', lat: 36.6588, lng: 126.6728 },
  { id: 'gyeongbuk', name: '경북', fullName: '경상북도', lat: 36.5759, lng: 128.5056 },
  { id: 'gyeongnam', name: '경남', fullName: '경상남도', lat: 35.2383, lng: 128.6924 },
  { id: 'jeonnam', name: '전남', fullName: '전라남도', lat: 34.8161, lng: 126.4630 },
  { id: 'gangwon', name: '강원', fullName: '강원특별자치도', lat: 37.8854, lng: 127.7298 },
  { id: 'jeonbuk', name: '전북', fullName: '전북특별자치도', lat: 35.8203, lng: 127.1088 },
  { id: 'jeju', name: '제주', fullName: '제주특별자치도', lat: 33.4996, lng: 126.5312 }
]

// 기본 마커 (저장 안 됨) - 하트와 동일한 19px 가로폭
const curaMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 30 30">
  <defs>
    <radialGradient id="grad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f5f0ff"/>
      <stop offset="28%" stop-color="#c4b5fd"/>
      <stop offset="58%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="15" cy="15" r="11" fill="#8b5cf6" opacity="0.3" filter="url(#glow)"/>
  <circle cx="15" cy="15" r="9.5" fill="url(#grad)" stroke="#f5f0ff" stroke-width="1.8"/>
</svg>
`
const curaMarkerIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(curaMarkerSvg)}`

// 💜 저장된 마커 (원형 마커와 통일감 - 흰색 외곽선 + 보라 블러 글로우) - 30px
const savedMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <defs>
    <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="heartGrad" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#c4b5fd"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </radialGradient>
    <filter id="heartHighlightBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="0.8"/>
    </filter>
  </defs>
  <!-- 보라 블러 글로우 (원형 마커와 통일) -->
  <ellipse cx="15" cy="16" rx="11" ry="10.5" fill="#8b5cf6" opacity="0.3" filter="url(#heartGlow)"/>
  <!-- 가로폭 19px 하트 + 흰색 외곽선 -->
  <path d="M15 25 
           C 15 25, 5.5 18, 5.5 11.5 
           C 5.5 8.2, 7.5 5.8, 10.2 5.8 
           C 12.4 5.8, 13.8 6.9, 15 8.6 
           C 16.2 6.9, 17.6 5.8, 19.8 5.8 
           C 22.5 5.8, 24.5 8.2, 24.5 11.5 
           C 24.5 18, 15 25, 15 25 Z" 
        fill="url(#heartGrad)"
        stroke="#f5f0ff"
        stroke-width="1.8"
        stroke-linejoin="round"/>
  <!-- 자연스러운 블러 하이라이트 -->
  <ellipse cx="11.5" cy="10" rx="1.8" ry="1.4" fill="#ffffff" opacity="0.55" filter="url(#heartHighlightBlur)"/>
</svg>
`
const savedMarkerIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(savedMarkerSvg)}`

// 사용자 위치 마커
const userLocationSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <defs>
    <filter id="userGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="12" cy="12" r="9" fill="#4285F4" opacity="0.25" filter="url(#userGlow)"/>
  <circle cx="12" cy="12" r="5" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
</svg>
`
const userLocationIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userLocationSvg)}`

function MapController({ targetCenter, targetZoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (map && targetCenter) {
      map.panTo(targetCenter)
      if (targetZoom) {
        map.setZoom(targetZoom)
      }
    }
  }, [map, targetCenter, targetZoom])
  
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
  const [moveZoom, setMoveZoom] = useState(null)
  const [places, setPlaces] = useState([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true)
  const [savedPlaceIds, setSavedPlaceIds] = useState(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // 도시 선택 상태
  const [selectedCity, setSelectedCity] = useState(KOREA_CITIES[0]) // 기본값: 서울
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false)

  const defaultCenter = {
    lat: 37.5665,
    lng: 126.9780
  }

  useEffect(() => {
    async function loadPlaces() {
      setIsLoadingPlaces(true)
      const data = await fetchAllPlaces()
      setPlaces(data)
      setIsLoadingPlaces(false)
    }
    loadPlaces()
  }, [])

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
        setMoveZoom(15)
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

  // 도시 선택 시 해당 도시로 이동
  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setMoveTarget({ lat: city.lat, lng: city.lng })
    setMoveZoom(12)
    setIsCityMenuOpen(false)
  }

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

  const handleToggleCollection = async (place) => {
    if (!user) {
      setToast({ type: 'warning', message: '로그인이 필요해요!' })
      return
    }

    setIsSaving(true)
    const isSaved = savedPlaceIds.has(place.id)

    if (isSaved) {
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

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      alert('로그인에 실패했습니다.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      alert('로그아웃에 실패했습니다.')
    }
  }

  const selectedPlace = places.find(p => p.id === selectedPlaceId)
  const isSelectedSaved = selectedPlace && savedPlaceIds.has(selectedPlace.id)

  // 현재 도시의 장소 개수 (베타 단계: 서울만 데이터 있음)
  const cityPlaceCount = selectedCity.id === 'seoul' ? places.length : 0

  return (
    <div className="app">
      <div className="user-corner">
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="user-button"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-fallback">
                  {user.displayName?.[0] || '?'}
                </div>
              )}
              <span>{user.displayName?.split(' ')[0] || '사용자'}</span>
            </button>

            {isMenuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-label">로그인됨</div>
                <div className="user-dropdown-email">{user.email}</div>
                
                <Link
                  to="/my"
                  onClick={() => setIsMenuOpen(false)}
                  className="user-dropdown-link"
                >
                  💜 내 컬렉션
                </Link>

                <button onClick={handleSignOut} className="user-dropdown-button">
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleSignIn} className="login-button">
            로그인
          </button>
        )}
      </div>

      <header
        className="top-section"
        style={{ padding: '60px 32px 30px 32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Link to="/" className="brand-tagline" style={{ textDecoration: 'none', display: 'inline-block' }}>
            ← 메인으로
          </Link>
          
          {user && (
            <Link to="/my" className="map-collection-link">
              💜 내 컬렉션
            </Link>
          )}
        </div>
        
        <h1 className="brand-name" style={{ fontSize: '32px' }}>지도</h1>
        
        {/* 도시 선택 + 장소 개수 */}
        <div className="city-selector-wrap">
          <button 
            className="city-selector-btn"
            onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
          >
            <span className="city-selector-name">{selectedCity.name}</span>
            <span className="city-selector-arrow">{isCityMenuOpen ? '▲' : '▼'}</span>
          </button>
          
          <span className="city-selector-text">
            의 감각적인 공간 <strong>{isLoadingPlaces ? '...' : cityPlaceCount}</strong>곳
          </span>

          {/* 도시 선택 드롭다운 */}
          {isCityMenuOpen && (
            <div className="city-dropdown">
              <div className="city-dropdown-grid">
                {KOREA_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className={`city-dropdown-item ${selectedCity.id === city.id ? 'active' : ''}`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
              <div className="city-dropdown-note">
                * 베타 단계에서는 서울 지역만 데이터가 제공됩니다
              </div>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        <APIProvider apiKey={apiKey}>
          <Map
            style={{ width: '100%', height: '70vh' }}
            defaultCenter={defaultCenter}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={true}
            zoomControl={false}
            mapTypeControl={false}
            scaleControl={false}
            streetViewControl={false}
            rotateControl={false}
            fullscreenControl={false}
            keyboardShortcuts={false}
            styles={curaMapStyle}
          >
            <MapController targetCenter={moveTarget} targetZoom={moveZoom} />

            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: userLocationIcon,
                  scaledSize: { width: 24, height: 24 },
                  anchor: { x: 12, y: 12 }
                }}
                title="내 위치"
              />
            )}

            {places.map((place) => {
              const isSaved = savedPlaceIds.has(place.id)
              return (
                <Marker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => setSelectedPlaceId(place.id)}
                  icon={{
                    url: isSaved ? savedMarkerIcon : curaMarkerIcon,
                    scaledSize: isSaved
                    ? { width: 30, height: 30 } //
                    : { width: 26.2, height: 26.2 }, //
                    anchor: isSaved
                    ? { x: 15, y: 15 }
                    : { x:13.1, y: 13.1 }, //
                  }}
                  title={place.name}
                />
              )
            })}

            {selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                onCloseClick={() => setSelectedPlaceId(null)}
                pixelOffset={[0, -20]}
              >
                <div className="info-window-content">
                  
                  <div className="info-header">
                    <div className="info-category">{selectedPlace.category}</div>
                    <button
                      onClick={() => handleToggleCollection(selectedPlace)}
                      disabled={isSaving}
                      className="info-heart-btn"
                      title={isSelectedSaved ? '컬렉션에서 삭제' : '컬렉션에 저장'}
                    >
                      {isSelectedSaved ? '💜' : '🤍'}
                    </button>
                  </div>

                  <h3 className="info-title">{selectedPlace.name}</h3>
                  <p className="info-address">{selectedPlace.address}</p>
                  
                  {selectedPlace.description && (
                    <p className="info-description">{selectedPlace.description}</p>
                  )}

                  <div className="info-tags">
                    {selectedPlace.tags && selectedPlace.tags.map(tag => (
                      <span key={tag} className="info-tag">
                        <span className="info-tag-hash">#</span>
                        <span className="info-tag-text">{tag}</span>
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleToggleCollection(selectedPlace)}
                    disabled={isSaving}
                    className={isSelectedSaved ? 'info-save-btn-saved' : 'info-save-btn'}
                  >
                    {isSaving 
                      ? '⏳ 처리 중...' 
                      : isSelectedSaved 
                        ? '💜 내 컬렉션에 저장됨' 
                        : '🤍 내 컬렉션에 저장'
                    }
                  </button>

                  <div className="info-directions">
                    <div className="info-directions-label">길찾기</div>
                    <button onClick={() => openKakaoMap(selectedPlace)} className="info-direction-btn info-direction-kakao">
                      <span className="brand-logo brand-logo-kakao">K</span>
                      <span>카카오맵으로</span>
                    </button>
                    <button onClick={() => openNaverMap(selectedPlace)} className="info-direction-btn info-direction-naver">
                      <span className="brand-logo brand-logo-naver">N</span>
                      <span>네이버지도로</span>
                    </button>
                    <button onClick={() => openGoogleMap(selectedPlace)} className="info-direction-btn info-direction-google">
                      <span className="brand-logo brand-logo-google">G</span>
                      <span>구글맵으로</span>
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>

          {toast && (
            <div className={`map-toast map-toast-${toast.type}`}>
              {toast.message}
            </div>
          )}

          {/* 위치 버튼 + 라벨 */}
          <div className="locate-btn-wrap">
            <span className="locate-btn-label">내 위치</span>
            <button
              onClick={fetchUserLocation}
              disabled={isLocating}
              className="locate-btn"
              title="내 위치"
            >
              {isLocating ? '⏳' : '📍'}
            </button>
          </div>

          {locationError && (
            <div className="location-error">
              ⚠ {locationError}
            </div>
          )}

          {isLoadingPlaces && (
            <div className="map-loading">
              ✨ 장소를 불러오는 중...
            </div>
          )}
        </APIProvider>
      </main>
    </div>
  )
}

export default MapPage