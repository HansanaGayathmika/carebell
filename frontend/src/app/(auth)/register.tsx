import { useState } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function RegisterScreen() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()

    const handleRegister = async () => {
        if (!name || !email || !password || !confirm) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }
        if (password !== confirm) {
            Alert.alert('Error', 'Passwords do not match')
            return
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters')
            return
        }
        try {
            setLoading(true)
            await register(name, email, password)
            router.replace('/(tabs)' as any)
        } catch (err: any) {
            Alert.alert('Register Failed',
                err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* Logo */}
            <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>🔔</Text>
                <Text style={styles.logoText}>CareBell</Text>
                <Text style={styles.logoSub}>Create your family account</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Text style={styles.title}>Get started</Text>
                <Text style={styles.subtitle}>Set up CareBell for your loved one</Text>

                <Text style={styles.label}>Your name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Amal Fernando"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

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

                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnText}>Create Account</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.back()}
                >
                    <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text style={styles.loginTextBold}>Sign In</Text>
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
    logoIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
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
    btnDisabled: {
        opacity: 0.6,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: '#888',
    },
    loginTextBold: {
        color: '#1D9E75',
        fontWeight: '600',
    },
})