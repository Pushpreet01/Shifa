import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image } from 'react-native';
import HeroBox from '../../components/HeroBox';
import { Ionicons } from '@expo/vector-icons';

const AboutUsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBox title="About Us" showBackButton customBackRoute="Settings" />

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Mission Statement */}
          <Text style={styles.missionText}>
            Dedicated to providing a supportive and empowering platform for mental health awareness and support.
          </Text>

          {/* Main Content Sections */}
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Who We Are</Text>
              </View>
              <Text style={styles.sectionText}>
                We are a team of passionate individuals committed to breaking the stigma around mental health. Our platform brings together mental health professionals, volunteers, and community members to create a comprehensive support system for those in need.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Our Values</Text>
              </View>
              <View style={styles.valuesList}>
                <View style={styles.valueItem}>
                  <View style={styles.valueHeader}>
                    <Ionicons name="heart" size={24} color="#1B6B63" />
                    <Text style={styles.valueTitle}>Compassion</Text>
                  </View>
                  <Text style={styles.valueText}>We approach every interaction with empathy and understanding</Text>
                </View>
                <View style={styles.valueItem}>
                  <View style={styles.valueHeader}>
                    <Ionicons name="shield-checkmark" size={24} color="#1B6B63" />
                    <Text style={styles.valueTitle}>Privacy</Text>
                  </View>
                  <Text style={styles.valueText}>We prioritize user confidentiality and data protection</Text>
                </View>
                <View style={styles.valueItem}>
                  <View style={styles.valueHeader}>
                    <Ionicons name="hand-left" size={24} color="#1B6B63" />
                    <Text style={styles.valueTitle}>Accessibility</Text>
                  </View>
                  <Text style={styles.valueText}>We strive to make mental health support available to everyone</Text>
                </View>
                <View style={styles.valueItem}>
                  <View style={styles.valueHeader}>
                    <Ionicons name="people" size={24} color="#1B6B63" />
                    <Text style={styles.valueTitle}>Community</Text>
                  </View>
                  <Text style={styles.valueText}>We believe in the power of collective support and shared experiences</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Contact Us</Text>
              </View>
              <Text style={styles.sectionText}>
                Have questions or suggestions? We'd love to hear from you. Reach out to our support team through the feedback section in the app.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EC",
  },
  container: {
    paddingBottom: 120,
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  missionText: {
    fontSize: 22,
    color: '#1B6B63',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    paddingHorizontal: 10,
    fontWeight: '800',
  },
  mainContent: {
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    backgroundColor: '#1B6B63',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2E2E2E',
    padding: 15,
  },
  valuesList: {
    padding: 15,
  },
  valueItem: {
    marginBottom: 16,
    backgroundColor: '#FDF6EC',
    padding: 15,
    borderRadius: 12,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginLeft: 10,
  },
  valueText: {
    fontSize: 14,
    color: '#2E2E2E',
    lineHeight: 20,
  },
});

export default AboutUsScreen; 