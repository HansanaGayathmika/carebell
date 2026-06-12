import { Alert, Platform } from 'react-native'

export function showAlert(title: string, message?: string) {
    if (Platform.OS === 'web') {
        window.alert(message ? `${title}\n\n${message}` : title)
        return
    }
    Alert.alert(title, message)
}

export function showConfirm(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = 'OK'
) {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${message}`)) {
            onConfirm()
        }
        return
    }
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ])
}
