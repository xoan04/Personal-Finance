"use client"

import { ProfileForm } from "@/components/profile-form"
import ProtectedRoute from "@/components/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ProfileForm />
        </div>
      </div>
    </ProtectedRoute>
  )
} 