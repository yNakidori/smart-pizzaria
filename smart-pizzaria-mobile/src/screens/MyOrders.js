import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = 'http://192.168.15.8:3000';

export default function MyOrders({ navigation }) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;

    async function fetchOrdersAndConnectSocket() {
      try {
        // 1. Recupera o ID do utilizador logado
        const userData = await AsyncStorage.getItem('@SmartPizzaria:user');
        let userId = null;
        
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.id || user._id;

          // 2. Conecta ao Socket.io para escutar atualizações exclusivas deste cliente
          socket = io(SOCKET_URL);
          
          socket.on(`status_update_${userId}`, (data) => {
            // Quando a cozinha atualiza, mudamos o status na lista instantaneamente
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order._id === data.orderId ? { ...order, status: data.status } : order
              )
            );
          });
        }

        // 3. Busca o histórico de pedidos (ATENÇÃO: ajuste '/orders/me' se a sua rota no backend tiver outro nome)
        const response = await api.get('/orders');
        setOrders(response.data);

      } catch (error) {
        console.log('Erro ao carregar os meus pedidos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrdersAndConnectSocket();

    // Limpa a conexão do Socket ao sair do ecrã
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Recebido': return { bg: '#fee2e2', text: '#ef4444', icon: 'clipboard' };
      case 'Em Preparo': return { bg: '#fef08a', text: '#ca8a04', icon: 'clock' };
      case 'Saiu para Entrega': return { bg: '#dbeafe', text: '#3b82f6', icon: 'truck' };
      case 'Entregue': return { bg: '#dcfce3', text: '#22c55e', icon: 'check-circle' };
      default: return { bg: '#f3f4f6', text: '#6b7280', icon: 'info' };
    }
  };

  const renderOrderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status || 'Recebido');
    const orderNumber = item._id ? item._id.substring(item._id.length - 4).toUpperCase() : 'NOVO';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Pedido #{orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Feather name={statusStyle.icon} size={12} color={statusStyle.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status || 'Recebido'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.itens && item.itens.map((i, index) => (
            <Text key={index} style={styles.itemText}>
              <Text style={{ fontWeight: 'bold' }}>{i.quantidade}x</Text> {i.pizza?.nome || 'Pizza'}
            </Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {new Date(item.dataCriacao || Date.now()).toLocaleDateString('pt-BR')} às {new Date(item.dataCriacao || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.totalText}>
            R$ {parseFloat(item.total).toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="receipt-text-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Ainda não fez nenhum pedido.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  backButton: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  itemsList: { marginBottom: 16 },
  itemText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  dateText: { fontSize: 12, color: '#6b7280' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#ea580c' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#6b7280', marginTop: 16, fontSize: 16 }
});