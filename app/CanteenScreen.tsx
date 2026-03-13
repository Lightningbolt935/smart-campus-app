import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';

/* TYPES */

type MenuItem = {
  id: string;
  name: string;
  price: number;
  veg: boolean;
  category: string;
  restaurant: string;
};

type CartItem = MenuItem & { qty: number };

/* DATA */

function makeId(restaurant: string, name: string) {
  return `${restaurant}_${name}`.replace(/\s+/g, '_').toLowerCase();
}

const RAW_MENU: MenuItem[] = [
  { id: makeId("queens","Chicken Biryani (Half)"), name:"Chicken Biryani (Half)", price:90, veg:false, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Chicken Biryani (Full)"), name:"Chicken Biryani (Full)", price:150, veg:false, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Egg Biryani (Half)"), name:"Egg Biryani (Half)", price:55, veg:false, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Egg Biryani (Full)"), name:"Egg Biryani (Full)", price:90, veg:false, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Plain Biryani (Half)"), name:"Plain Biryani (Half)", price:50, veg:true, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Plain Biryani (Full)"), name:"Plain Biryani (Full)", price:80, veg:true, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Veg Biryani (Half)"), name:"Veg Biryani (Half)", price:75, veg:true, category:"Biryani", restaurant:"Queens Court"},
  { id: makeId("queens","Veg Biryani (Full)"), name:"Veg Biryani (Full)", price:110, veg:true, category:"Biryani", restaurant:"Queens Court"}
];

const RESTAURANTS = [
  { key:'All', label:'All'},
  { key:'Hros Food Plaza', label:'HR Food'},
  { key:'Queens Court', label:'Queen Food'}
];

const CATEGORIES = ['All', ...Array.from(new Set(RAW_MENU.map(i=>i.category)))];

/* CART */

function useCart(){
  const [cart,setCart] = useState<CartItem[]>([]);

  const add = (item:MenuItem)=>{
    setCart(prev=>{
      const found = prev.find(c=>c.id===item.id);
      if(found) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c);
      return [...prev,{...item,qty:1}]
    })
  }

  const remove=(id:string)=>{
    setCart(prev=>{
      const found=prev.find(c=>c.id===id);
      if(!found) return prev;
      if(found.qty===1) return prev.filter(c=>c.id!==id);
      return prev.map(c=>c.id===id?{...c,qty:c.qty-1}:c)
    })
  }

  const qty=(id:string)=>cart.find(c=>c.id===id)?.qty ?? 0;
  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const count=cart.reduce((s,c)=>s+c.qty,0);

  const clear=()=>setCart([]);

  return {cart,add,remove,qty,total,count,clear}
}

/* VEG BADGE */

function VegBadge({veg}:{veg:boolean}){
  return(
    <View style={[styles.vegBadge,{borderColor:veg?'#16A34A':'#DC2626'}]}>
      <View style={[styles.vegDot,{backgroundColor:veg?'#16A34A':'#DC2626'}]}/>
    </View>
  )
}

/* MENU CARD */

