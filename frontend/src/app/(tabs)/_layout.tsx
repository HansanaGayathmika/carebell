import { View, ActivityIndicator } from 'react-native'
import { Redirect, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'

export default function TabLayout() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1D9E75" />
            </View>
        )
    }

    if (!user) {
        return <Redirect href="/" />
    }

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#1D9E75',
            tabBarInactiveTintColor: '#888',
        }}>
            <Tabs.Screen name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="home-outline" size={size} color={color} />
                }} />
            <Tabs.Screen name="medications"
                options={{
                    title: 'Medications',
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="medical-outline" size={size} color={color} />
                }} />
            <Tabs.Screen name="calllog"
                options={{
                    title: 'Call Log',
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="call-outline" size={size} color={color} />
                }} />
            <Tabs.Screen name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="settings-outline" size={size} color={color} />
                }} />
        </Tabs>
    )
}