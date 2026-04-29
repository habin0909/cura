// ==========================================
// auth.js - Firebase 인증 관리
// ==========================================
// Google 로그인, 로그아웃, 사용자 상태 변화 감지
// ==========================================

import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'

/**
 * Google 로그인 (팝업 방식)
 * @returns {Promise<Object>} 사용자 정보
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    console.log('✅ Google 로그인 성공:', user.displayName)
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }
  } catch (error) {
    console.error('❌ Google 로그인 실패:', error.code, error.message)
    
    // 사용자가 팝업을 닫은 경우는 에러로 취급 안 함
    if (error.code === 'auth/popup-closed-by-user') {
      return null
    }
    
    throw error
  }
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth)
    console.log('👋 로그아웃 완료')
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error)
    throw error
  }
}

/**
 * 사용자 인증 상태 변화 감지
 * 로그인/로그아웃 시 자동으로 호출되는 함수
 * @param {Function} callback - 사용자 상태 변경 시 실행될 함수
 * @returns {Function} 구독 해제 함수
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      })
    } else {
      callback(null)
    }
  })
}