import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomInput, CustomButton } from '../components';

// 1. Importamos a nossa API configurada com o Axios
import api from '../services/api';

export default function Login({ navigation }) {
  const insets = useSafeAreaInsets();
  
  // 2. Estados para guardar o e-mail, a senha e o estado de carregamento
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. Função que comunica com o seu backend Node.js
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha o seu e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      
      // Envia os dados para a sua API
      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const { token, user } = response.data;

      // Guarda o token e os dados no telemóvel
      await AsyncStorage.setItem('@SmartPizzaria:token', token);
      await AsyncStorage.setItem('@SmartPizzaria:user', JSON.stringify(user));

      // Redireciona com base no "role" (admin/garcom vai para o painel)
     // Redireciona com base no "role"
      if (user.role === 'admin' || user.role === 'garcom') {
        navigation.replace('AppTabs'); 
      } else {
        // Agora redireciona para a tela do cardápio!
        navigation.replace('ClientMenu');
      }

    } catch (error) {
      console.log('Erro no login:', error);
      Alert.alert(
        'Erro ao entrar', 
        error.response?.data?.error || 'Não foi possível conectar ao servidor. Verifique se o Node.js está rodando e o IP está correto.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <View style={styles.header}>
          <View style={styles.logoBg}>
            <MaterialCommunityIcons name="pizza" size={48} color="#ea580c" />
          </View>
          <Text style={styles.title}>Smart <Text style={styles.titleHighlight}>Pizzaria</Text></Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="E-MAIL"
            placeholder="seu@email.com"
            keyboardType="email-address"
            isDark={true}
            value={email}
            onChangeText={setEmail}
          />
          <CustomInput
            label="SENHA"
            placeholder="••••••••"
            secureTextEntry={true}
            isDark={true}
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title="Entrar"
            icon="log-in"
            color="#ea580c"
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Cadastre-se grátis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  content: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoBg: { backgroundColor: '#1f2937', padding: 16, borderRadius: 24, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  titleHighlight: { color: '#ea580c' },
  subtitle: { fontSize: 16, color: '#9ca3af', marginTop: 8 },
  form: { marginBottom: 32 },
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotPasswordText: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  footerText: { color: '#9ca3af', fontSize: 15 },
  footerLink: { color: '#ea580c', fontSize: 15, fontWeight: 'bold' }
});