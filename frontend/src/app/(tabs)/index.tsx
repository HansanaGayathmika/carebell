import { useState, useEffect, useCallback } from 'react'
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, RefreshControl, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
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

const QUICK_ACTIONS = [
    { id: 'meds', label: 'Meds', icon: 'medical' as const, color: '#7C3AED', bg: '#F3E8FF', route: '/(tabs)/medications' },
    { id: 'calls', label: 'Calls', icon: 'call' as const, color: '#2563EB', bg: '#DBEAFE', route: '/(tabs)/calllog' },
    { id: 'settings', label: 'Settings', icon: 'settings' as const, color: '#059669', bg: '#D1FAE5', route: '/(tabs)/settings' },
    { id: 'add', label: 'Add', icon: 'add-circle' as const, color: '#DC2626', bg: '#FEE2E2', route: '/(tabs)/medications' },
]

function Avatar({ name, size = 48, style }: { name: string; size?: number; style?: object }) {
    const initial = name?.charAt(0)?.toUpperCase() || '?'
    return (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
            <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initial}</Text>
        </View>
    )
}

function WellnessRing({ percent }: { percent: number }) {
    return (
        <View style={styles.wellnessRing}>
            <View style={styles.wellnessRingTrack} />
            <View style={[styles.wellnessRingFill, { transform: [{ rotate: `${(percent / 100) * 360 - 90}deg` }] }]} />
            <View style={styles.wellnessRingInner}>
                <Text style={styles.wellnessPercent}>{percent}%</Text>
                <Text style={styles.wellnessLabel}>Wellness</Text>
            </View>
        </View>
    )
}

