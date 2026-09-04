import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'AIzaSyBjJBzCL85zsyavxVTI1OvbS21JSAMM7hY',
  authDomain: 'last-cunt-standing.firebaseapp.com',
  projectId: 'last-cunt-standing',
  storageBucket: 'last-cunt-standing.firebasestorage.app',
  messagingSenderId: '812638352592',
  appId: '1:812638352592:web:175d6cee014c749a639ad5',
})

export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
