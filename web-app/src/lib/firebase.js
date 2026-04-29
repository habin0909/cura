// ==========================================
// Firebase 초기화 및 서비스 export
// ==========================================
// 이 파일은 CURA 앱의 모든 Firebase 기능의 출발점입니다.
// .env 파일에서 비밀 키를 가져와 Firebase에 연결하고,
// 다른 파일들이 사용할 수 있도록 서비스들을 내보냅니다.
// ==========================================

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// .env 파일에서 Firebase 설정 정보 가져오기
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Firebase 앱 초기화 (모든 Firebase 기능의 시작점)
const app = initializeApp(firebaseConfig)

// ==========================================
// 각 서비스를 다른 파일에서 사용할 수 있도록 export
// ==========================================

// 🔐 인증 (로그인/회원가입)
export const auth = getAuth(app)

// 🔵 Google 로그인 제공자
export const googleProvider = new GoogleAuthProvider()

// 📦 Firestore 데이터베이스 (장소, 큐레이션, 사용자 정보 등)
export const db = getFirestore(app)

// 🖼️ Storage (이미지 저장소)
export const storage = getStorage(app)

// 📊 Analytics (사용자 행동 분석 - 브라우저 환경에서만)
export const analytics = await isSupported().then(yes => 
  yes ? getAnalytics(app) : null
)

// 앱 자체도 export (필요 시 사용)
export default app

// ==========================================
// 연결 확인용 콘솔 출력 (개발용)
// ==========================================
console.log('🔥 Firebase 연결 완료!', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})