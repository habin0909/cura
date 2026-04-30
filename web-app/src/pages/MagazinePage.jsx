import { Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore.js'
import '../App.css'

import magazineHero from '../assets/magazine-hero.png'
import magazine1 from '../assets/magazine-1.jpg'
import magazine2 from '../assets/magazine-2.png'
import magazine3 from '../assets/magazine-3.jpg'
import magazine4 from '../assets/magazine-4.png'
import magazine5 from '../assets/magazine-5.png'
import magazine6 from '../assets/magazine-6.png'

const MAGAZINE_HERO = {
  id: 'hero',
  image: magazineHero,
  title: '완벽한 날씨, 딱 맞는 플레이리스트',
  subtitle: '오늘의 비건식, 양재천 산책까지',
  category: 'EDITOR PICK'
}

const MAGAZINE_ITEMS = [
  {
    id: 'item-1',
    image: magazine1,
    title: '음 이터리',
    subtitle: '글루텐 프리, 비건 친화 다이닝',
    category: '식당',
    location: '서울시 강남구',
  },
  {
    id: 'item-2',
    image: magazine2,
    title: '맥스 시덴토프 개인전',
    subtitle: '복잡한 세상, 편하게 살자',
    category: '전시',
    location: '서울 중구 그랜드센트럴',
  },
  {
    id: 'item-3',
    image: magazine3,
    title: '달맞이 광장 바베큐 본점',
    subtitle: '주말 웨이팅 1000팀의 이유',
    category: '식당',
    location: '서울 중구 을지로',
  },
  {
    id: 'item-4',
    image: magazine4,
    title: '노들섬',
    subtitle: '도심 속 작은 섬, 한산한 정취',
    category: '공원',
    location: '서울시 용산구',
  },
  {
    id: 'item-5',
    image: magazine5,
    title: '라익스',
    subtitle: '서울 속 작은 이탈리아, 정통 화덕피자',
    category: '식당',
    location: '서울 중구 다산로',
  },
  {
    id: 'item-6',
    image: magazine6,
    title: '플랫 오 (plat o.)',
    subtitle: '비건 친화, 가치 있는 한 접시',
    category: '식당',
    location: '서울시 서초구 양재천로',
  }
]

function MagazinePage() {
  return (
    <div className="app">
      <header className="top-section" style={{ padding: '60px 32px 30px 32px' }}>
        <Link to="/" className="brand-tagline" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← 메인으로
        </Link>
        <h1 className="brand-name" style={{ fontSize: '32px' }}>매거진</h1>
        <p className="brand-tagline">CURA가 소개하는 감각적인 공간들</p>
      </header>

      <main className="magazine-main">
        <div className="gradient-bg" />
        
        <div className="magazine-hero-card">
          <img src={MAGAZINE_HERO.image} alt={MAGAZINE_HERO.title} className="magazine-hero-img" />
          <div className="magazine-hero-overlay">
            <span className="magazine-hero-category">{MAGAZINE_HERO.category}</span>
            <h2 className="magazine-hero-title">{MAGAZINE_HERO.title}</h2>
            <p className="magazine-hero-subtitle">{MAGAZINE_HERO.subtitle}</p>
          </div>
        </div>

        <div className="magazine-grid">
          {MAGAZINE_ITEMS.map((item) => (
            <div key={item.id} className="magazine-card">
              <div className="magazine-card-img-wrap">
                <img src={item.image} alt={item.title} className="magazine-card-img" />
                <span className="magazine-card-category">{item.category}</span>
              </div>
              <div className="magazine-card-content">
                <h3 className="magazine-card-title">{item.title}</h3>
                <p className="magazine-card-subtitle">{item.subtitle}</p>
                <p className="magazine-card-location">📍 {item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav active="magazine" />
    </div>
  )
}

function BottomNav({ active }) {
  const user = useUserStore((state) => state.user)
  
  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${active === 'home' ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>홈</span>
      </Link>
      <Link to="/map" className={`bottom-nav-item ${active === 'map' ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>지도</span>
      </Link>
      <Link to="/magazine" className={`bottom-nav-item ${active === 'magazine' ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
        <span>매거진</span>
      </Link>
      <Link to={user ? "/my" : "/"} className={`bottom-nav-item ${active === 'menu' ? 'active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>메뉴</span>
      </Link>
    </nav>
  )
}

export default MagazinePage
export { BottomNav }