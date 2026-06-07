import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { router } from 'expo-router'

function RootLayoutNav() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.replace('/(tabs)' as any)
    } else {
      router.replace('/(auth)/login' as any)
    }
  }, [user, loading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}