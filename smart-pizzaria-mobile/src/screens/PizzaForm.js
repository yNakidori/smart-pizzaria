import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { CustomInput, CustomButton } from '../components';

export default function PizzaForm({ navigation, route }) {
  const insets = useSafeAreaInsets();
  
  // Verifica se recebemos uma pizza para editar (através do Dashboard)
  const pizzaToEdit = route.params?.pizzaToEdit;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('tradicional');
  const [loading, setLoading] = useState(false);

  // Se houver uma pizza para editar, preenchemos os campos automaticamente
  useEffect(() => {
    if (pizzaToEdit) {
      setNome(pizzaToEdit.nome || '');
      setDescricao(pizzaToEdit.descricao || pizzaToEdit.ingredientes || '');
      setPreco(pizzaToEdit.preco ? String(pizzaToEdit.preco).replace('.', ',') : '');
      setCategoria(pizzaToEdit.categoria || 'tradicional');
    }
  }, [pizzaToEdit]);

  const handleSave = async () => {
    if (!nome || !descricao || !preco) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios (Nome, Descrição e Preço).');
      return;
    }

    const precoFormatado = parseFloat(preco.replace(',', '.'));
    
    if (isNaN(precoFormatado)) {
      Alert.alert('Atenção', 'Digite um preço válido (ex: 45,90).');
      return;
    }

    const payload = {
      nome,
      descricao,
      preco: precoFormatado,
      categoria: categoria.toLowerCase()
    };

    try {
      setLoading(true);
      
      if (pizzaToEdit) {
        // Atualiza pizza existente
        await api.put(`/pizzas/${pizzaToEdit._id || pizzaToEdit.id}`, payload);
        Alert.alert('Sucesso', 'Pizza atualizada com sucesso!');
      } else {
        // Cria nova pizza
        await api.post('/pizzas', payload);
        Alert.alert('Sucesso', 'Nova pizza adicionada ao cardápio!');
      }
      
      navigation.goBack();
      
    } catch (error) {
      console.log('Erro ao salvar pizza:', error);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível guardar a pizza.');
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir a pizza
  const handleDelete = () => {
    Alert.alert(
      'Excluir Pizza',
      `Tem certeza de que deseja excluir a pizza "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/pizzas/${pizzaToEdit._id || pizzaToEdit.id}`);
              Alert.alert('Sucesso', 'Pizza removida com sucesso!');
              navigation.goBack();
            } catch (error) {
              console.log('Erro ao excluir pizza:', error);
              Alert.alert('Erro', error.response?.data?.error || 'Não foi possível excluir a pizza.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Cabeçalho Escuro */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {pizzaToEdit ? 'Editar Pizza' : 'Nova Pizza'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Formulário Claro */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.formContainer}>
          <CustomInput
            label="NOME DA PIZZA *"
            placeholder="Ex: Calabresa Especial"
            value={nome}
            onChangeText={setNome}
          />

          <CustomInput
            label="INGREDIENTES / DESCRIÇÃO *"
            placeholder="Ex: Molho, mussarela, calabresa e cebola"
            multiline={true}
            numberOfLines={3}
            value={descricao}
            onChangeText={setDescricao}
          />

          <CustomInput
            label="PREÇO (R$) *"
            placeholder="Ex: 45,90"
            keyboardType="numeric"
            value={preco}
            onChangeText={setPreco}
          />

          {/* Seleção de Categoria */}
          <Text style={styles.label}>CATEGORIA</Text>
          <View style={styles.categoryContainer}>
            {['tradicional', 'especial', 'doce'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton, 
                  categoria === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[
                  styles.categoryText, 
                  categoria === cat && styles.categoryTextActive
                ]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonWrapper}>
            <CustomButton
              title={pizzaToEdit ? "Salvar Alterações" : "Cadastrar Pizza"}
              icon="check"
              color="#10b981"
              onPress={handleSave}
              loading={loading}
            />

            {/* Botão de Excluir (exibido apenas ao editar) */}
            {pizzaToEdit && (
              <View style={{ marginTop: 12 }}>
                <CustomButton
                  title="Excluir Pizza"
                  icon="trash-2"
                  color="#ef4444"
                  onPress={handleDelete}
                  loading={loading}
                />
              </View>
            )}
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 24, backgroundColor: '#111827', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  content: { padding: 24, paddingBottom: 40 },
  formContainer: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 8, letterSpacing: 0.5, marginTop: 4 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  categoryButton: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, marginHorizontal: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  categoryButtonActive: { backgroundColor: '#ffedd5', borderColor: '#ea580c' },
  categoryText: { fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  categoryTextActive: { color: '#ea580c' },
  buttonWrapper: { marginTop: 8 }
});