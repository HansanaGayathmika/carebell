import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'

export default function WelcomeScreen() {
  const goToSignUp = () => router.push('/(auth)/register' as any)

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logoIcon}>🔔</Text>
        <Text style={styles.logoText}>CareBell</Text>
        <Text style={styles.tagline}>
          Medicine reminders for your loved ones — simple, caring, and reliable.
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>💊</Text>
          <Text style={styles.featureText}>Track daily medications</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📞</Text>
          <Text style={styles.featureText}>Automated reminder calls</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>👵</Text>
          <Text style={styles.featureText}>Built for elderly care</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.startBtn} onPress={goToSignUp}>
          <Text style={styles.startBtnText}>Start here</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpLink} onPress={goToSignUp}>
          <Text style={styles.signUpText}>
            New here?{' '}
            <Text style={styles.signUpTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F2',
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1D9E75',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  features: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  actions: {
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: '#1D9E75',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpLink: {
    marginTop: 16,
    padding: 8,
  },
  signUpText: {
    fontSize: 14,
    color: '#888',
  },
  signUpTextBold: {
    color: '#1D9E75',
    fontWeight: '600',
  },
})
