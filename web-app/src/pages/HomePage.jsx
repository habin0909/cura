import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithGoogle, signOut } from '../lib/auth'
import { useUserStore } from '../store/userStore.js'
import '../App.css'
import curaLogo from '../assets/cura-logo.png'

function HomePage() {
  const user = useUserStore((state) => state.user)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      alert('로그인에 실패했습니다. 다시 시도해주세요.')
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

  return (
    <div className="app">
      {/* 우상단 BETA 배지 */}
      <div className="beta-badge">BETA</div>

      {/* 우상단 사용자 영역 */}
      <div
        style={{
          position: 'absolute',
          top: '32px',
          right: '90px',  // BETA 배지와 간격
          zIndex: 10
        }}
      >
        {user ? (
          // 로그인 상태: 프로필 표시
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
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
                cursor: 'pointer',
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
            </button>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  minWidth: '180px',
                  padding: '12px',
                  background: 'rgba(26, 15, 46, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '14px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9b8fc4',
                    marginBottom: '4px',
                    letterSpacing: '0.5px'
                  }}
                >
                  로그인됨
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#e8e2f5',
                    marginBottom: '12px',
                    fontWeight: '500',
                    wordBreak: 'break-all'
                  }}
                >
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#c4b5fd',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Pretendard, sans-serif'
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          // 로그아웃 상태: 로그인 버튼
          <button
            onClick={handleSignIn}
            style={{
              padding: '8px 16px',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '100px',
              color: '#c4b5fd',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              fontFamily: 'Pretendard, sans-serif',
              backdropFilter: 'blur(10px)'
            }}
          >
            로그인
          </button>
        )}
      </div>

      {/* 상단 영역 */}
      <header className="top-section">
        <img src={curaLogo} alt="CURA" className="logo" />
        <h1 className="brand-name">CURA</h1>
        <p className="brand-tagline">위치 기반 라이프스타일 큐레이션</p>
      </header>

      {/* 구분선 */}
      <div className="divider" />

      {/* 메인 영역 */}
      <main className="main">
        <div className="gradient-bg" />
        <div className="gradient-bg-extra" />

        <section className="hero">
          <h2 className="hero-title">
            당신의 <span className="gradient-text">감각</span>이<br />
            지도가 되는 순간
          </h2>
          
          <p className="hero-desc">
            전시 · 카페 · 팝업 · 문화공간<br />
            지금 이 순간 가장 감각적인 하루를 만나보세요
          </p>

          <div className="hero-actions">
            <Link to="/map" className="btn btn-primary">시작하기</Link>
            <button className="btn btn-ghost">더 알아보기</button>
          </div>
        </section>

        <section className="features">
          <FeatureCard
            number="01"
            title="위치 기반 추천"
            description="내 주변 10km 반경의 감각적인 공간을 발견하세요"
          />
          <FeatureCard
            number="02"
            title="감각 큐레이션"
            description="힙한, 조용한, 감성적인 — 당신의 취향을 이해합니다"
          />
          <FeatureCard
            number="03"
            title="AI 동선 설계"
            description="하루를 완성하는 가장 아름다운 루트를 제안합니다"
          />
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">CURA</div>
        <p className="footer-copy">© 2026 CURA. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ number, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-number">{number}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  )
}

export default HomePage