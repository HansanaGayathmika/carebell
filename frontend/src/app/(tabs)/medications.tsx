import { useState, useEffect, useCallback } from 'react'
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Modal
} from 'react-native'
import { medicationAPI } from '../../services/api'

type Medication = {
    _id: string
    name: string
    dose: string
    times: string[]
    days: number[]
    notes: string
    active: boolean
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MedicationsScreen() {
    const [medications, setMedications] = useState<Medication[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)

    // form state
    const [name, setName] = useState('')
    const [dose, setDose] = useState('')
    const [times, setTimes] = useState('')
    const [notes, setNotes] = useState('')
    const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])

    const fetchMedications = useCallback(async () => {
        try {
            const res = await medicationAPI.getAll()
            setMedications(res.data.data)
        } catch (err: any) {
            console.log('Fetch meds error:', err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMedications() }, [fetchMedications])

    const toggleDay = (day: number) => {
        setDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        )
    }

    const resetForm = () => {
        setName('')
        setDose('')
        setTimes('')
        setNotes('')
        setDays([0, 1, 2, 3, 4, 5, 6])
    }

    const handleAdd = async () => {
        if (!name || !dose || !times) {
            Alert.alert('Error', 'Name, dose and time are required')
            return
        }

        // convert "08:00, 20:00" → ["08:00", "20:00"]
        const timesArray = times.split(',').map(t => t.trim()).filter(t => t)

        try {
            setSaving(true)
            await medicationAPI.add({
                name,
                dose,
                times: timesArray,
                days,
                notes
            })
            await fetchMedications()
            setShowModal(false)
            resetForm()
            Alert.alert('Success', 'Medication added successfully!')
        } catch (err: any) {
            Alert.alert('Error',
                err.response?.data?.message || 'Failed to add medication')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete medication',
            `Remove ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await medicationAPI.delete(id)
                            await fetchMedications()
                        } catch (err: any) {
                            Alert.alert('Error', 'Failed to delete medication')
                        }
                    }
                }
            ]
        )
    }

    return (
        <View style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Medications</Text>
                    <Text style={styles.headerSub}>
                        {medications.length} medication{medications.length !== 1 ? 's' : ''} added
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setShowModal(true)}
                >
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* ── List ── */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator
                        size="large" color="#1D9E75"
                        style={{ marginTop: 60 }}
                    />
                ) : medications.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>💊</Text>
                        <Text style={styles.emptyTitle}>No medications yet</Text>
                        <Text style={styles.emptySub}>
                            Tap "+ Add" to add your first medication
                        </Text>
                    </View>
                ) : (
                    medications.map(med => (
                        <View key={med._id} style={styles.medCard}>

                            {/* icon + info */}
                            <View style={styles.medLeft}>
                                <View style={styles.medIconBox}>
                                    <Text style={styles.medIconText}>💊</Text>
                                </View>
                                <View style={styles.medInfo}>
                                    <Text style={styles.medName}>{med.name}</Text>
                                    <Text style={styles.medDose}>{med.dose}</Text>

                                    {/* times */}
                                    <View style={styles.timeRow}>
                                        {med.times.map((t, i) => (
                                            <View key={i} style={styles.timeBadge}>
                                                <Text style={styles.timeText}>🕐 {t}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* days */}
                                    <View style={styles.daysRow}>
                                        {DAY_LABELS.map((label, i) => (
                                            <View key={i} style={[
                                                styles.dayDot,
                                                med.days.includes(i) && styles.dayDotActive
                                            ]}>
                                                <Text style={[
                                                    styles.dayDotText,
                                                    med.days.includes(i) && styles.dayDotTextActive
                                                ]}>
                                                    {label[0]}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {med.notes ? (
                                        <Text style={styles.medNotes}>📝 {med.notes}</Text>
                                    ) : null}
                                </View>
                            </View>

                            {/* delete button */}
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(med._id, med.name)}
                            >
                                <Text style={styles.deleteBtnText}>🗑️</Text>
                            </TouchableOpacity>

                        </View>
                    ))
                )}
                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── Add medication modal ── */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modal}>

                    {/* modal header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => {
                            setShowModal(false)
                            resetForm()
                        }}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Medication</Text>
                        <TouchableOpacity onPress={handleAdd} disabled={saving}>
                            {saving
                                ? <ActivityIndicator color="#1D9E75" />
                                : <Text style={styles.saveText}>Save</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>

                        {/* name */}
                        <Text style={styles.fieldLabel}>Medication name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Metformin 500mg"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* dose */}
                        <Text style={styles.fieldLabel}>Dose *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 1 tablet"
                            placeholderTextColor="#999"
                            value={dose}
                            onChangeText={setDose}
                        />

                        {/* times */}
                        <Text style={styles.fieldLabel}>Time(s) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 08:00 or 08:00, 20:00"
                            placeholderTextColor="#999"
                            value={times}
                            onChangeText={setTimes}
                        />
                        <Text style={styles.fieldHint}>
                            Separate multiple times with a comma
                        </Text>

                        {/* days */}
                        <Text style={styles.fieldLabel}>Days</Text>
                        <View style={styles.daysSelector}>
                            {DAY_LABELS.map((label, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.daySelectorBtn,
                                        days.includes(i) && styles.daySelectorBtnActive
                                    ]}
                                    onPress={() => toggleDay(i)}
                                >
                                    <Text style={[
                                        styles.daySelectorText,
                                        days.includes(i) && styles.daySelectorTextActive
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* notes */}
                        <Text style={styles.fieldLabel}>Notes (optional)</Text>
                        <TextInput
                            style={[styles.input, styles.inputMulti]}
                            placeholder="e.g. Take after food"
                            placeholderTextColor="#999"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </Modal>

        </View>
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
    addBtn: {
        backgroundColor: '#1D9E75',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    list: {
        flex: 1,
        padding: 16,
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
    },
    medCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: '#E0DFD8',
        alignItems: 'flex-start',
    },
    medLeft: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    medIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E1F5EE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    medIconText: { fontSize: 22 },
    medInfo: { flex: 1 },
    medName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A18',
        marginBottom: 2,
    },
    medDose: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    timeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    timeBadge: {
        backgroundColor: '#E6F1FB',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    timeText: {
        fontSize: 12,
        color: '#185FA5',
        fontWeight: '500',
    },
    daysRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 6,
    },
    dayDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F1EFE8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayDotActive: {
        backgroundColor: '#1D9E75',
    },
    dayDotText: {
        fontSize: 9,
        color: '#888',
        fontWeight: '600',
    },
    dayDotTextActive: {
        color: '#fff',
    },
    medNotes: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    deleteBtn: {
        padding: 4,
    },
    deleteBtnText: { fontSize: 18 },
    modal: {
        flex: 1,
        backgroundColor: '#F8F7F2',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0DFD8',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A18',
    },
    cancelText: {
        fontSize: 15,
        color: '#888',
    },
    saveText: {
        fontSize: 15,
        color: '#1D9E75',
        fontWeight: '600',
    },
    modalBody: {
        flex: 1,
        padding: 20,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#444',
        marginBottom: 6,
        marginTop: 16,
    },
    fieldHint: {
        fontSize: 11,
        color: '#aaa',
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0DFD8',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1A1A18',
        backgroundColor: '#fff',
    },
    inputMulti: {
        height: 80,
        textAlignVertical: 'top',
    },
    daysSelector: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    daySelectorBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0DFD8',
        backgroundColor: '#fff',
    },
    daySelectorBtnActive: {
        backgroundColor: '#1D9E75',
        borderColor: '#1D9E75',
    },
    daySelectorText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    daySelectorTextActive: {
        color: '#fff',
    },
})