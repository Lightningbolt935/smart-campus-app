import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

type Category = 'academic' | 'lab' | 'facility' | 'food' | 'hostel' | 'sports' | 'gate';

type Block = {
  id: string;
  name: string;
  short: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
};

const BLOCKS: Block[] = [
  { id: 'main_gate', name: 'Main Campus Gate',                    short: 'GATE',   category: 'gate',     lat: 12.821172, lng: 80.037893, description: 'Main entrance from GST Road' },
  { id: 'arch_gate', name: 'Arch Gate',                           short: 'ARCH G', category: 'gate',     lat: 12.822998, lng: 80.041261, description: 'Iconic arch entrance gate' },
  { id: 'tp1',       name: 'Tech Park Tower I',                   short: 'TP-I',   category: 'academic', lat: 12.824760, lng: 80.045193, description: 'CSE, IT & Computing Depts' },
  { id: 'tp2',       name: 'Tech Park Tower II',                  short: 'TP-II',  category: 'academic', lat: 12.824595, lng: 80.045874, description: 'ECE, EEE Departments' },
  { id: 'ub',        name: 'University Building',                  short: 'UB',     category: 'academic', lat: 12.823594, lng: 80.042616, description: 'Academic, VC & Registrar offices' },
  { id: 'crc',       name: 'Class Room Complex',                  short: 'CRC',    category: 'academic', lat: 12.820402, lng: 80.037989, description: 'Lecture halls & classrooms' },
  { id: 'civil',     name: 'Civil Engineering Block',             short: 'CIVIL',  category: 'academic', lat: 12.820171, lng: 80.038536, description: 'Civil & Structural Engg' },
  { id: 'auto',      name: 'Automobile Engineering Block',        short: 'AUTO',   category: 'academic', lat: 12.820309, lng: 80.039336, description: 'Automobile Engineering' },
  { id: 'arch',      name: 'School of Architecture & Interior',   short: 'ARCH',   category: 'academic', lat: 12.824106, lng: 80.044202, description: 'Architecture & Interior Design' },
  { id: 'mbo',       name: 'Faculty of Management (MBO)',         short: 'MBA',    category: 'academic', lat: 12.823708, lng: 80.044223, description: 'MBA & Management Studies' },
  { id: 'mca',       name: 'Mechanical Block A',                  short: 'MC-A',   category: 'academic', lat: 12.820521, lng: 80.039156, description: 'Mechanical Engg Block A' },
  { id: 'mhg',       name: 'Mechanical Hangar',                   short: 'M-HGR',  category: 'lab',      lat: 12.820528, lng: 80.040002, description: 'Heavy machinery & workshop' },
  { id: 'hitech',    name: 'Hi-Tech Block',                       short: 'HITECH', category: 'lab',      lat: 12.820995, lng: 80.038911, description: 'Advanced computing & R&D labs' },
  { id: 'bel',       name: 'Basic Engineering Lab',               short: 'BEL',    category: 'lab',      lat: 12.823165, lng: 80.043492, description: 'First year engineering labs' },
  { id: 'fab',       name: 'Fab Lab',                             short: 'FAB',    category: 'lab',      lat: 12.822390, lng: 80.045563, description: 'Fabrication & prototyping lab' },
  { id: 'cvr',       name: 'Sir C.V. Raman Research Park',        short: 'CVR',    category: 'lab',      lat: 12.824925, lng: 80.044418, description: 'Innovation & research park' },
  { id: 'tpg',       name: 'Dr. T.P. Ganesan Auditorium',        short: 'AUDIT',  category: 'facility', lat: 12.824436, lng: 80.046502, description: 'Main campus auditorium' },
  { id: 'vfs',       name: 'Vendhar Food Street',                 short: 'VFS',    category: 'food',     lat: 12.823776, lng: 80.045528, description: 'Campus food street' },
  { id: 'java',      name: 'Java Canteen',                        short: 'JAVA',   category: 'food',     lat: 12.823081, lng: 80.044580, description: 'Popular campus cafe' },
  { id: 'aqc',       name: 'Aquatic Complex',                     short: 'POOL',   category: 'sports',   lat: 12.825128, lng: 80.050677, description: 'Olympic swimming pool' },
  { id: 'dhyan',     name: 'Dhyan Chand Indoor Stadium',          short: 'STAD',   category: 'sports',   lat: 12.825056, lng: 80.048836, description: 'Main indoor stadium' },
];

