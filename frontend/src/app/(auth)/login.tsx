import { useState } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password')
            return
        }
        try {
            setLoading(true)
            await login(email, password)
            router.replace('/(tabs)' as any)
        } catch (err: any) {
            Alert.alert(
                'Login Failed',
                err.response?.data?.message || err.message || 'Something went wrong'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>🔔</Text>
                <Text style={styles.logoText}>CareBell</Text>
                <Text style={styles.logoSub}>Medicine reminder for your loved ones</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="amal@gmail.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnText}>Sign In</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerLink}
                    onPress={() => router.push('/(auth)/register' as any)}
                >
                    <Text style={styles.registerText}>
                        Don't have an account?{' '}
                        <Text style={styles.registerTextBold}>Register</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F8F7F2',
        justifyContent: 'center',
        padding: 24,
    },
    logoBox: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: { fontSize: 48, marginBottom: 8 },
    logoText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1D9E75',
        marginBottom: 4,
    },
    logoSub: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A18',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#444',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0DFD8',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1A1A18',
        backgroundColor: '#FAFAF8',
        marginBottom: 16,
    },
    btn: {
        backgroundColor: '#1D9E75',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
        color: '#888',
    },
    registerTextBold: {
        color: '#1D9E75',
        fontWeight: '600',
    },
})