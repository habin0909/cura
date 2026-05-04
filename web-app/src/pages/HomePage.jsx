import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithGoogle, signOut } from '../lib/auth'
import { useUserStore } from '../store/userStore.js'
import { BottomNav } from './MagazinePage'
import '../App.css'
import curaLogo from '../assets/cura-logo.png'

import magazineHero from '../assets/magazine-hero.png'
import magazine1 from '../assets/place1-page1.jpg'
import magazine2 from '../assets/place2-page1.png'
import magazine3 from '../assets/place3-page1.jpg'

const HOME_MAGAZINE_PREVIEW = [
  { id: 1, image: magazine1, title: '플랫 오 (plat o.)', category: '식당' },
  { id: 2, image: magazine2, title: '음 이터리', category: '식당' },
  { id: 3, image: magazine3, title: '노들섬', category: '공원' }
]

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
      <div className="top-right-area">
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="user-button"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
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
                <Link to="/my" onClick={() => setIsMenuOpen(false)} className="user-dropdown-link">
                  💜 내 컬렉션
                </Link>
                <button onClick={handleSignOut} className="user-dropdown-button">
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleSignIn} className="login-button">로그인</button>
        )}
        
        <div className="beta-badge">BETA</div>
      </div>

      <header className="top-section">
        <img src={curaLogo} alt="CURA" className="logo" />
        <h1 className="brand-name">CURA</h1>
        <p className="brand-tagline">위치 기반 라이프스타일 큐레이션</p>
      </header>

      <div className="divider" />

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
            {user ? (
              <Link to="/my" className="btn btn-ghost">💜 내 컬렉션</Link>
            ) : (
              <button className="btn btn-ghost">더 알아보기</button>
            )}
          </div>
        </section>

        <section className="features">
          <FeatureCard number="01" title="위치 기반 추천" description="내 주변 10km 반경의 감각적인 공간을 발견하세요" />
          <FeatureCard number="02" title="감각 큐레이션" description="힙한, 조용한, 감성적인 — 당신의 취향을 이해합니다" />
          <FeatureCard number="03" title="AI 동선 설계" description="하루를 완성하는 가장 아름다운 루트를 제안합니다" />
        </section>

        {/* 매거진 미리보기 섹션 */}
        <section className="home-magazine">
          <div className="home-magazine-header">
            <h2 className="home-magazine-title">CURA가 소개하는 감각적인 공간들</h2>
            <Link to="/magazine" className="home-magazine-more">더 보기 →</Link>
          </div>
          
          <Link to="/magazine" className="home-magazine-hero">
            <img src={magazineHero} alt="매거진 메인" className="home-magazine-hero-img" />
            <div className="home-magazine-hero-overlay">
              <span className="home-magazine-hero-category">EDITOR PICK</span>
              <h3 className="home-magazine-hero-title">봄맞이 길거리 야장 모음집</h3>
              <p className="home-magazine-hero-subtitle">봄, 기다려왔던 길먹의 낭만</p>
            </div>
          </Link>

          <div className="home-magazine-grid">
            {HOME_MAGAZINE_PREVIEW.map((item) => (
              <Link to="/magazine" key={item.id} className="home-magazine-card">
                <div className="home-magazine-card-img-wrap">
                  <img src={item.image} alt={item.title} className="home-magazine-card-img" />
                </div>
                <span className="home-magazine-card-category">{item.category}</span>
                <h4 className="home-magazine-card-title">{item.title}</h4>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">CURA</div>
        <p className="footer-copy">© 2026 CURA. All rights reserved.</p>
      </footer>

      <BottomNav active="home" />
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