const CAMPUS_CENTER = { latitude: 12.82250, longitude: 80.04420 };

const CAT_COLOR: Record<Category, string> = {
  academic: '#6366F1',
  lab:      '#0EA5E9',
  facility: '#10B981',
  food:     '#FF6B35',
  hostel:   '#EC4899',
  sports:   '#8B5CF6',
  gate:     '#374151',
};

const CAT_ICON: Record<Category, string> = {
  academic: '🏫',
  lab:      '🔬',
  facility: '🏢',
  food:     '🍽️',
  hostel:   '🏠',
  sports:   '⚽',
  gate:     '🚪',
};

const CATEGORIES: { key: Category | 'all'; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'academic', label: '🏫 Academic' },
  { key: 'lab',      label: '🔬 Labs' },
  { key: 'food',     label: '🍽️ Food' },
  { key: 'sports',   label: '⚽ Sports' },
  { key: 'facility', label: '🏢 Facility' },
  { key: 'gate',     label: '🚪 Gates' },
];

function haversine(la1: number, lo1: number, la2: number, lo2: number) {
  const R = 6371000, r = Math.PI / 180;
  const dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const fmtDist = (m: number) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(2)}km`;
const fmtWalk = (m: number) => { const min = Math.round(m / 80); return min < 1 ? '<1 min' : `~${min} min`; };

export default function CampusMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<Block | null>(null);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheet] = useState(false);
  const [cat, setCat] = useState<Category | 'all'>('all');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const openSheet = (v: boolean) => {
    setSheet(v);
    Animated.spring(sheetAnim, { toValue: v ? 1 : 0, useNativeDriver: true, friction: 9 }).start();
  };

  const pick = (b: Block) => {
    setSelected(b);
    openSheet(false);
    mapRef.current?.animateToRegion({ latitude: b.lat, longitude: b.lng, latitudeDelta: 0.004, longitudeDelta: 0.004 }, 600);
  };

  const filtered = BLOCKS.filter(b =>
    (cat === 'all' || b.category === cat) &&
    (b.name.toLowerCase().includes(search.toLowerCase()) || b.short.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (!userLoc) return 0;
    return haversine(userLoc.lat, userLoc.lng, a.lat, a.lng) - haversine(userLoc.lat, userLoc.lng, b.lat, b.lng);
  });

  const dist = selected && userLoc ? haversine(userLoc.lat, userLoc.lng, selected.lat, selected.lng) : null;
  const sheetY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={s.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ ...CAMPUS_CENTER, latitudeDelta: 0.010, longitudeDelta: 0.010 }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings
      >
        {BLOCKS.map(b => (
          <Marker key={b.id} coordinate={{ latitude: b.lat, longitude: b.lng }} onPress={() => pick(b)}>
            <View style={[s.pin, { backgroundColor: CAT_COLOR[b.category], borderWidth: selected?.id === b.id ? 2.5 : 0, borderColor: '#FFF' }]}>
              <Text style={s.pinText} numberOfLines={1}>{b.short}</Text>
            </View>
          </Marker>
        ))}

        {selected && userLoc && (
          <Polyline
            coordinates={[{ latitude: userLoc.lat, longitude: userLoc.lng }, { latitude: selected.lat, longitude: selected.lng }]}
            strokeColor={CAT_COLOR[selected.category]}
            strokeWidth={2.5}
            lineDashPattern={[8, 5]}
          />
        )}
      </MapView>

      {/* TOP BAR */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.topBtn} onPress={() => router.back()}>
          <Text style={s.topBtnTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.topCenter}>
          <Text style={s.topTitle}>Campus Map</Text>
          <Text style={s.topSub}>SRM Kattankulathur</Text>
        </View>
        <TouchableOpacity style={s.topBtn} onPress={() => userLoc && mapRef.current?.animateToRegion({ latitude: userLoc.lat, longitude: userLoc.lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500)}>
          <Text style={s.topBtnTxt}>◎</Text>
        </TouchableOpacity>
      </View>

      {/* SELECTED CARD */}
      {selected && !sheetOpen && (
        <View style={[s.card, { borderTopColor: CAT_COLOR[selected.category] }]}>
          <View style={s.cardTop}>
            <View style={[s.cardIcon, { backgroundColor: CAT_COLOR[selected.category] + '18' }]}>
              <Text style={{ fontSize: 24 }}>{CAT_ICON[selected.category]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{selected.name}</Text>
              <Text style={s.cardDesc}>{selected.description}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)} style={s.cardClose}>
              <Text style={s.cardCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={s.cardStats}>
            {dist !== null ? (
              <>
                <View style={s.statBox}>
                  <Text style={s.statVal}>{fmtDist(dist)}</Text>
                  <Text style={s.statLbl}>Distance</Text>
                </View>
                <View style={s.statLine} />
                <View style={s.statBox}>
                  <Text style={s.statVal}>{fmtWalk(dist)}</Text>
                  <Text style={s.statLbl}>Walk time</Text>
                </View>
                <View style={s.statLine} />
              </>
            ) : (
              <View style={[s.statBox, { flex: 2 }]}>
                <Text style={s.statLbl}>Turn on location for distance</Text>
              </View>
            )}
            <TouchableOpacity
              style={[s.dirBtn, { backgroundColor: CAT_COLOR[selected.category] }]}
              onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=walking`)}
            >
              <Text style={s.dirBtnTxt}>Go ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SHEET TOGGLE */}
      {!selected && (
        <TouchableOpacity style={s.toggle} onPress={() => openSheet(!sheetOpen)}>
          <Text style={s.toggleTxt}>{sheetOpen ? '↓  Close' : '↑  All Buildings'}</Text>
        </TouchableOpacity>
      )}

      {/* BOTTOM SHEET */}
      {sheetOpen && (
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View style={s.sheetHandle} />
          <TextInput
            style={s.sheetSearch}
            placeholder="Search building or block..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCat(c.key as any)}
                style={[s.chip, cat === c.key && { backgroundColor: c.key === 'all' ? '#111827' : CAT_COLOR[c.key as Category], borderColor: 'transparent' }]}
              >
                <Text style={[s.chipTxt, cat === c.key && { color: '#FFF' }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.sheetCount}>{filtered.length} locations{userLoc ? ' · sorted by distance' : ''}</Text>

          <ScrollView contentContainerStyle={s.blockList} showsVerticalScrollIndicator={false}>
            {filtered.map(b => {
              const d = userLoc ? haversine(userLoc.lat, userLoc.lng, b.lat, b.lng) : null;
              return (
                <TouchableOpacity key={b.id} style={s.blockRow} onPress={() => pick(b)}>
                  {/* ── FIX: badge uses auto height + text wraps ── */}
                  <View style={[s.blockBadge, { backgroundColor: CAT_COLOR[b.category] + '18' }]}>
                    <Text
                      style={[s.blockShort, { color: CAT_COLOR[b.category] }]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {b.short}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.blockName}>{b.name}</Text>
                    <Text style={s.blockDesc}>{b.description}</Text>
                  </View>
                  {d !== null && (
                    <View style={s.blockDistBox}>
                      <Text style={s.blockDist}>{fmtDist(d)}</Text>
                      <Text style={s.blockWalk}>{fmtWalk(d)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 50, paddingBottom: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)' },
  topBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  topBtnTxt: { fontSize: 20, color: '#111827', fontWeight: '600' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  topSub: { fontSize: 11, color: '#9CA3AF' },

  pin: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3, elevation: 4 },
  pinText: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -3 }, shadowRadius: 10, elevation: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardDesc: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  cardClose: { padding: 6 },
  cardCloseTxt: { color: '#9CA3AF', fontSize: 18 },
  cardStats: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 17, fontWeight: '700', color: '#111827' },
  statLbl: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statLine: { width: 1, height: 34, backgroundColor: '#E5E7EB' },
  dirBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, marginLeft: 12 },
  dirBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  toggle: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 25 },
  toggleTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '65%', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12, elevation: 12 },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetSearch: { margin: 14, marginBottom: 8, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827' },
  filterRow: { paddingHorizontal: 14, gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  chipTxt: { fontSize: 13, color: '#374151', fontWeight: '500' },
  sheetCount: { fontSize: 11, color: '#9CA3AF', paddingHorizontal: 16, marginBottom: 6 },

  blockList: { paddingHorizontal: 14, paddingBottom: 40 },
  blockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },

  // ── FIX: minHeight instead of fixed height, padding instead of fixed size ──
  blockBadge: {
    width: 46,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  blockShort: {
    fontSize: 11,        // slightly smaller than before (was 10 but no adjustsFontSizeToFit)
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,      // tight line height so 2-line shorts don't blow up the row
  },

  blockName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  blockDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  blockDistBox: { alignItems: 'flex-end' },
  blockDist: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  blockWalk: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
});