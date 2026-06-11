import { useEffect, useRef } from 'react'
import { Stack, router } from 'expo-router'
import { AuthProvider } from '../context/AuthContext'

export const unstable_settings = {
  initialRouteName: 'index',
}

function AppNavigator() {
  const didSetInitialRoute = useRef(false)

  useEffect(() => {
    if (didSetInitialRoute.current) return
    didSetInitialRoute.current = true
    router.replace('/')
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}