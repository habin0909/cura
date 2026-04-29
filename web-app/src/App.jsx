import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './lib/firebase'
import { onAuthChange } from './lib/auth'
import { useUserStore } from './store/userStore.js'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import MyCollectionsPage from './pages/MyCollectionsPage'

function App() {
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  // 앱 시작 시 인증 상태 감지 시작
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setUser(user)
        console.log('🔐 로그인 상태 감지:', user.displayName)
      } else {
        clearUser()
        console.log('🔓 로그아웃 상태')
      }
    })

    // 컴포넌트 사라질 때 구독 해제 (메모리 누수 방지)
    return () => unsubscribe()
  }, [setUser, clearUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/my" element={<MyCollectionsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App