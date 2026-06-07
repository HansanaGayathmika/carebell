import { useState, useEffect, useCallback } from 'react'
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, RefreshControl, Alert
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { patientAPI, medicationAPI } from '../../services/api'

type Medication = {
    _id: string
    name: string
    dose: string
    times: string[]
    active: boolean
}

type Patient = {
    _id: string
    name: string
    phone: string
    language: string
}

export default function DashboardScreen() {
    const { user, logout } = useAuth()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [medications, setMedications] = useState<Medication[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            // fetch patient and medications in parallel
            const [patientRes, medsRes] = await Promise.all([
                patientAPI.get(),
                medicationAPI.getAll()
            ])
            setPatient(patientRes.data.data)
            setMedications(medsRes.data.data)
        } catch (err: any) {
            // no patient yet — that's okay
            if (err.response?.status !== 404) {
                console.log('Dashboard fetch error:', err.message)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
    }

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout }
        ])
    }

    const getTimeOfDay = () => {
        const h = new Date().getHours()
        if (h < 12) return 'morning'
        if (h < 17) return 'afternoon'
        return 'evening'
    }

    const getTodayDoses = () => {
        const today = new Date().getDay()
        return medications.filter(m => m.active)
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                    tintColor="#1D9E75" />
            }
        >
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋
                    </Text>
                    <Text style={styles.date}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long', day: 'numeric', month: 'long'
                        })}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* ── Patient card ── */}
            {patient ? (
                <View style={styles.patientCard}>
                    <View style={styles.patientAvatar}>
                        <Text style={styles.patientAvatarText}>
                            {patient.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{patient.name}</Text>
                        <Text style={styles.patientSub}>{patient.phone}</Text>
                        <View style={styles.langBadge}>
                            <Text style={styles.langText}>
                                {patient.language.charAt(0).toUpperCase() + patient.language.slice(1)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push('/(tabs)/settings' as any)}
                    >
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.setupCard}
                    onPress={() => router.push('/(tabs)/settings' as any)}
                >
                    <Text style={styles.setupIcon}>👵</Text>
                    <Text style={styles.setupTitle}>Set up patient profile</Text>
                    <Text style={styles.setupSub}>
                        Add your elderly family member's details to get started
                    </Text>
                    <View style={styles.setupBtn}>
                        <Text style={styles.setupBtnText}>Get Started →</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* ── Stats row ── */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderTopColor: '#1D9E75' }]}>
                    <Text style={[styles.statValue, { color: '#1D9E75' }]}>
                        {getTodayDoses().length}
                    </Text>
                    <Text style={styles.statLabel}>Today's doses</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#185FA5' }]}>
                    <Text style={[styles.statValue, { color: '#185FA5' }]}>
                        {medications.length}
                    </Text>
                    <Text style={styles.statLabel}>Medications</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#BA7517' }]}>
                    <Text style={[styles.statValue, { color: '#BA7517' }]}>0</Text>
                    <Text style={styles.statLabel}>Missed today</Text>
                </View>
            </View>

            {/* ── Today's medications ── */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's medications</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/medications' as any)}
                    >
                        <Text style={styles.seeAll}>Manage</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Loading...</Text>
                    </View>
                ) : medications.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>💊</Text>
                        <Text style={styles.emptyTitle}>No medications yet</Text>
                        <Text style={styles.emptyText}>
                            Add medications to start sending reminders
                        </Text>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => router.push('/(tabs)/medications' as any)}
                        >
                            <Text style={styles.addBtnText}>+ Add medication</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    medications.map(med => (
                        <View key={med._id} style={styles.medCard}>
                            <View style={styles.medIconBox}>
                                <Text style={styles.medIcon}>💊</Text>
                            </View>
                            <View style={styles.medInfo}>
                                <Text style={styles.medName}>{med.name}</Text>
                                <Text style={styles.medSub}>
                                    {med.dose} · {med.times.join(', ')}
                                </Text>
                            </View>
                            <View style={styles.medStatus}>
                                <Text style={styles.medStatusText}>Scheduled</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* ── Quick actions ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push('/(tabs)/medications' as any)}
                    >
                        <Text style={styles.actionIcon}>💊</Text>
                        <Text style={styles.actionLabel}>Add medication</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push('/(tabs)/calllog' as any)}
                    >
                        <Text style={styles.actionIcon}>📞</Text>
                        <Text style={styles.actionLabel}>Call log</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push('/(tabs)/settings' as any)}
                    >
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <Text style={styles.actionLabel}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 32 }} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F7F2',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0DFD8',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A18',
    },
    date: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    logoutBtn: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    logoutText: {
        fontSize: 13,
        color: '#888',
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
        gap: 12,
    },
    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E1F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    patientAvatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D9E75',
    },
    patientInfo: { flex: 1 },
    patientName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A18',
    },
    patientSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    langBadge: {
        marginTop: 4,
        backgroundColor: '#E1F5EE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    langText: {
        fontSize: 11,
        color: '#085041',
        fontWeight: '500',
    },
    editBtn: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    editBtnText: {
        fontSize: 12,
        color: '#888',
    },
    setupCard: {
        margin: 16,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
        alignItems: 'center',
    },
    setupIcon: { fontSize: 40, marginBottom: 12 },
    setupTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A18',
        marginBottom: 6,
    },
    setupSub: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    setupBtn: {
        backgroundColor: '#1D9E75',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    setupBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderTopWidth: 3,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
        textAlign: 'center',
    },
    section: {
        margin: 16,
        marginBottom: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A18',
    },
    seeAll: {
        fontSize: 14,
        color: '#1D9E75',
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 24,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    emptyIcon: { fontSize: 32, marginBottom: 8 },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A18',
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
    addBtn: {
        marginTop: 14,
        backgroundColor: '#1D9E75',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    medCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
        gap: 12,
    },
    medIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E1F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    medIcon: { fontSize: 20 },
    medInfo: { flex: 1 },
    medName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A18',
    },
    medSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    medStatus: {
        backgroundColor: '#E1F5EE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    medStatusText: {
        fontSize: 11,
        color: '#085041',
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
        gap: 8,
    },
    actionIcon: { fontSize: 24 },
    actionLabel: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
})