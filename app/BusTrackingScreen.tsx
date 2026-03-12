import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BusRoute, busRoutes } from '../src/data/busRoutes';

// ── Helpers ────────────────────────────────────────────────────────────────

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function fmt(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function nowMin() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function getBusInfo(route: BusRoute) {
  const now = nowMin();
  const first = toMin(route.stops[0].time);
  const arrival = toMin(route.campusArrival);

  if (now < first) {
    return { status: 'Scheduled', color: '#6B7A8D', progress: 0, currentStop: route.stops[0].stop, nextStop: route.stops[1]?.stop ?? 'SRM KTR Campus', eta: arrival - now, minsToDepart: first - now };
  }
  if (now >= arrival) {
    return { status: 'Arrived', color: '#16A34A', progress: 1, currentStop: 'SRM KTR Campus', nextStop: null, eta: 0, minsToDepart: null };
  }
  for (let i = 0; i < route.stops.length - 1; i++) {
    const a = toMin(route.stops[i].time);
    const b = toMin(route.stops[i + 1].time);
    if (now >= a && now < b) {
      const seg = (now - a) / (b - a);
      return { status: 'En Route', color: '#16A34A', progress: (i + seg) / route.stops.length, currentStop: route.stops[i].stop, nextStop: route.stops[i + 1].stop, eta: arrival - now, minsToDepart: null };
    }
  }
  return { status: 'En Route', color: '#16A34A', progress: 0.9, currentStop: route.stops[route.stops.length - 1].stop, nextStop: 'SRM KTR Campus', eta: arrival - now, minsToDepart: null };
}

// all unique stop names
const ALL_STOPS = Array.from(new Set(busRoutes.flatMap(r => r.stops.map(s => s.stop)))).sort();

// ── Stop Picker Modal ──────────────────────────────────────────────────────

function StopPicker({ visible, onClose, onSelect, title }: {
  visible: boolean; onClose: () => void; onSelect: (s: string) => void; title: string;
}) {
  const [q, setQ] = useState('');
  const filtered = ALL_STOPS.filter(s => s.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
        </View>
        <TextInput
          style={styles.modalSearch}
          placeholder="Search stop..."
          placeholderTextColor="#9CA3AF"
          value={q}
          onChangeText={setQ}
          autoFocus
        />
        <FlatList
          data={filtered}
          keyExtractor={s => s}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.stopItem} onPress={() => { onSelect(item); onClose(); setQ(''); }}>
              <Text style={styles.stopItemDot}>○</Text>
              <Text style={styles.stopItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

// ── Route Card (result) ────────────────────────────────────────────────────

function RouteCard({ route, onPress }: { route: BusRoute; onPress: () => void }) {
  const info = getBusInfo(route);
  return (
    <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.resultTop}>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{route.route_no}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultName}>{route.route_name}</Text>
          <Text style={styles.resultMeta}>{route.stops.length} stops · arrives {fmt(route.campusArrival)}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: info.color + '22', borderColor: info.color + '55' }]}>
          <View style={[styles.statusDot, { backgroundColor: info.color }]} />
          <Text style={[styles.statusPillText, { color: info.color }]}>{info.status}</Text>
        </View>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.round(info.progress * 100)}%` as any }]} />
      </View>
      <View style={styles.resultBottom}>
        <Text style={styles.resultEtaLabel}>📍 {info.currentStop}</Text>
        {info.eta > 0 && <Text style={styles.resultEta}>{info.eta} min to campus</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ── Route Detail ───────────────────────────────────────────────────────────

function RouteDetail({ route, onBack }: { route: BusRoute; onBack: () => void }) {
  const info = getBusInfo(route);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const now = nowMin();

  useEffect(() => {
    if (info.status === 'En Route') {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])).start();
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.detailBack}>
          <Text style={styles.detailBackText}>‹ Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.detailRouteNo}>Route {route.route_no}</Text>
          <Text style={styles.detailRouteName}>{route.route_name}</Text>
        </View>
      </View>

      {/* Status card */}
      <View style={styles.detailCard}>
        <View style={styles.detailCardTop}>
          <Animated.View style={[styles.pulseDot, { backgroundColor: info.color, transform: [{ scale: pulseAnim }] }]} />
          <Text style={[styles.detailStatus, { color: info.color }]}>{info.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.detailCurrent}>{info.status === 'Arrived' ? ' SRM KTR Campus' : `📍 ${info.currentStop}`}</Text>
        {info.nextStop && info.status !== 'Arrived' && (
          <Text style={styles.detailNext}>Next → {info.nextStop}</Text>
        )}
        <View style={[styles.progressBg, { marginVertical: 12 }]}>
          <View style={[styles.progressFill, { width: `${Math.round(info.progress * 100)}%` as any }]} />
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Departs</Text>
            <Text style={styles.timeVal}>{fmt(route.stops[0].time)}</Text>
          </View>
          <View style={styles.timeLine} />
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Arrives Campus</Text>
            <Text style={styles.timeVal}>{fmt(route.campusArrival)}</Text>
          </View>
          {info.eta > 0 && <>
            <View style={styles.timeLine} />
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>ETA</Text>
              <Text style={[styles.timeVal, { color: info.color }]}>{info.eta} min</Text>
            </View>
          </>}
        </View>
      </View>

      <Text style={styles.stopsLabel}>ALL STOPS</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {route.stops.map((s, i) => {
          const isPast = nowMin() > toMin(s.time) && info.status !== 'Scheduled';
          const isCurrent = info.currentStop === s.stop && info.status === 'En Route';
          return (
            <View key={i} style={styles.stopRow}>
              <View style={styles.timeline}>
                <View style={[styles.stopCircle,
                isCurrent && { backgroundColor: '#16A34A', borderColor: '#16A34A' },
                isPast && !isCurrent && { backgroundColor: '#D1D5DB', borderColor: '#D1D5DB' },
                ]} />
                {i < route.stops.length - 1 && <View style={[styles.stopLine, isPast && { backgroundColor: '#D1D5DB' }]} />}
              </View>
              <View style={styles.stopContent}>
                <Text style={[styles.stopName, isCurrent && { color: '#16A34A', fontWeight: '700' }, isPast && !isCurrent && { color: '#9CA3AF' }]}>
                  {isCurrent ? '📍 ' : ''}{s.stop}
                </Text>
                <Text style={[styles.stopTime, isPast && !isCurrent && { color: '#D1D5DB' }]}>{fmt(s.time)}</Text>
              </View>
            </View>
          );
        })}
        <View style={styles.stopRow}>
          <View style={styles.timeline}>
            <View style={[styles.stopCircle, { backgroundColor: '#16A34A', borderColor: '#16A34A' }]} />
          </View>
          <View style={styles.stopContent}>
            <Text style={[styles.stopName, { color: '#16A34A', fontWeight: '700' }]}> SRM KTR Campus</Text>
            <Text style={styles.stopTime}>{fmt(route.campusArrival)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function BusTrackingScreen() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('SRM KTR Campus');
  const [fromModal, setFromModal] = useState(false);
  const [toModal, setToModal] = useState(false);
  const [results, setResults] = useState<BusRoute[] | null>(null);
  const [selected, setSelected] = useState<BusRoute | null>(null);
  const [routeQuery, setRouteQuery] = useState('');

  const findBuses = () => {
    if (!from) return;
    const matched = busRoutes.filter(r =>
      r.stops.some(s => s.stop.toLowerCase() === from.toLowerCase())
    );
    setResults(matched);
  };

  const routeResults = routeQuery
    ? busRoutes.filter(r =>
      r.route_no.toLowerCase().includes(routeQuery.toLowerCase()) ||
      r.route_name.toLowerCase().includes(routeQuery.toLowerCase())
    )
    : [];

  if (selected) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        <RouteDetail route={selected} onBack={() => setSelected(null)} />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navBack}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Bus Tracker</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* FROM / TO card */}
        <View style={styles.searchCard}>
          {/* From */}
          <TouchableOpacity style={styles.stationRow} onPress={() => setFromModal(true)}>
            <View style={styles.stationIcon}><View style={styles.stationCircle} /></View>
            <Text style={[styles.stationText, !from && { color: '#9CA3AF' }]}>{from || 'From Stop'}</Text>
            {from ? <TouchableOpacity onPress={() => { setFrom(''); setResults(null); }}><Text style={styles.clearX}>✕</Text></TouchableOpacity> : null}
          </TouchableOpacity>

          {/* dotted connector + swap */}
          <View style={styles.connectorRow}>
            <View style={styles.connector}>
              <View style={styles.connectorLine} />
            </View>
            <TouchableOpacity style={styles.swapBtn} onPress={() => { const t = from; setFrom(to === 'SRM KTR Campus' ? '' : to); setTo(from || 'SRM KTR Campus'); setResults(null); }}>
              <Text style={styles.swapIcon}>⇅</Text>
            </TouchableOpacity>
          </View>

          {/* To */}
          <TouchableOpacity style={styles.stationRow} onPress={() => setToModal(true)}>
            <View style={styles.stationIcon}><View style={styles.stationCircle} /></View>
            <Text style={[styles.stationText, !to && { color: '#9CA3AF' }]}>{to || 'To Stop'}</Text>
            {to ? <TouchableOpacity onPress={() => setTo('')}><Text style={styles.clearX}>✕</Text></TouchableOpacity> : null}
          </TouchableOpacity>

          <TouchableOpacity style={styles.findBtn} onPress={findBuses}>
            <Text style={styles.findBtnText}>Find Buses</Text>
          </TouchableOpacity>
        </View>

        {/* Search by Route No */}
        <View style={styles.altCard}>
          <Text style={styles.altIcon}>🚌</Text>
          <TextInput
            style={styles.altInput}
            placeholder="Route No. / Route Name"
            placeholderTextColor="#9CA3AF"
            value={routeQuery}
            onChangeText={setRouteQuery}
          />
          <TouchableOpacity style={styles.altBtn}>
            <Text style={styles.altBtnIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Route search results */}
        {routeQuery !== '' && routeResults.map(r => (
          <RouteCard key={r.route_no} route={r} onPress={() => setSelected(r)} />
        ))}

        {/* From/To results */}
        {results !== null && (
          <>
            <Text style={styles.resultsLabel}>
              {results.length === 0 ? 'No buses found from this stop' : `${results.length} bus${results.length > 1 ? 'es' : ''} from ${from}`}
            </Text>
            {results.map(r => <RouteCard key={r.route_no} route={r} onPress={() => setSelected(r)} />)}
          </>
        )}

        {/* All routes when nothing searched */}
        {results === null && routeQuery === '' && (
          <>
            <Text style={styles.resultsLabel}>All Routes</Text>
            {busRoutes.map(r => <RouteCard key={r.route_no} route={r} onPress={() => setSelected(r)} />)}
          </>
        )}
      </ScrollView>

      <StopPicker visible={fromModal} title="Select From Stop" onClose={() => setFromModal(false)} onSelect={s => { setFrom(s); setResults(null); }} />
      <StopPicker visible={toModal} title="Select To Stop" onClose={() => setToModal(false)} onSelect={s => setTo(s)} />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const GREEN = '#16A34A';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 16, paddingBottom: 40 },

  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F3F4F6' },
  navBack: { color: GREEN, fontSize: 16, fontWeight: '600', width: 60 },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  // Search card
  searchCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
  stationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  stationIcon: { width: 28, alignItems: 'center' },
  stationCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#6B7A8D' },
  stationText: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },
  clearX: { color: '#9CA3AF', fontSize: 18, paddingHorizontal: 8 },
  connectorRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 14 },
  connector: { flex: 1 },
  connectorLine: { borderLeftWidth: 1.5, borderLeftColor: '#D1D5DB', borderStyle: 'dashed', height: 20, marginLeft: 6 },
  swapBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  swapIcon: { fontSize: 18, color: GREEN, fontWeight: '700' },
  findBtn: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  findBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // Alt search
  altCard: { backgroundColor: '#FFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  altIcon: { fontSize: 22, marginRight: 10 },
  altInput: { flex: 1, fontSize: 15, color: '#111827' },
  altBtn: { backgroundColor: GREEN, width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  altBtnIcon: { fontSize: 18 },

  resultsLabel: { fontSize: 12, fontWeight: '700', color: '#6B7A8D', letterSpacing: 1, marginBottom: 8, marginTop: 4 },

  // Route result card
  resultCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  resultTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultBadge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginRight: 10 },
  resultBadgeText: { color: GREEN, fontWeight: '800', fontSize: 13 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  resultMeta: { fontSize: 12, color: '#6B7A8D', marginTop: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  progressBg: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: GREEN, borderRadius: 3 },
  resultBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  resultEtaLabel: { fontSize: 12, color: '#6B7A8D' },
  resultEta: { fontSize: 12, color: GREEN, fontWeight: '600' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 52 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 20, color: '#6B7A8D' },
  modalSearch: { marginHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 15, color: '#111827', marginBottom: 8 },
  stopItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  stopItemDot: { color: '#9CA3AF', marginRight: 12, fontSize: 14 },
  stopItemText: { fontSize: 15, color: '#111827' },

  // Detail
  detailHeader: { backgroundColor: '#FFF', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailBack: { marginBottom: 8 },
  detailBackText: { color: GREEN, fontSize: 15, fontWeight: '600' },
  detailRouteNo: { fontSize: 12, color: '#6B7A8D', fontWeight: '600' },
  detailRouteName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  detailCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
  detailCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  detailStatus: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  detailCurrent: { fontSize: 18, fontWeight: '700', color: '#111827' },
  detailNext: { fontSize: 13, color: '#6B7A8D', marginTop: 2 },
  timeRow: { flexDirection: 'row' },
  timeBox: { flex: 1, alignItems: 'center' },
  timeLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 3 },
  timeVal: { fontSize: 13, fontWeight: '700', color: '#111827' },
  timeLine: { width: 1, backgroundColor: '#E5E7EB' },
  stopsLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, marginLeft: 20, marginBottom: 4 },
  stopRow: { flexDirection: 'row', paddingHorizontal: 20, minHeight: 50 },
  timeline: { width: 28, alignItems: 'center' },
  stopCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF', backgroundColor: '#FFF', marginTop: 6 },
  stopLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 2 },
  stopContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2, paddingBottom: 10 },
  stopName: { fontSize: 14, color: '#374151', flex: 1, marginRight: 8 },
  stopTime: { fontSize: 13, color: '#6B7A8D', fontWeight: '600' },
});