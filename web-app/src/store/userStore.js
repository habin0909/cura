// ==========================================
// userStore.js - 사용자 로그인 상태 전역 관리
// ==========================================
// Zustand를 사용해서 앱 전체에서 사용자 정보를 공유합니다.
// 어떤 페이지에서든 useUserStore()로 접근 가능!
// ==========================================

import { create } from 'zustand'

export const useUserStore = create((set) => ({
  // ===== 상태 =====
  user: null,              // 로그인 한 사용자 정보 (null = 로그아웃 상태)
  isLoading: true,         // 인증 상태 로딩 중인지
  
  // ===== 액션 =====
  
  // 사용자 정보 설정
  setUser: (user) => set({ user, isLoading: false }),
  
  // 로딩 상태 설정
  setLoading: (isLoading) => set({ isLoading }),
  
  // 로그아웃 (정보 초기화)
  clearUser: () => set({ user: null, isLoading: false })
}))