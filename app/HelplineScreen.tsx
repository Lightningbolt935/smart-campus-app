import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

type Contact = {
  id: string;
  name: string;
  role?: string;
  number: string;
  alt?: string;
  email?: string;
  available: string;
};

type Section = {
  id: string;
  title: string;
  icon: string;
  color: string;
  contacts: Contact[];
};

const SECTIONS: Section[] = [
  {
    id: 'emergency',
    title: 'Emergency',
    icon: '🚨',
    color: '#EF4444',
    contacts: [
      { id: 'ambulance', name: 'Ambulance', role: 'Campus Hospital', number: '10578627478000', available: '24 × 7' },
      { id: 'casualty',  name: 'Casualty',  role: 'SRM Hospital',   number: '04447432345',   alt: '04447432346', available: '24 × 7' },
      { id: 'police',    name: 'Police',    role: 'National',        number: '100',           available: '24 × 7' },
      { id: 'fire',      name: 'Fire',      role: 'National',        number: '101',           available: '24 × 7' },
    ],
  },
  {
    id: 'campus',
    title: 'Campus Helpline',
    icon: '🏫',
    color: '#6366F1',
    contacts: [
      { id: 'helpline',  name: 'SRM Helpline',       role: 'General enquiries',  number: '04447432350', available: '9 AM – 5 PM' },
      { id: 'enquiry1',  name: 'Enquiry',             role: 'Main campus',        number: '04447432333', alt: '04447432444', available: '9 AM – 5 PM' },
      { id: 'main',      name: 'Main Campus',         role: 'Switchboard',        number: '04427417777', alt: '04427417000', available: '9 AM – 5 PM' },
      { id: 'admin',     name: 'Admin Office',        role: 'College admin',      number: '04447432502', available: 'Mon – Fri' },
    ],
  },
  {
    id: 'medical',
    title: 'Medical Centre',
    icon: '🏥',
    color: '#10B981',
    contacts: [
      { id: 'med_sup',   name: 'Medical Superintendent', role: 'SRM Hospital KTR', number: '04447432304', email: 'ms.ktr@srmist.edu.in',    available: 'Office hours' },
      { id: 'rmo',       name: 'RMO Office',             role: 'Resident Med Off', number: '04447432306', email: 'rmo.ktr@srmist.edu.in',    available: '24 × 7' },
      { id: 'hospital',  name: 'SRM Hospital',           role: 'General',          number: '04467000000',                                     available: '24 × 7' },
      { id: 'dean_med',  name: 'Dean – Hospital',        role: 'Medical college',  number: '04447432367', email: 'Dean.medical.ktr@srmist.edu.in', available: 'Office hours' },
    ],
  },
  {
    id: 'hostel',
    title: 'Hostel',
    icon: '🏠',
    color: '#F59E0B',
    contacts: [
      { id: 'hostel_dir',  name: 'Director – Hostels',  role: 'Dr. E. Poovammal',    number: '9940036021',  email: 'director.hostels@srmist.edu.in', available: 'Office hours' },
      { id: 'hostel_off',  name: 'Hostel Office',       role: 'General queries',     number: '04427456364', alt: '04427434506', email: 'srm.hostels.ktr@srmist.edu.in', available: '9 AM – 6 PM' },
      { id: 'gents_war',   name: "Gents Hostel Warden", role: 'Senior Warden',       number: '8056016627',  email: 'seniorwarden.gentshostel.ktr@srmist.edu.in', available: 'Office hours' },
      { id: 'ladies_war',  name: 'Ladies Hostel Warden',role: 'Deputy Warden',       number: '9600134042',  available: 'Office hours' },
      { id: 'hostel_mob',  name: 'Hostel Assistant',    role: 'On-campus queries',   number: '6381310672',  available: '9 AM – 6 PM' },
    ],
  },
  {
    id: 'antiragging',
    title: 'Anti-Ragging',
    icon: '🛡️',
    color: '#8B5CF6',
    contacts: [
      { id: 'ar_srm1',  name: 'SRM Anti-Ragging Helpline', role: 'SRMIST KTR',     number: '9940036024', email: 'antiragging.helpline@srmist.edu.in', available: '24 × 7' },
      { id: 'ar_srm2',  name: 'SRM Anti-Ragging (Alt)',    role: 'SRMIST KTR',     number: '9940036028', available: '24 × 7' },
      { id: 'ar_squad', name: 'Anti-Ragging Squad',        role: 'Dr. T. Rajasekaran', number: '9884420995', email: 'rajasekt1@srmist.edu.in', available: 'Office hours' },
      { id: 'ar_nat',   name: 'National Anti-Ragging',     role: 'UGC – Toll Free', number: '18001805522', email: 'helpline@antiragging.in', available: '24 × 7' },
    ],
  },
  {
    id: 'transport',
    title: 'Transport',
    icon: '🚌',
    color: '#FF6B35',
    contacts: [
      { id: 'bus_mgr',  name: 'Transport Manager',   role: 'Bus service',          number: '9842526615', email: 'transport@srmuniversity.ac.in', available: 'Office hours' },
      { id: 'bus_stn',  name: 'Bus Service Station', role: 'On-campus bus stop',   number: '04427417000', available: '6 AM – 8 PM' },
    ],
  },
  {
    id: 'icc',
    title: 'ICC & Complaints',
    icon: '⚖️',
    color: '#EC4899',
    contacts: [
      { id: 'icc1', name: 'Internal Complaints Committee', role: 'SRMIST KTR', number: '9444255090', email: 'po.icc.ktr@srmist.edu.in', available: 'Office hours' },
      { id: 'icc2', name: 'ICC (Alt)',                      role: 'SRMIST KTR', number: '9940567330', available: 'Office hours' },
    ],
  },
];

