// ==========================================
// places.js - Firestore 장소 데이터 관리
// ==========================================
// 이 파일은 Firestore의 'places' 컬렉션에서
// 장소 데이터를 가져오는 함수들을 모아둡니다.
// ==========================================

import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Firestore에서 모든 장소를 가져옵니다.
 * @returns {Promise<Array>} 장소 배열
 */
export async function fetchAllPlaces() {
  try {
    // 'places' 컬렉션 참조
    const placesRef = collection(db, 'places')
    
    // 쿼리: 이름 순으로 정렬
    const q = query(placesRef, orderBy('name'))
    
    // 데이터 가져오기
    const snapshot = await getDocs(q)
    
    // 각 문서를 객체로 변환
    const places = snapshot.docs.map(doc => ({
      id: doc.id,        // 문서 ID (예: place_001)
      ...doc.data()      // 나머지 모든 필드
    }))
    
    console.log('📍 Firestore에서 장소 데이터 가져옴:', places.length, '개')
    return places
    
  } catch (error) {
    console.error('❌ 장소 데이터 가져오기 실패:', error)
    return []  // 에러 시 빈 배열 반환
  }
}