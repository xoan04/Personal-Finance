// Configuración de Firebase
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnb461RxGx3hJ5SetD4I-rYLdUzgCI5V0",
  authDomain: "personal-finance-8b983.firebaseapp.com",
  projectId: "personal-finance-8b983",
  storageBucket: "personal-finance-8b983.firebasestorage.app",
  messagingSenderId: "1027877283704",
  appId: "1:1027877283704:web:5e251aa31827aa6a0a4a8d",
  measurementId: "G-349F79X300",
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
