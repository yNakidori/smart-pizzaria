import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

export default function CartModal({ visible, onClose, cartItems, onRemoveItem, clearCart }) {
  const [loading, setLoading] = useState(false);

  // Calcula o valor total apenas para mostrar no ecrã (o backend fará a conta real)
  const total = cartItems.reduce((acc, item) => acc + Number(item.preco), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      // ⚠️ CORREÇÃO: Enviamos exatamente o que o Node.js espera: 'itens', 'pizzaId' e 'quantidade'
      const orderData = {
        itens: cartItems.map(item => ({
          pizzaId: item._id || item.id,
          quantidade: 1
        }))
      };

      // Envia o pedido para a rota /orders
      await api.post('/orders', orderData);
      
      Alert.alert('Sucesso!', 'O seu pedido foi enviado para a cozinha! 🍕');
      clearCart(); // Esvazia o carrinho visual
      onClose();   // Fecha o modal
      
    } catch (error) {
      console.log('Erro ao fechar pedido:', error);
      Alert.alert(
        'Erro', 
        error.response?.data?.error || 'Não foi possível enviar o pedido. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item, index }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemPrice}>R$ {parseFloat(item.preco).toFixed(2).replace('.', ',')}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemoveItem(index)} style={styles.removeButton}>
        <Feather name="trash-2" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Seu Pedido</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Lista de Itens */}
          <FlatList
            data={cartItems}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>O seu carrinho está vazio.</Text>
            }
          />

          {/* Rodapé com Total e Botão de Finalizar */}
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                R$ {total.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, (cartItems.length === 0 || loading) && styles.checkoutButtonDisabled]}
              disabled={cartItems.length === 0 || loading}
              onPress={handleCheckout}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.checkoutText}>Confirmar Pedido</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#f3f4f6', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  closeButton: { padding: 4 },
  listContainer: { padding: 20, flexGrow: 1 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#ea580c', fontWeight: 'bold' },
  removeButton: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 8, marginLeft: 12 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 30 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 18, color: '#6b7280' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  checkoutButton: { backgroundColor: '#ea580c', flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkoutButtonDisabled: { opacity: 0.5 },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});