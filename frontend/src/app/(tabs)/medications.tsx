import { useState, useCallback } from 'react'
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Modal
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { medicationAPI, patientAPI } from '../../services/api'
import { showAlert, showConfirm } from '../../utils/alert'

type Medication = {
    _id: string
    name: string
    dose: string
    times: string[]
    days: number[]
    notes: string
    active: boolean
}

type Patient = {
    _id: string
    name: string
    phone: string
    language: string
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MedicationsScreen() {
    const [medications, setMedications] = useState<Medication[]>([])
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showPatientModal, setShowPatientModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingPatient, setSavingPatient] = useState(false)

    // medication form
    const [name, setName] = useState('')
    const [dose, setDose] = useState('')
    const [times, setTimes] = useState('')
    const [notes, setNotes] = useState('')
    const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])

    // patient form
    const [patientName, setPatientName] = useState('')
    const [patientPhone, setPatientPhone] = useState('')
    const [patientLanguage, setPatientLanguage] = useState('english')

    const fetchData = useCallback(async () => {
        try {
            const [medsRes, patientRes] = await Promise.allSettled([
                medicationAPI.getAll(),
                patientAPI.get(),
            ])

            if (medsRes.status === 'fulfilled') {
                setMedications(medsRes.value.data.data || [])
            } else {
                console.log('Fetch meds error:', medsRes.reason?.message)
            }

            if (patientRes.status === 'fulfilled') {
                setPatient(patientRes.value.data.data)
            } else {
                setPatient(null)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useFocusEffect(
        useCallback(() => {
            setLoading(true)
            fetchData()
        }, [fetchData])
    )

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

    const handleAddPress = () => {
        setShowModal(true)
    }

    const handleSavePatient = async () => {
        if (!patientName.trim() || !patientPhone.trim()) {
            showAlert('Error', 'Patient name and phone are required')
            return
        }

        try {
            setSavingPatient(true)
            const res = await patientAPI.create({
                name: patientName.trim(),
                phone: patientPhone.trim(),
                language: patientLanguage,
            })
            setPatient(res.data.data)
            setShowPatientModal(false)
            setPatientName('')
            setPatientPhone('')
            setPatientLanguage('english')
            showAlert('Success', 'Patient profile created. You can now add medications.')
            setShowModal(true)
        } catch (err: any) {
            showAlert('Error', err.response?.data?.message || 'Failed to create patient profile')
        } finally {
            setSavingPatient(false)
        }
    }

    const handleAdd = async () => {
        if (!name.trim() || !dose.trim() || !times.trim()) {
            showAlert('Error', 'Name, dose and time are required')
            return
        }

        const timesArray = times.split(',').map(t => t.trim()).filter(Boolean)
        if (timesArray.length === 0) {
            showAlert('Error', 'Please enter at least one valid time (e.g. 08:00)')
            return
        }

        try {
            setSaving(true)
            const res = await medicationAPI.add({
                name: name.trim(),
                dose: dose.trim(),
                times: timesArray,
                days,
                notes: notes.trim(),
            })
            setMedications(prev => [res.data.data, ...prev])
            setShowModal(false)
            resetForm()
            showAlert('Success', 'Medication added successfully!')
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Failed to add medication'
            console.log('Add medication error:', message, err.response?.status)
            showAlert('Error', message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = (id: string, medName: string) => {
        showConfirm(
            'Delete medication',
            `Remove ${medName}?`,
            async () => {
                try {
                    await medicationAPI.delete(id)
                    setMedications(prev => prev.filter(m => m._id !== id))
                } catch {
                    showAlert('Error', 'Failed to delete medication')
                }
            },
            'Delete'
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
                    onPress={handleAddPress}
                >
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* ── List ── */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {!patient && !loading && (
                    <TouchableOpacity
                        style={styles.patientBanner}
                        onPress={() => setShowPatientModal(true)}
                    >
                        <Text style={styles.patientBannerIcon}>👵</Text>
                        <View style={styles.patientBannerText}>
                            <Text style={styles.patientBannerTitle}>Set up patient profile</Text>
                            <Text style={styles.patientBannerSub}>
                                Required for reminder calls — tap to add
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

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
                                        {(med.times || []).map((t, i) => (
                                            <View key={i} style={styles.timeBadge}>
                                                <Text style={styles.timeText}>🕐 {t}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* days */}
                                    <View style={styles.daysRow}>
                                        {DAY_LABELS.map((label, i) => {
                                            const medDays = med.days || [0, 1, 2, 3, 4, 5, 6]
                                            return (
                                            <View key={i} style={[
                                                styles.dayDot,
                                                medDays.includes(i) && styles.dayDotActive
                                            ]}>
                                                <Text style={[
                                                    styles.dayDotText,
                                                    medDays.includes(i) && styles.dayDotTextActive
                                                ]}>
                                                    {label[0]}
                                                </Text>
                                            </View>
                                            )
                                        })}
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

            {/* Patient setup modal */}
            <Modal
                visible={showPatientModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowPatientModal(false)}
            >
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Patient Profile</Text>
                        <TouchableOpacity onPress={handleSavePatient} disabled={savingPatient}>
                            {savingPatient
                                ? <ActivityIndicator color="#1D9E75" />
                                : <Text style={styles.saveText}>Save</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.fieldHint}>
                            Add your loved one's details before adding medications.
                        </Text>

                        <Text style={styles.fieldLabel}>Patient name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Sarah Chen"
                            placeholderTextColor="#999"
                            value={patientName}
                            onChangeText={setPatientName}
                        />

                        <Text style={styles.fieldLabel}>Phone number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 0771234567"
                            placeholderTextColor="#999"
                            value={patientPhone}
                            onChangeText={setPatientPhone}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.fieldLabel}>Language</Text>
                        <View style={styles.daysSelector}>
                            {['english', 'sinhala', 'tamil'].map(lang => (
                                <TouchableOpacity
                                    key={lang}
                                    style={[
                                        styles.daySelectorBtn,
                                        patientLanguage === lang && styles.daySelectorBtnActive,
                                    ]}
                                    onPress={() => setPatientLanguage(lang)}
                                >
                                    <Text style={[
                                        styles.daySelectorText,
                                        patientLanguage === lang && styles.daySelectorTextActive,
                                    ]}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

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
    patientBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    patientBannerIcon: { fontSize: 28 },
    patientBannerText: { flex: 1 },
    patientBannerTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A18',
        marginBottom: 2,
    },
    patientBannerSub: {
        fontSize: 13,
        color: '#888',
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