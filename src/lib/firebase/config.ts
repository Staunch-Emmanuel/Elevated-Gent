import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDpeZR_07MLBvD8SJfA4hUI2hoBlso8Xqg",
  authDomain: "elevatedgentcms.firebaseapp.com",
  projectId: "elevatedgentcms",
  storageBucket: "elevatedgentcms.firebasestorage.app",
  messagingSenderId: "277758225345",
  appId: "1:277758225345:web:0471f54d86100ed068dd40",
  measurementId: "G-H8YYD891JW"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

console.log("🔥 Firebase connected to:", firebaseConfig.projectId);


// Initialize Analytics (only on client-side)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app