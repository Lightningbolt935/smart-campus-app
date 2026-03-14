import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BLOCKS, Block, Category } from '../src/data/blocks';

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
  const [selected, setSelected] = useState<Block | null>(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const filtered = useMemo(() => {
    return BLOCKS.filter(b =>
      (cat === 'all' || b.category === cat) &&
      (b.name.toLowerCase().includes(search.toLowerCase()) || b.short.toLowerCase().includes(search.toLowerCase()))
    );
  }, [cat, search]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.topBar}>
        <TouchableOpacity style={s.topBtn} onPress={() => router.back()}>
          <Text style={s.topBtnTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.topCenter}>
          <Text style={s.topTitle}>Campus Map</Text>
          <Text style={s.topSub}>Web view</Text>
        </View>
        <View style={s.topBtn} />
      </View>

      <View style={s.webCard}>
        <Text style={s.webTitle}>Map view isn’t available on web</Text>
        <Text style={s.webSub}>
          Open Campus Map on Android/iOS to use the interactive map. On web, you
          can still search locations below.
        </Text>
      </View>

      <View style={s.sheetWeb}>
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

        <Text style={s.sheetCount}>{filtered.length} locations</Text>

        <ScrollView contentContainerStyle={s.blockList} showsVerticalScrollIndicator={false}>
          {filtered.map(b => (
            <TouchableOpacity key={b.id} style={s.blockRow} onPress={() => setSelected(b)}>
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selected && (
        <View style={[s.card, { borderTopColor: CAT_COLOR[selected.category] }]}>
          <View style={s.cardTop}>
            <View style={[s.cardIcon, { backgroundColor: CAT_COLOR[selected.category] + '18' }]}>
              <Text style={{ fontSize: 24 }}>{CAT_ICON[selected.category]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{selected.name}</Text>
              <Text style={s.cardDesc}>{selected.description}</Text>
              <Text style={s.cardDesc}>
                Coords: {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)} style={s.cardClose}>
              <Text style={s.cardCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  webCard: { marginTop: 110, marginHorizontal: 14, backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  webTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  webSub: { fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 16 },

  sheetWeb: { flex: 1, marginTop: 12 },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 50, paddingBottom: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)' },
  topBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  topBtnTxt: { fontSize: 20, color: '#111827', fontWeight: '600' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  topSub: { fontSize: 11, color: '#9CA3AF' },

  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -3 }, shadowRadius: 10, elevation: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardDesc: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  cardClose: { padding: 6 },
  cardCloseTxt: { color: '#9CA3AF', fontSize: 18 },
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