import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { AuthProvider, useAuth } from '../context/AuthContext'

function RootLayoutNav() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.replace('/(tabs)')       // logged in → go to dashboard
    } else {
      router.replace('/(auth)/login') // not logged in → go to login
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