function MenuCard({item,qty,onAdd,onRemove}:{item:MenuItem;qty:number;onAdd:()=>void;onRemove:()=>void}){
  return(
    <View style={styles.menuCard}>
      <VegBadge veg={item.veg}/>
      <View style={{flex:1,marginLeft:10}}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>

      {qty===0 ? (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>ADD</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

/* SCREEN */

export default function CanteenScreen(){

  const router = useRouter();
  const {cart,add,remove,qty,total,count,clear} = useCart();

  const [restaurant,setRestaurant] = useState('All');
  const [category,setCategory] = useState('All');
  const [vegOnly,setVegOnly] = useState(false);
  const [search,setSearch] = useState('');

  const filtered = RAW_MENU.filter(item =>
    (restaurant==='All'||item.restaurant===restaurant) &&
    (category==='All'||item.category===category) &&
    (!vegOnly||item.veg) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string,MenuItem[]>>((acc,item)=>{
    if(!acc[item.category]) acc[item.category]=[];
    acc[item.category].push(item);
    return acc;
  },{})

  return(
  <View style={styles.container}>

    <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB"/>

    {/* HEADER */}

    <View style={styles.header}>
      <TouchableOpacity onPress={()=>router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={{flex:1}}>
        <Text style={styles.headerTitle}>
          {restaurant==="All"?"Food Court":restaurant}
        </Text>
        <Text style={styles.headerSub}>
          SRM KTR · {RAW_MENU.length} items
        </Text>
      </View>

      <Text style={styles.cartIcon}>🛒</Text>
    </View>

    {/* SEARCH */}

    <TextInput
      style={styles.search}
      placeholder="Search dishes..."
      value={search}
      onChangeText={setSearch}
    />

    {/* RESTAURANT TABS */}

    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>

      {RESTAURANTS.map(r=>(
        <TouchableOpacity
          key={r.key}
          onPress={()=>setRestaurant(r.key)}
          style={[styles.tab, restaurant===r.key && styles.tabActive]}>
          <Text style={[styles.tabText, restaurant===r.key && styles.tabTextActive]}>
            {r.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={()=>setVegOnly(!vegOnly)}
        style={[styles.vegToggle,vegOnly&&styles.vegToggleActive]}>

        <View style={[styles.vegDot,{backgroundColor:vegOnly?'#16A34A':'#9CA3AF',width:8,height:8}]}/>
        <Text style={styles.vegToggleText}>Veg Only</Text>

      </TouchableOpacity>

    </ScrollView>

    {/* MENU */}

    <ScrollView contentContainerStyle={styles.menuList}>

      {Object.entries(grouped).map(([cat,items])=>(
        <View key={cat}>

          <View style={styles.catHeader}>
            <Text style={styles.catTitle}>{cat}</Text>
            <Text style={styles.catCount}>{items.length} items</Text>
          </View>

          {items.map(item=>(
            <MenuCard
              key={item.id}
              item={item}
              qty={qty(item.id)}
              onAdd={()=>add(item)}
              onRemove={()=>remove(item.id)}
            />
          ))}

        </View>
      ))}

      <View style={{height:100}}/>

    </ScrollView>

  </View>
  )
}

/* STYLES */

const styles = StyleSheet.create({

container:{flex:1,backgroundColor:'#F8F9FB'},

header:{paddingTop:54,paddingHorizontal:16,paddingBottom:10,flexDirection:'row',alignItems:'center'},

backBtn:{width:36,height:36,borderRadius:10,backgroundColor:'#EFEFEF',alignItems:'center',justifyContent:'center',marginRight:12},

backText:{fontSize:22,fontWeight:'600'},

headerTitle:{fontSize:24,fontWeight:'800'},

headerSub:{fontSize:12,color:'#9CA3AF'},

cartIcon:{fontSize:26},

search:{margin:16,backgroundColor:'#FFF',borderRadius:12,padding:12,borderWidth:1,borderColor:'#E5E7EB'},

tabs:{
paddingHorizontal:16,
paddingBottom:10,
flexDirection:'row',
alignItems:'center'
},

tab:{
paddingHorizontal:18,
paddingVertical:8,
borderRadius:20,
backgroundColor:'#FFF',
borderWidth:1,
borderColor:'#E5E7EB',
marginRight:8
},

tabActive:{
backgroundColor:'#111827',
borderColor:'#111827'
},

tabText:{fontSize:13,fontWeight:'600',color:'#374151'},

tabTextActive:{color:'#FFF'},

vegToggle:{
flexDirection:'row',
alignItems:'center',
paddingHorizontal:12,
paddingVertical:7,
borderRadius:20,
borderWidth:1,
borderColor:'#E5E7EB',
backgroundColor:'#FFF'
},

vegToggleActive:{
borderColor:'#16A34A',
backgroundColor:'#F0FDF4'
},

vegToggleText:{
fontSize:13,
marginLeft:4
},

menuList:{paddingHorizontal:16},

catHeader:{flexDirection:'row',justifyContent:'space-between',marginTop:16},

catTitle:{fontSize:15,fontWeight:'700'},

catCount:{fontSize:12,color:'#9CA3AF'},

menuCard:{
flexDirection:'row',
alignItems:'center',
backgroundColor:'#FFF',
borderRadius:12,
padding:12,
marginBottom:6
},

vegBadge:{
width:16,
height:16,
borderRadius:3,
borderWidth:1.5,
alignItems:'center',
justifyContent:'center'
},

vegDot:{
width:7,
height:7,
borderRadius:4
},

itemName:{fontSize:14,fontWeight:'600'},

itemPrice:{fontSize:13,color:'#FF6B35',fontWeight:'700',marginTop:2},

addBtn:{
paddingHorizontal:16,
paddingVertical:7,
borderRadius:8,
borderWidth:1.5,
borderColor:'#FF6B35'
},

addBtnText:{color:'#FF6B35',fontWeight:'800'},

qtyRow:{flexDirection:'row',alignItems:'center'},

qtyBtn:{
width:28,
height:28,
borderRadius:8,
backgroundColor:'#FF6B35',
alignItems:'center',
justifyContent:'center'
},

qtyBtnText:{color:'#FFF',fontSize:16,fontWeight:'700'},

qtyNum:{fontSize:15,fontWeight:'700',marginHorizontal:8}

});