import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithGoogle, signOut } from '../lib/auth'
import { useUserStore } from '../store/userStore.js'
import { BottomNav } from './MagazinePage'
import '../App.css'

function SettingsPage() {
  const user = useUserStore((state) => state.user)
  const [showGuide, setShowGuide] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showContact, setShowContact] = useState(false)

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      alert('로그인에 실패했습니다.')
    }
  }

  const handleSignOut = async () => {
    if (!confirm('로그아웃 하시겠어요?')) return
    try {
      await signOut()
    } catch (error) {
      alert('로그아웃에 실패했습니다.')
    }
  }

  const handleContact = () => {
    window.location.href = 'mailto:habin0909@gmail.com?subject=[CURA] 문의사항'
  }

  return (
    <div className="app">
      <header className="top-section" style={{ padding: '60px 32px 30px 32px' }}>
        <Link to="/" className="brand-tagline" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← 메인으로
        </Link>
        <h1 className="brand-name" style={{ fontSize: '32px' }}>메뉴</h1>
        <p className="brand-tagline">CURA를 더 깊이 사용해보세요</p>
      </header>

      <main className="settings-main">
        <div className="gradient-bg" />

        {/* 프로필 카드 */}
        <div className="settings-profile-card">
          {user ? (
            <>
              <div className="settings-profile-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <div className="settings-profile-fallback">
                    {user.displayName?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className="settings-profile-info">
                <h2 className="settings-profile-name">{user.displayName || '사용자'}</h2>
                <p className="settings-profile-email">{user.email}</p>
              </div>
              <button onClick={handleSignOut} className="settings-profile-action">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <div className="settings-profile-avatar">
                <div className="settings-profile-fallback">?</div>
              </div>
              <div className="settings-profile-info">
                <h2 className="settings-profile-name">게스트</h2>
                <p className="settings-profile-email">로그인하면 더 많은 기능을 사용할 수 있어요</p>
              </div>
              <button onClick={handleSignIn} className="settings-profile-action settings-profile-action-primary">
                로그인
              </button>
            </>
          )}
        </div>

        {/* 메뉴 리스트 */}
        <div className="settings-section">
          <h3 className="settings-section-title">내 활동</h3>
          
          <Link to="/my" className="settings-menu-item">
            <div className="settings-menu-icon">💜</div>
            <div className="settings-menu-content">
              <div className="settings-menu-label">내 컬렉션</div>
              <div className="settings-menu-desc">저장한 감각적인 공간들</div>
            </div>
            <div className="settings-menu-arrow">›</div>
          </Link>

          <button className="settings-menu-item" onClick={() => alert('베타 단계: 곧 출시될 기능이에요!')}>
            <div className="settings-menu-icon">📊</div>
            <div className="settings-menu-content">
              <div className="settings-menu-label">내 감각 통계</div>
              <div className="settings-menu-desc">취향 분석 (곧 출시!)</div>
            </div>
            <div className="settings-menu-arrow">›</div>
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">도움말</h3>

          <button className="settings-menu-item" onClick={() => setShowGuide(true)}>
            <div className="settings-menu-icon">📖</div>
            <div className="settings-menu-content">
              <div className="settings-menu-label">사용 가이드</div>
              <div className="settings-menu-desc">CURA 시작하기</div>
            </div>
            <div className="settings-menu-arrow">›</div>
          </button>

          <button className="settings-menu-item" onClick={() => setShowContact(true)}>
            <div className="settings-menu-icon">📞</div>
            <div className="settings-menu-content">
              <div className="settings-menu-label">사용 문의</div>
              <div className="settings-menu-desc">이메일로 문의하기</div>
            </div>
            <div className="settings-menu-arrow">›</div>
          </button>

          <button className="settings-menu-item" onClick={() => alert('피드백 기능 준비 중! 지금은 사용 문의로 연락해주세요 💜')}>
            <div className="settings-menu-icon">💌</div>
            <div className="settings-menu-content">
              <div className="settings-menu-label">피드백 보내기</div>
              <div className="settings-menu-desc">CURA를 더 좋게 만들어요</div>
            </div>
            <div className="settings-menu-arrow">›</div>
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">앱 정보</h3>

          <button className="settings-menu-item" onClick={() => setShowAbout(true)}>
            <div className="settings-menu-icon">⚙️</div>
            <div className="settings-menu-content">
              <div className="settings-menu-label">앱 정보</div>
              <div className="settings-menu-desc">버전 1.0.0 BETA</div>
            </div>
            <div className="settings-menu-arrow">›</div>
          </button>
        </div>

        {/* 푸터 */}
        <div className="settings-footer">
          <div className="settings-footer-brand">CURA</div>
          <p className="settings-footer-copy">© 2026 CURA. All rights reserved.</p>
        </div>
      </main>

      {/* 사용 가이드 모달 */}
      {showGuide && (
        <div className="settings-modal-overlay" onClick={() => setShowGuide(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="settings-modal-close" onClick={() => setShowGuide(false)}>✕</button>
            <h2 className="settings-modal-title">CURA 사용 가이드</h2>
            <div className="settings-modal-content">
              <div className="guide-step">
                <div className="guide-step-number">01</div>
                <div className="guide-step-text">
                  <h3>지도에서 공간 발견</h3>
                  <p>지도 위 보라색 마커를 탭해서 큐레이팅된 감각적인 공간을 살펴보세요</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="guide-step-number">02</div>
                <div className="guide-step-text">
                  <h3>컬렉션에 저장</h3>
                  <p>마음에 드는 공간을 하트 버튼으로 내 컬렉션에 저장해요</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="guide-step-number">03</div>
                <div className="guide-step-text">
                  <h3>매거진 둘러보기</h3>
                  <p>CURA가 직접 큐레이팅한 깊이 있는 공간 이야기를 만나보세요</p>
                </div>
              </div>
              <div className="guide-step">
                <div className="guide-step-number">04</div>
                <div className="guide-step-text">
                  <h3>길찾기 연동</h3>
                  <p>카카오맵, 네이버지도, 구글맵으로 바로 길찾기 가능해요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 앱 정보 모달 */}
      {showAbout && (
        <div className="settings-modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="settings-modal-close" onClick={() => setShowAbout(false)}>✕</button>
            <h2 className="settings-modal-title">CURA</h2>
            <div className="settings-modal-content">
              <div className="about-version">버전 1.0.0 BETA</div>
              <p className="about-tagline">위치 기반 라이프스타일 큐레이션</p>
              <div className="about-divider"></div>
              <p className="about-desc">
                CURA는 당신의 감각을 지도로 만드는 라이프스타일 큐레이션 서비스입니다.
                지금 이 순간 가장 감각적인 하루를 만나보세요.
              </p>
              <div className="about-info">
                <div className="about-info-row">
                  <span>제작</span>
                  <span>habin0909</span>
                </div>
                <div className="about-info-row">
                  <span>출시</span>
                  <span>2026 BETA</span>
                </div>
                <div className="about-info-row">
                  <span>문의</span>
                  <span>habin0909@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 앱 정보 모달 끝나는 )} 다음에 이걸 붙여넣으세요 */}
      
      {/* 사용 문의 모달 */}
      {showContact && (
        <div className="settings-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="settings-modal-close" onClick={() => setShowContact(false)}>✕</button>
            <h2 className="settings-modal-title">사용 문의</h2>
            <div className="settings-modal-content">
              <p className="contact-intro">
                CURA에 대해 궁금한 점이나<br />
                개선 제안이 있다면 언제든 연락주세요!
              </p>
              <div className="contact-email-card">
                <div className="contact-email-icon">📧</div>
                <div className="contact-email-info">
                  <div className="contact-email-label">문의 이메일</div>
                  <div className="contact-email-value">habin0909@gmail.com</div>
                </div>
              </div>
              <button onClick={handleContact} className="contact-action-btn">
                ✉️ 메일 앱으로 문의 작성하기
              </button>
              <p className="contact-note">
                * 답변까지 1~3일 정도 소요될 수 있습니다
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="menu" />
    </div>
  )
}

export default SettingsPage