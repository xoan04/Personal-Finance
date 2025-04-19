// Configuración de Firebase
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)

// Inicializar Analytics solo en el cliente
export const initializeAnalytics = () => {
  if (typeof window !== "undefined") {
    return getAnalytics(app)
  }
  return null
}

export default app
