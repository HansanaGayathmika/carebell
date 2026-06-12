import { useState, useEffect } from 'react'
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, TextInput, Alert,
    ActivityIndicator, Switch
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { patientAPI } from '../../services/api'

const LANGUAGES = ['sinhala', 'tamil', 'english', 'hindi']
const VOICES = ['warm', 'friendly', 'formal']
const RETRIES = [1, 2, 3, 4, 5]
const INTERVALS = [5, 10, 15, 20, 30]

export default function SettingsScreen() {
    const { user, logout } = useAuth()

    // patient form
    const [patientId, setPatientId] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [language, setLanguage] = useState('sinhala')
    const [voiceStyle, setVoiceStyle] = useState('warm')
    const [retryAttempts, setRetryAttempts] = useState(3)
    const [retryInterval, setRetryInterval] = useState(15)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchPatient() }, [])

    const fetchPatient = async () => {
        try {
            const res = await patientAPI.get()
            const p = res.data.data
            setPatientId(p._id)
            setName(p.name)
            setPhone(p.phone)
            setLanguage(p.language)
            setVoiceStyle(p.voiceStyle)
            setRetryAttempts(p.retryAttempts)
            setRetryInterval(p.retryInterval)
        } catch (err: any) {
            // no patient yet — that's fine
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!name || !phone) {
            Alert.alert('Error', 'Name and phone number are required')
            return
        }
        try {
            setSaving(true)
            if (patientId) {
                await patientAPI.update({
                    name, phone, language,
                    voiceStyle, retryAttempts, retryInterval
                })
            } else {
                await patientAPI.create({
                    name, phone, language,
                    voiceStyle, retryAttempts, retryInterval
                })
            }
            Alert.alert('Saved', 'Patient profile updated successfully!')
            fetchPatient()
        } catch (err: any) {
            Alert.alert('Error',
                err.response?.data?.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout }
        ])
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1D9E75" />
            </View>
        )
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSub}>Manage patient and app settings</Text>
            </View>

            {/* ── Account card ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <View style={styles.accountRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={styles.accountName}>{user?.name}</Text>
                            <Text style={styles.accountEmail}>{user?.email}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── Patient profile ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {patientId ? 'Patient profile' : 'Set up patient profile'}
                </Text>
                <View style={styles.card}>

                    <Text style={styles.fieldLabel}>Patient name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Soma Amma"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.fieldLabel}>Phone number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+94771234567"
                        placeholderTextColor="#999"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    {/* language selector */}
                    <Text style={styles.fieldLabel}>Call language</Text>
                    <View style={styles.optionRow}>
                        {LANGUAGES.map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[
                                    styles.optionBtn,
                                    language === lang && styles.optionBtnActive
                                ]}
                                onPress={() => setLanguage(lang)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    language === lang && styles.optionTextActive
                                ]}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* voice style */}
                    <Text style={styles.fieldLabel}>Voice style</Text>
                    <View style={styles.optionRow}>
                        {VOICES.map(v => (
                            <TouchableOpacity
                                key={v}
                                style={[
                                    styles.optionBtn,
                                    voiceStyle === v && styles.optionBtnActive
                                ]}
                                onPress={() => setVoiceStyle(v)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    voiceStyle === v && styles.optionTextActive
                                ]}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* retry attempts */}
                    <Text style={styles.fieldLabel}>Retry attempts</Text>
                    <View style={styles.optionRow}>
                        {RETRIES.map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[
                                    styles.optionBtn,
                                    retryAttempts === r && styles.optionBtnActive
                                ]}
                                onPress={() => setRetryAttempts(r)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    retryAttempts === r && styles.optionTextActive
                                ]}>
                                    {r}x
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* retry interval */}
                    <Text style={styles.fieldLabel}>Retry interval (minutes)</Text>
                    <View style={styles.optionRow}>
                        {INTERVALS.map(i => (
                            <TouchableOpacity
                                key={i}
                                style={[
                                    styles.optionBtn,
                                    retryInterval === i && styles.optionBtnActive
                                ]}
                                onPress={() => setRetryInterval(i)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    retryInterval === i && styles.optionTextActive
                                ]}>
                                    {i}m
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* save button */}
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.saveBtnText}>
                                {patientId ? 'Update profile' : 'Create profile'}
                            </Text>
                        }
                    </TouchableOpacity>

                </View>
            </View>

            {/* ── App info ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App info</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Backend</Text>
                        <Text style={[styles.infoValue, { color: '#1D9E75' }]}>
                            Connected ✅
                        </Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.infoLabel}>AI calls</Text>
                        <Text style={[styles.infoValue, { color: '#BA7517' }]}>
                            Twilio pending ⏳
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Logout ── */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F7F2',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0DFD8',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A18',
    },
    headerSub: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E1F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D9E75',
    },
    accountInfo: { flex: 1 },
    accountName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A18',
    },
    accountEmail: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
        marginTop: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0DFD8',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1A1A18',
        backgroundColor: '#FAFAF8',
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0DFD8',
        backgroundColor: '#FAFAF8',
    },
    optionBtnActive: {
        backgroundColor: '#1D9E75',
        borderColor: '#1D9E75',
    },
    optionText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#fff',
    },
    saveBtn: {
        backgroundColor: '#1D9E75',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F1EFE8',
    },
    infoLabel: {
        fontSize: 14,
        color: '#444',
    },
    infoValue: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    logoutBtn: {
        backgroundColor: '#FCEBEB',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#F5C6C6',
    },
    logoutText: {
        color: '#A32D2D',
        fontSize: 15,
        fontWeight: '600',
    },
})