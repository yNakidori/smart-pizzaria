import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function Dashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0 });
  
  // Guardamos TODAS as pizzas e criamos um estado para expandir a lista
  const [allPizzas, setAllPizzas] = useState([]);
  const [showAllPizzas, setShowAllPizzas] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          const userData = await AsyncStorage.getItem('@SmartPizzaria:user');
          if (userData) setUser(JSON.parse(userData));

          const responseOrders = await api.get('/orders');
          const orders = responseOrders.data || [];
          const totalSales = orders.reduce((acc, order) => acc + (order.total || 0), 0);
          
          setStats({
            totalOrders: orders.length,
            totalSales: totalSales,
          });

          const responsePizzas = await api.get('/pizzas');
          const pizzas = responsePizzas.data.pizzas || responsePizzas.data || [];
          
          // Invertemos a lista para as pizzas mais recentes aparecerem primeiro
          setAllPizzas(pizzas.reverse());

        } catch (error) {
          console.log('Erro ao carregar dados do Dashboard:', error);
        }
      }
      loadData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Encerrar Sessão',
      'Tem a certeza de que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@SmartPizzaria:token');
              await AsyncStorage.removeItem('@SmartPizzaria:user');
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
            }
          }
        }
      ]
    );
  };

  // Define quantas pizzas aparecem com base no clique do botão
  const pizzasToDisplay = showAllPizzas ? allPizzas : allPizzas.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={[styles.darkHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.topRow}>
          <View style={styles.logoStatusContainer}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="pizza" size={24} color="#f97316" />
            </View>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.brandSmart}>Smart </Text>
                <Text style={styles.brandAdmin}>{user?.role === 'admin' ? 'Admin' : 'Equipa'}</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>LOJA ABERTA</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.bellButton}>
              <Feather name="bell" size={20} color="#9ca3af" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.avatarButton} onPress={handleLogout}>
              <Text style={styles.avatarText}>
                {user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'AD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Olá, {user?.nome || 'Gestor'}</Text>
            <Text style={styles.pageSubtitle}>Resumo financeiro & operacional</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PizzaForm')}
          >
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>Nova Pizza</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MÉTRICAS GLOBAIS</Text>
          <Text style={styles.sectionUpdate}>Em tempo real</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardFull, { borderLeftColor: '#22c55e' }]}>
          <View>
            <Text style={styles.kpiLabel}>FATURAMENTO TOTAL</Text>
            <Text style={styles.kpiValue}>R$ {stats.totalSales.toFixed(2).replace('.', ',')}</Text>
          </View>
          <Text style={styles.kpiEmoji}>💰</Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, styles.kpiCardHalf, { borderLeftColor: '#3b82f6' }]}>
            <View style={styles.kpiHalfHeader}>
              <Text style={styles.kpiLabel}>PEDIDOS</Text>
              <Text style={styles.kpiEmojiSmall}>📋</Text>
            </View>
            <Text style={styles.kpiValue}>{stats.totalOrders}</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiCardHalf, { borderLeftColor: '#f97316' }]}>
            <View style={styles.kpiHalfHeader}>
              <Text style={styles.kpiLabel}>TICKET MÉDIO</Text>
              <Text style={styles.kpiEmojiSmall}>🎯</Text>
            </View>
            <Text style={styles.kpiValue}>
              R$ {stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2).replace('.', ',') : '0,00'}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>CARDÁPIO ({allPizzas.length})</Text>
          <TouchableOpacity onPress={() => setShowAllPizzas(!showAllPizzas)}>
            <Text style={styles.linkText}>
              {showAllPizzas ? 'Ver menos' : 'Ver todos'}
            </Text>
          </TouchableOpacity>
        </View>

        {pizzasToDisplay.map((item) => (
          <View key={item._id || item.id} style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <MaterialCommunityIcons name="pizza" size={24} color="#ea580c" />
            </View>
            
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.nome}</Text>
              <View style={styles.menuDetails}>
                <Text style={styles.menuPrice}>R$ {parseFloat(item.preco).toFixed(2).replace('.', ',')}</Text>
                <View style={styles.dotSeparator} />
                <Text style={[styles.menuStatus, styles.statusActive]}>
                  {item.categoria ? item.categoria.toUpperCase() : 'TRADICIONAL'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.menuAction}
              onPress={() => navigation.navigate('PizzaForm', { pizzaToEdit: item })}
            >
              <Feather name="edit-2" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  darkHeader: { backgroundColor: '#111827', paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  logoStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { backgroundColor: '#1f2937', padding: 8, borderRadius: 12, marginRight: 12 },
  brandRow: { flexDirection: 'row' },
  brandSmart: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  brandAdmin: { color: '#f97316', fontSize: 18, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
  statusText: { color: '#22c55e', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  profileActions: { flexDirection: 'row', alignItems: 'center' },
  bellButton: { marginRight: 16, position: 'relative' },
  notificationDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#111827' },
  avatarButton: { backgroundColor: '#374151', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  pageSubtitle: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#4b5563', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  sectionUpdate: { color: '#9ca3af', fontSize: 12 },
  linkText: { color: '#f97316', fontSize: 13, fontWeight: 'bold' },
  kpiCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  kpiCardFull: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kpiCardHalf: { width: '48%' },
  kpiHalfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kpiLabel: { color: '#6b7280', fontSize: 11, fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.5 },
  kpiValue: { color: '#1f2937', fontSize: 24, fontWeight: '900' },
  kpiEmoji: { fontSize: 32 },
  kpiEmojiSmall: { fontSize: 18 },
  menuItem: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  menuIconBg: { backgroundColor: '#fff7ed', width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuInfo: { flex: 1 },
  menuName: { color: '#1f2937', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  menuDetails: { flexDirection: 'row', alignItems: 'center' },
  menuPrice: { color: '#059669', fontSize: 14, fontWeight: 'bold' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', marginHorizontal: 8 },
  menuStatus: { fontSize: 13, fontWeight: '600' },
  statusActive: { color: '#2563eb' },
  statusPaused: { color: '#9ca3af' },
  menuAction: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 8 }
});