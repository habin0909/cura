// ======================================
// collections.js — 내 컬렉션 관리
// ======================================
// 사용자가 저장한 장소를 Firestore에 저장/삭제/조회합니다.
// 경로: users/{uid}/collections/{placeId}
// ======================================

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// ======================================
// 1️⃣ 장소를 내 컬렉션에 저장
// ======================================
// uid: 현재 로그인한 사용자 ID
// place: 저장할 장소 객체 (id, name, category, lat, lng 등 포함)
export async function addToCollection(uid, place) {
  if (!uid || !place) {
    console.error('❌ uid 또는 place가 없습니다')
    return false
  }

  try {
    const docRef = doc(db, 'users', uid, 'collections', place.id)
    
    // 장소 정보 + 저장 시각 기록
    await setDoc(docRef, {
      placeId: place.id,
      name: place.name,
      category: place.category,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      tags: place.tags || [],
      description: place.description || '',
      savedAt: serverTimestamp()  // 자동으로 현재 시각 기록
    })
    
    console.log('💜 컬렉션에 저장됨:', place.name)
    return true
  } catch (error) {
    console.error('❌ 저장 실패:', error)
    return false
  }
}

// ======================================
// 2️⃣ 컬렉션에서 장소 삭제
// ======================================
export async function removeFromCollection(uid, placeId) {
  if (!uid || !placeId) {
    console.error('❌ uid 또는 placeId가 없습니다')
    return false
  }

  try {
    const docRef = doc(db, 'users', uid, 'collections', placeId)
    await deleteDoc(docRef)
    
    console.log('🗑️ 컬렉션에서 삭제됨:', placeId)
    return true
  } catch (error) {
    console.error('❌ 삭제 실패:', error)
    return false
  }
}

// ======================================
// 3️⃣ 내 컬렉션 전체 목록 가져오기
// ======================================
// 반환: 저장된 장소 배열 (최신순 정렬은 컴포넌트에서)
export async function fetchMyCollections(uid) {
  if (!uid) {
    console.error('❌ uid가 없습니다')
    return []
  }

  try {
    const collectionRef = collection(db, 'users', uid, 'collections')
    const snapshot = await getDocs(collectionRef)
    
    const collections = []
    snapshot.forEach((doc) => {
      collections.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // 저장 시각 최신순 정렬
    collections.sort((a, b) => {
      const timeA = a.savedAt?.toMillis?.() || 0
      const timeB = b.savedAt?.toMillis?.() || 0
      return timeB - timeA
    })
    
    console.log(`✨ 내 컬렉션 ${collections.length}개 불러옴`)
    return collections
  } catch (error) {
    console.error('❌ 컬렉션 조회 실패:', error)
    return []
  }
}

// ======================================
// 4️⃣ 특정 장소가 내 컬렉션에 있는지 확인
// ======================================
// 마커 정보창에서 하트 표시 여부를 결정할 때 사용
export async function isInCollection(uid, placeId) {
  if (!uid || !placeId) return false

  try {
    const docRef = doc(db, 'users', uid, 'collections', placeId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  } catch (error) {
    console.error('❌ 확인 실패:', error)
    return false
  }
}