function call(number: string) {
  const clean = number.replace(/\D/g, '');
  Linking.openURL(`tel:${clean}`).catch(() =>
    Alert.alert('Unable to call', 'Please dial manually: ' + number)
  );
}

function mail(email: string) {
  Linking.openURL(`mailto:${email}`);
}

function ContactCard({ contact, color }: { contact: Contact; color: string }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardMain}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{contact.name}</Text>
          {contact.role && <Text style={styles.cardRole}>{contact.role}</Text>}
          <View style={styles.availRow}>
            <View style={[styles.availDot, { backgroundColor: contact.available.includes('24') ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.availText}>{contact.available}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.callBtn, { backgroundColor: color }]} onPress={() => call(contact.number)}>
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardNumbers}>
        <Text style={styles.numberText}>{contact.number}</Text>
        {contact.alt && <Text style={styles.numberAlt}>Alt: {contact.alt}</Text>}
      </View>

      {contact.email && (
        <TouchableOpacity onPress={() => mail(contact.email!)} style={styles.emailRow}>
          <Text style={styles.emailText}>✉ {contact.email}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HelplineScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(['emergency']);

  const toggle = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Helpline</Text>
          <Text style={styles.headerSub}>SRM KTR · Important Contacts</Text>
        </View>
      </View>

      {/* Emergency banner */}
      <View style={styles.emergencyBanner}>
        <Text style={styles.emergencyEmoji}>🚨</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.emergencyTitle}>Emergency? Call Ambulance</Text>
          <Text style={styles.emergencyNum}>10578627478000</Text>
        </View>
        <TouchableOpacity style={styles.emergencyBtn} onPress={() => call('10578627478000')}>
          <Text style={styles.emergencyBtnText}>Call Now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map(section => {
          const isOpen = expanded.includes(section.id);
          return (
            <View key={section.id} style={styles.section}>
              {/* Section header */}
              <TouchableOpacity style={[styles.sectionHeader, { borderLeftColor: section.color }]} onPress={() => toggle(section.id)}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={[styles.sectionCount, { color: section.color }]}>{section.contacts.length}</Text>
                <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
              </TouchableOpacity>

              {/* Contacts */}
              {isOpen && section.contacts.map(contact => (
                <ContactCard key={contact.id} contact={contact} color={section.color} />
              ))}
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Numbers sourced from srmist.edu.in · Verify before use</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8F9FB' },

  header:           { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB' },
  backBtn:          { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFEFEF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backText:         { fontSize: 22, color: '#111827', fontWeight: '600' },
  headerTitle:      { fontSize: 24, fontWeight: '800', color: '#111827' },
  headerSub:        { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  emergencyBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 14, margin: 16, marginTop: 4, padding: 14, borderWidth: 1, borderColor: '#FECACA' },
  emergencyEmoji:   { fontSize: 26, marginRight: 10 },
  emergencyTitle:   { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
  emergencyNum:     { fontSize: 12, color: '#EF4444', marginTop: 2 },
  emergencyBtn:     { backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  emergencyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  scroll:           { paddingHorizontal: 16, paddingBottom: 40 },

  section:          { marginBottom: 10 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 },
  sectionIcon:      { fontSize: 20, marginRight: 10 },
  sectionTitle:     { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionCount:     { fontSize: 12, fontWeight: '700', marginRight: 8 },
  chevron:          { fontSize: 14, color: '#9CA3AF' },

  card:             { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginTop: 4, borderLeftWidth: 3, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 1 },
  cardMain:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardName:         { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardRole:         { fontSize: 12, color: '#6B7280', marginTop: 2 },
  availRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  availDot:         { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  availText:        { fontSize: 11, color: '#6B7280' },
  cardActions:      { marginLeft: 8 },
  callBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9 },
  callBtnText:      { color: '#FFF', fontWeight: '700', fontSize: 13 },
  cardNumbers:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numberText:       { fontSize: 13, fontWeight: '600', color: '#374151' },
  numberAlt:        { fontSize: 12, color: '#9CA3AF' },
  emailRow:         { marginTop: 6 },
  emailText:        { fontSize: 11, color: '#6366F1' },

  footer:           { alignItems: 'center', marginTop: 16 },
  footerText:       { fontSize: 11, color: '#D1D5DB', textAlign: 'center' },
});