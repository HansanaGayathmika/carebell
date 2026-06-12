import { useState, useEffect, useCallback } from 'react'
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native'

type CallLog = {
    _id: string
    medicationName: string
    status: 'confirmed' | 'missed' | 'pending' | 'calling'
    scheduledFor: string
    attempts: number
    confirmedAt: string | null
    alertSent: boolean
}

// mock data — replace with real API call when backend logs are ready
const MOCK_LOGS: CallLog[] = [
    {
        _id: '1',
        medicationName: 'Metformin 500mg',
        status: 'confirmed',
        scheduledFor: new Date().toISOString(),
        attempts: 1,
        confirmedAt: new Date().toISOString(),
        alertSent: false
    },
    {
        _id: '2',
        medicationName: 'Amlodipine 5mg',
        status: 'missed',
        scheduledFor: new Date(Date.now() - 3600000).toISOString(),
        attempts: 3,
        confirmedAt: null,
        alertSent: true
    },
    {
        _id: '3',
        medicationName: 'Metformin 500mg',
        status: 'confirmed',
        scheduledFor: new Date(Date.now() - 86400000).toISOString(),
        attempts: 2,
        confirmedAt: new Date(Date.now() - 86400000).toISOString(),
        alertSent: false
    },
    {
        _id: '4',
        medicationName: 'Vitamin D',
        status: 'missed',
        scheduledFor: new Date(Date.now() - 86400000 * 2).toISOString(),
        attempts: 3,
        confirmedAt: null,
        alertSent: true
    },
    {
        _id: '5',
        medicationName: 'Amlodipine 5mg',
        status: 'confirmed',
        scheduledFor: new Date(Date.now() - 86400000 * 2).toISOString(),
        attempts: 1,
        confirmedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        alertSent: false
    },
]

export default function CallLogScreen() {
    const [logs, setLogs] = useState<CallLog[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [filter, setFilter] = useState<'all' | 'confirmed' | 'missed'>('all')

    const fetchLogs = useCallback(async () => {
        // TODO: replace with real API call
        // const res = await api.get('/logs/all')
        // setLogs(res.data.data)
        await new Promise(r => setTimeout(r, 500)) // simulate loading
        setLogs(MOCK_LOGS)
        setLoading(false)
    }, [])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchLogs()
        setRefreshing(false)
    }

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true
        return log.status === filter
    })

    const confirmed = logs.filter(l => l.status === 'confirmed').length
    const missed = logs.filter(l => l.status === 'missed').length
    const total = logs.length

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return {
                bg: '#E1F5EE', color: '#085041',
                icon: '✅', label: 'Confirmed'
            }
            case 'missed': return {
                bg: '#FCEBEB', color: '#A32D2D',
                icon: '❌', label: 'Missed'
            }
            case 'calling': return {
                bg: '#E6F1FB', color: '#185FA5',
                icon: '📞', label: 'Calling'
            }
            default: return {
                bg: '#FAEEDA', color: '#854F0B',
                icon: '⏰', label: 'Pending'
            }
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return `Today ${date.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
            })}`
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
            })}`
        }
        return date.toLocaleDateString('en-US', {
            day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <View style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Call Log</Text>
                <Text style={styles.headerSub}>AI call history</Text>
            </View>

            {/* ── Stats ── */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderTopColor: '#1D9E75' }]}>
                    <Text style={[styles.statVal, { color: '#1D9E75' }]}>{total}</Text>
                    <Text style={styles.statLabel}>Total calls</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#185FA5' }]}>
                    <Text style={[styles.statVal, { color: '#185FA5' }]}>{confirmed}</Text>
                    <Text style={styles.statLabel}>Confirmed</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#A32D2D' }]}>
                    <Text style={[styles.statVal, { color: '#A32D2D' }]}>{missed}</Text>
                    <Text style={styles.statLabel}>Missed</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#BA7517' }]}>
                    <Text style={[styles.statVal, { color: '#BA7517' }]}>
                        {total > 0 ? Math.round((confirmed / total) * 100) : 0}%
                    </Text>
                    <Text style={styles.statLabel}>Rate</Text>
                </View>
            </View>

            {/* ── Filter tabs ── */}
            <View style={styles.filterRow}>
                {(['all', 'confirmed', 'missed'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === f && styles.filterTextActive
                        ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Log list ── */}
            <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1D9E75"
                    />
                }
            >
                {loading ? (
                    <ActivityIndicator
                        size="large" color="#1D9E75"
                        style={{ marginTop: 60 }}
                    />
                ) : filteredLogs.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>📵</Text>
                        <Text style={styles.emptyTitle}>No calls yet</Text>
                        <Text style={styles.emptySub}>
                            Call logs will appear here once the AI starts making calls
                        </Text>
                    </View>
                ) : (
                    filteredLogs.map(log => {
                        const s = getStatusStyle(log.status)
                        return (
                            <View key={log._id} style={styles.logCard}>

                                {/* status icon */}
                                <View style={[styles.logIcon, { backgroundColor: s.bg }]}>
                                    <Text style={styles.logIconText}>{s.icon}</Text>
                                </View>

                                {/* info */}
                                <View style={styles.logInfo}>
                                    <Text style={styles.logMedName}>{log.medicationName}</Text>
                                    <Text style={styles.logTime}>{formatDate(log.scheduledFor)}</Text>
                                    <View style={styles.logMeta}>
                                        <Text style={styles.logAttempts}>
                                            {log.attempts} attempt{log.attempts !== 1 ? 's' : ''}
                                        </Text>
                                        {log.alertSent && (
                                            <View style={styles.alertBadge}>
                                                <Text style={styles.alertBadgeText}>
                                                    ⚠️ Family alerted
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* status badge */}
                                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                                    <Text style={[styles.statusText, { color: s.color }]}>
                                        {s.label}
                                    </Text>
                                </View>

                            </View>
                        )
                    })
                )}
                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
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
    statsRow: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 8,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        borderTopWidth: 3,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    statVal: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
        textAlign: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
    },
    filterBtnActive: {
        backgroundColor: '#1D9E75',
        borderColor: '#1D9E75',
    },
    filterText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
    },
    list: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    emptyBox: {
        alignItems: 'center',
        marginTop: 80,
        gap: 8,
    },
    emptyIcon: { fontSize: 48 },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A18',
    },
    emptySub: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 32,
        lineHeight: 20,
    },
    logCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
        gap: 12,
    },
    logIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logIconText: { fontSize: 18 },
    logInfo: { flex: 1 },
    logMedName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A18',
        marginBottom: 2,
    },
    logTime: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    logMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logAttempts: {
        fontSize: 11,
        color: '#aaa',
    },
    alertBadge: {
        backgroundColor: '#FAEEDA',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    alertBadgeText: {
        fontSize: 10,
        color: '#854F0B',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
})