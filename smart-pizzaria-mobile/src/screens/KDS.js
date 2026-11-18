import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import io from 'socket.io-client';
import api from '../services/api';

// O endereço base do seu Node.js (sem o /api/v1, pois o Socket.io liga-se à raiz do servidor)
const SOCKET_URL = 'http://192.168.15.8:3000';

export default function KDS() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Inicia a ligação ao Socket.io
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 2. Interceta novos pedidos em tempo real
    socket.on('novo_pedido', (pedido) => {
      // Adiciona o novo pedido no topo da lista
      setOrders((prev) => [pedido, ...prev]); 
    });

    // 3. Interceta atualizações (ex: se o status mudar)
    socket.on('cozinha_update', (pedidoAtualizado) => {
      setOrders((prev) => 
        prev.map(p => p._id === pedidoAtualizado._id ? pedidoAtualizado : p)
      );
    });

    return () => socket.disconnect();
  }, []);

  const mudarStatus = async (id, statusAtual) => {
    let novoStatus = 'Em Preparo';
    if (statusAtual === 'Recebido') novoStatus = 'Em Preparo';
    else if (statusAtual === 'Em Preparo') novoStatus = 'Saiu para Entrega';
    else if (statusAtual === 'Saiu para Entrega') novoStatus = 'Entregue';
    else return;

    try {
      // Chama a sua rota de atualização de status
      await api.patch(`/orders/${id}/status`, { status: novoStatus });
      
      // Atualiza visualmente no ecrã de forma imediata
      setOrders(prev => prev.map(p => p._id === id ? { ...p, status: novoStatus } : p));
    } catch (error) {
      console.log('Erro ao atualizar status', error);
    }
  };

  const renderPedido = ({ item }) => {
    // Pega nos últimos 4 caracteres do ID para ser o "Número do Pedido"
    const orderNumber = item._id ? item._id.substring(item._id.length - 4).toUpperCase() : 'NOVO';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Pedido #{orderNumber}</Text>
          <View style={[
            styles.statusBadge, 
            item.status === 'Recebido' ? styles.bgRed : styles.bgYellow
          ]}>
            <Text style={styles.statusText}>{item.status || 'Recebido'}</Text>
          </View>
        </View>
        
        <View style={styles.itemsList}>
          {item.itens && item.itens.map((i, index) => (
            <Text key={index} style={styles.itemText}>
              • {i.quantidade}x {i.pizza?.nome || 'Item do Cardápio'}
            </Text>
          ))}
        </View>

        {item.status !== 'Entregue' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => mudarStatus(item._id, item.status || 'Recebido')}
          >
            <Text style={styles.actionButtonText}>
              {item.status === 'Recebido' || !item.status ? 'Iniciar Preparo' : 'Avançar Status'}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cozinha (KDS)</Text>
        <View style={styles.onlineIndicator}>
          <View style={[styles.onlineDot, { backgroundColor: isConnected ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.onlineText}>{isConnected ? 'Conectado' : 'A reconectar...'}</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item._id || Math.random().toString()}
        renderItem={renderPedido}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum pedido na fila. A aguardar...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  onlineText: { fontSize: 12, color: '#374151', fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bgRed: { backgroundColor: '#fee2e2' },
  bgYellow: { backgroundColor: '#fef08a' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  itemsList: { marginBottom: 20, backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  itemText: { fontSize: 16, color: '#1f2937', marginBottom: 4, fontWeight: '500' },
  actionButton: { backgroundColor: '#ea580c', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 }
});