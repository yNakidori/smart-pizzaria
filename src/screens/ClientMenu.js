import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import ChatModal from '../components/ChatModal';
import CartModal from '../components/CartModal';

export default function ClientMenu({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  
  // Estados do Carrinho
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    async function loadPizzas() {
      try {
        const response = await api.get('/pizzas');
        setPizzas(response.data.pizzas || response.data);
      } catch (error) {
        console.log('Erro ao carregar pizzas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPizzas();
  }, []);

  // Função ativada ao clicar no botão "Adicionar"
  const addToCart = (pizza) => {
    setCart(prev => [...prev, pizza]);
    Alert.alert('Adicionado!', `${pizza.nome} foi para o seu carrinho.`, [{ text: 'OK' }]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const renderPizzaCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pizzaName}>{item.nome}</Text>
        {item.categoria && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.categoria.toUpperCase()}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.pizzaDescription} numberOfLines={2}>
        {item.descricao || item.ingredientes}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.price}>
          R$ {parseFloat(item.preco).toFixed(2).replace('.', ',')}
        </Text>
        {/* Botão que agora envia a pizza para o carrinho */}
        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Feather name="book-open" size={24} color="#ea580c" />
          <Text style={styles.headerTitle}>Cardápio</Text>
        </View>
        
        {/* Ícones de Navegação do Cabeçalho */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          {/* Ícone dos Meus Pedidos */}
          <TouchableOpacity 
            style={{ marginRight: 20 }} 
            onPress={() => navigation.navigate('MyOrders')}
          >
            <Feather name="list" size={24} color="#374151" />
          </TouchableOpacity>

          {/* Ícone do Carrinho original */}
          <TouchableOpacity style={styles.cartIcon} onPress={() => setCartVisible(true)}>
            <Feather name="shopping-cart" size={24} color="#374151" />
            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={pizzas}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderPizzaCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma pizza cadastrada ainda.</Text>}
        />
      )}

      {/* Botão do Chat */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]} 
        activeOpacity={0.8}
        onPress={() => setChatVisible(true)}
      >
        <MaterialCommunityIcons name="robot-outline" size={28} color="#fff" />
      </TouchableOpacity>

      <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} />
      
      <CartModal 
        visible={cartVisible} 
        onClose={() => setCartVisible(false)} 
        cartItems={cart}
        onRemoveItem={removeFromCart}
        clearCart={() => setCart([])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 },
  cartIcon: { padding: 4, position: 'relative' },
  badge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  pizzaName: { fontSize: 18, fontWeight: 'bold', color: '#111827', flex: 1 },
  tagContainer: { backgroundColor: '#ffedd5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, marginLeft: 8 },
  tagText: { fontSize: 10, fontWeight: 'bold', color: '#ea580c' },
  pizzaDescription: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ea580c', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#ffffff', fontWeight: 'bold', marginLeft: 4, fontSize: 14 },
  fab: { position: 'absolute', right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#ea580c', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 }
});