export default function DashboardScreen() {
    const { user, logout } = useAuth()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [medications, setMedications] = useState<Medication[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const [patientRes, medsRes] = await Promise.all([
                patientAPI.get(),
                medicationAPI.getAll(),
            ])
            setPatient(patientRes.data.data)
            setMedications(medsRes.data.data)
        } catch (err: any) {
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
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout()
                    router.replace('/' as any)
                },
            },
        ])
    }

    const getTimeOfDay = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Morning'
        if (h < 17) return 'Afternoon'
        return 'Evening'
    }

    const activeMeds = medications.filter(m => m.active)
    const wellnessScore = patient
        ? Math.min(100, Math.round(40 + activeMeds.length * 15 + (medications.length > 0 ? 20 : 0)))
        : 0

    const nextMed = activeMeds[0]

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D9E75" />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onLongPress={handleLogout}>
                        <Avatar name={user?.name || 'U'} size={44} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.greetingSub}>Good {getTimeOfDay()}</Text>
                        <Text style={styles.greetingName}>{user?.name || 'User'}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => Alert.alert('Notifications', 'No new notifications')}
                >
                    <Ionicons name="notifications-outline" size={22} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Wellness card */}
            {patient ? (
                <LinearGradient
                    colors={['#D4F5E9', '#FEF9C3', '#FDE68A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.wellnessCard}
                >
                    <View style={styles.wellnessTop}>
                        <Avatar name={patient.name} size={52} style={styles.wellnessAvatar} />
                        <View style={styles.wellnessInfo}>
                            <Text style={styles.wellnessTag}>Patient wellness today</Text>
                            <Text style={styles.wellnessName}>{patient.name}</Text>
                            <Text style={styles.wellnessMeta}>
                                {patient.phone} · {patient.language.charAt(0).toUpperCase() + patient.language.slice(1)}
                            </Text>
                            <View style={styles.vitalsRow}>
                                <View style={styles.vitalChip}>
                                    <Ionicons name="medical-outline" size={14} color="#059669" />
                                    <Text style={styles.vitalText}>{activeMeds.length} meds</Text>
                                </View>
                                <View style={styles.vitalChip}>
                                    <Ionicons name="call-outline" size={14} color="#059669" />
                                    <Text style={styles.vitalText}>Reminders on</Text>
                                </View>
                            </View>
                        </View>
                        <WellnessRing percent={wellnessScore} />
                    </View>
                </LinearGradient>
            ) : (
                <TouchableOpacity
                    style={styles.setupCard}
                    onPress={() => router.push('/(tabs)/settings' as any)}
                >
                    <LinearGradient
                        colors={['#D4F5E9', '#FEF9C3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.setupGradient}
                    >
                        <Text style={styles.setupIcon}>👵</Text>
                        <View style={styles.setupTextWrap}>
                            <Text style={styles.setupTitle}>Set up patient profile</Text>
                            <Text style={styles.setupSub}>
                                Add your loved one's details to start tracking wellness
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#059669" />
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Quick actions grid */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <TouchableOpacity style={styles.customizeBtn}>
                        <Ionicons name="options-outline" size={16} color="#6B7280" />
                        <Text style={styles.customizeText}>Customize</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.actionsGrid}>
                    {QUICK_ACTIONS.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionPill}
                            onPress={() => router.push(action.route as any)}
                        >
                            <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                                <Ionicons name={action.icon} size={26} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Today's medications list */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/medications' as any)}>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.taskCard}>
                    {loading ? (
                        <Text style={styles.emptyText}>Loading...</Text>
                    ) : medications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💊</Text>
                            <Text style={styles.emptyTitle}>No medications yet</Text>
                            <Text style={styles.emptyText}>Add medications to start reminders</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => router.push('/(tabs)/medications' as any)}
                            >
                                <Text style={styles.addBtnText}>+ Add medication</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        medications.slice(0, 4).map((med, index) => (
                            <View
                                key={med._id}
                                style={[styles.taskRow, index < Math.min(medications.length, 4) - 1 && styles.taskRowBorder]}
                            >
                                <View style={[styles.taskIcon, { backgroundColor: index === 0 ? '#FEF3C7' : '#D1FAE5' }]}>
                                    <Ionicons
                                        name={index === 0 ? 'medical' : 'heart'}
                                        size={20}
                                        color={index === 0 ? '#D97706' : '#059669'}
                                    />
                                </View>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>
                                        {med.name} — {med.dose}
                                    </Text>
                                    <Text style={styles.taskSub}>
                                        {med.times[0] || 'Scheduled'} · Assigned to you
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    med.active ? styles.statusPending : styles.statusDone,
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        med.active ? styles.statusPendingText : styles.statusDoneText,
                                    ]}>
                                        {med.active ? 'Pending' : 'Completed'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </View>

            {/* Upcoming reminder */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming Reminder</Text>
                <TouchableOpacity
                    style={styles.appointmentCard}
                    onPress={() => router.push('/(tabs)/calllog' as any)}
                >
                    <Avatar name={patient?.name || 'CareBell'} size={48} />
                    <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentTitle}>
                            {nextMed
                                ? `${nextMed.name} reminder`
                                : 'Medicine reminder call'}
                        </Text>
                        <View style={styles.appointmentMeta}>
                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                            <Text style={styles.appointmentMetaText}>
                                {nextMed?.times[0] || 'Set a schedule'} · Automated call
                            </Text>
                        </View>
                        <View style={styles.appointmentMeta}>
                            <Ionicons name="call-outline" size={14} color="#6B7280" />
                            <Text style={styles.appointmentMetaText}>
                                {patient?.phone || 'Add patient phone in settings'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.appointmentArrow}>
                        <Ionicons name="chevron-forward" size={18} color="#374151" />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerText: {
        gap: 2,
    },
    greetingSub: {
        fontSize: 14,
        color: '#6B7280',
    },
    greetingName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontWeight: '700',
        color: '#374151',
    },
    wellnessCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    wellnessTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    wellnessAvatar: {
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    wellnessInfo: {
        flex: 1,
    },
    wellnessTag: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    wellnessName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    wellnessMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 10,
    },
    vitalsRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    vitalChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.65)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    vitalText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    wellnessRing: {
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wellnessRingTrack: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    wellnessRingFill: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 6,
        borderColor: '#059669',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
    },
    wellnessRingInner: {
        alignItems: 'center',
    },
    wellnessPercent: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    wellnessLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    setupCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    setupGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 14,
    },
    setupIcon: { fontSize: 36 },
    setupTextWrap: { flex: 1 },
    setupTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    setupSub: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    customizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    customizeText: {
        fontSize: 13,
        color: '#6B7280',
    },
    seeAll: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '500',
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionPill: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    taskRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    taskIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 3,
    },
    taskSub: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
    },
    statusDone: {
        backgroundColor: '#D1FAE5',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusPendingText: {
        color: '#D97706',
    },
    statusDoneText: {
        color: '#059669',
    },
    emptyState: {
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: { fontSize: 32, marginBottom: 8 },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    addBtn: {
        marginTop: 14,
        backgroundColor: '#059669',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    appointmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginTop: 16,
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    appointmentInfo: {
        flex: 1,
        gap: 4,
    },
    appointmentTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    appointmentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    appointmentMetaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    appointmentArrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
})
