import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchMyCollections, removeFromCollection } from '../lib/collections'
import { useUserStore } from '../store/userStore.js'
import '../App.css'
import curaLogo from '../assets/cura-logo.png'

function MyCollectionsPage() {
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)
  const isLoading = useUserStore((state) => state.isLoading)
  
  const [collections, setCollections] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [toast, setToast] = useState(null)

  // 컬렉션 불러오기
  useEffect(() => {
    async function loadCollections() {
      if (!user) {
        setIsFetching(false)
        return
      }
      
      setIsFetching(true)
      const data = await fetchMyCollections(user.uid)
      setCollections(data)
      setIsFetching(false)
    }
    
    if (!isLoading) {
      loadCollections()
    }
  }, [user, isLoading])

  // 토스트 자동 사라짐
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // 컬렉션에서 삭제
  const handleRemove = async (placeId, placeName) => {
    if (!user) return
    
    setRemovingId(placeId)
    const success = await removeFromCollection(user.uid, placeId)
    
    if (success) {
      setCollections(prev => prev.filter(c => c.id !== placeId))
      setToast({ type: 'info', message: `${placeName} 삭제됨` })
    } else {
      setToast({ type: 'error', message: '삭제에 실패했어요' })
    }
    setRemovingId(null)
  }

  // 지도에서 보기 (지도 페이지로 이동하면서 좌표 전달)
  const handleViewOnMap = (place) => {
    navigate('/map', { 
      state: { 
        focusPlace: { 
          id: place.id, 
          lat: place.lat, 
          lng: place.lng 
        } 
      } 
    })
  }

  // 저장 시각 포맷팅
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return ''
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '오늘'
    if (days === 1) return '어제'
    if (days < 7) return `${days}일 전`
    if (days < 30) return `${Math.floor(days / 7)}주 전`
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  // 로그인 필요 화면
  if (!isLoading && !user) {
    return (
      <div className="app">
        <header className="top-section" style={{ padding: '60px 32px 30px 32px' }}>
          <Link
            to="/"
            className="brand-tagline"
            style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}
          >
            ← 메인으로
          </Link>
          <img src={curaLogo} alt="CURA" className="logo" />
          <h1 className="brand-name" style={{ fontSize: '32px' }}>내 컬렉션</h1>
        </header>
        
        <main style={{ flex: 1, padding: '60px 32px', textAlign: 'center', position: 'relative' }}>
          <div className="gradient-bg" />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '60px', marginBottom: '24px', opacity: 0.6 }}>🔒</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f5f0ff', marginBottom: '12px' }}>
              로그인이 필요해요
            </h2>
            <p style={{ fontSize: '15px', color: '#9b8fc4', marginBottom: '32px', lineHeight: '1.7' }}>
              로그인하면 마음에 드는 장소를<br />
              나만의 컬렉션으로 모을 수 있어요
            </p>
            <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              메인으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      {/* 우상단 프로필 */}
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

      <header className="top-section" style={{ padding: '60px 32px 30px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="brand-tagline"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            ← 메인으로
          </Link>
          <Link
            to="/map"
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
            🗺️ 지도로
          </Link>
        </div>
        
        <h1 className="brand-name" style={{ fontSize: '32px' }}>내 컬렉션</h1>
        <p className="brand-tagline">
          {isFetching 
            ? '불러오는 중...' 
            : `${collections.length}개의 감각적인 공간`
          }
        </p>
      </header>

      <main style={{ flex: 1, padding: '40px 32px 80px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div className="gradient-bg" />
        
        {/* 로딩 상태 */}
        {isFetching && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9b8fc4' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.6 }}>✨</div>
            <p style={{ fontSize: '14px' }}>컬렉션을 불러오는 중...</p>
          </div>
        )}

        {/* 빈 상태 */}
        {!isFetching && collections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '60px', marginBottom: '24px', opacity: 0.5 }}>💜</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f5f0ff', marginBottom: '12px' }}>
              아직 저장한 장소가 없어요
            </h2>
            <p style={{ fontSize: '14px', color: '#9b8fc4', marginBottom: '32px', lineHeight: '1.7' }}>
              지도에서 마음에 드는 장소를 발견하면<br />
              💜 버튼으로 저장해 보세요
            </p>
            <Link to="/map" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              지도 둘러보기
            </Link>
          </div>
        )}

        {/* 컬렉션 그리드 */}
        {!isFetching && collections.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              position: 'relative',
              zIndex: 1
            }}
          >
            {collections.map((place) => (
              <div
                key={place.id}
                style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  fontFamily: 'Pretendard, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* 카테고리 + 삭제 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {place.category}
                  </span>
                  <button
                    onClick={() => handleRemove(place.placeId || place.id, place.name)}
                    disabled={removingId === place.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: removingId === place.id ? 'wait' : 'pointer',
                      fontSize: '16px',
                      color: '#9b8fc4',
                      padding: '4px',
                      lineHeight: '1',
                      opacity: 0.6,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    title="컬렉션에서 삭제"
                  >
                    {removingId === place.id ? '⏳' : '✕'}
                  </button>
                </div>

                {/* 장소명 */}
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f5f0ff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  {place.name}
                </h3>

                {/* 주소 */}
                <p style={{ fontSize: '13px', color: '#9b8fc4', margin: '0 0 12px 0' }}>
                  {place.address}
                </p>

                {/* 설명 */}
                {place.description && (
                  <p style={{ fontSize: '13px', color: '#b8aed4', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    {place.description}
                  </p>
                )}

                {/* 태그 */}
                {place.tags && place.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {place.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          borderRadius: '100px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#c4b5fd',
                          fontWeight: '500'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 하단 액션 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
                  <span style={{ fontSize: '11px', color: '#6b5b95' }}>
                    💜 {formatDate(place.savedAt)}
                  </span>
                  <button
                    onClick={() => handleViewOnMap(place)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'transparent',
                      color: '#c4b5fd',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      fontFamily: 'Pretendard, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                      e.currentTarget.style.color = '#f5f0ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#c4b5fd'
                    }}
                  >
                    지도에서 보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 토스트 */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '12px 20px',
              background: toast.type === 'error' 
                ? 'rgba(255, 100, 100, 0.95)'
                : 'rgba(155, 143, 196, 0.95)',
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
      </main>
    </div>
  )
}

export default MyCollectionsPage