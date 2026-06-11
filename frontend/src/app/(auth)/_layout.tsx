import { View, ActivityIndicator } from 'react-native'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function AuthLayout() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1D9E75" />
            </View>
        )
    }

    if (user) {
        return <Redirect href="/(tabs)" />
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    )
}