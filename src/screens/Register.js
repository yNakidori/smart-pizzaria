import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomInput, CustomButton } from '../components';

import api from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function Register({ navigation }) {
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const nomeTrimmed = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (!nomeTrimmed || !emailNormalizado || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (!EMAIL_REGEX.test(emailNormalizado)) {
      Alert.alert('Atenção', 'Digite um endereço de e-mail válido.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Atenção', `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);

      // Comunica com o backend real
      await api.post('/auth/register', {
        nome: nomeTrimmed,
        email: emailNormalizado,
        password
      });

      Alert.alert('Sucesso!', 'Conta criada com sucesso. Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);

    } catch (error) {
      console.log('Erro no registo:', error);
      Alert.alert(
        'Erro ao cadastrar',
        error.response?.data?.error || 'Não foi possível criar a conta. Verifique a conexão.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Preencha os seus dados para aceder ao sistema</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="NOME COMPLETO"
            placeholder="Ex: João da Silva"
            isDark={true}
            value={nome}
            onChangeText={setNome}
          />
          <CustomInput
            label="E-MAIL"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            isDark={true}
            value={email}
            onChangeText={setEmail}
          />
          <CustomInput
            label="CRIAR SENHA"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry={true}
            isDark={true}
            value={password}
            onChangeText={setPassword}
          />
          <CustomInput
            label="CONFIRMAR SENHA"
            placeholder="Repita a sua senha"
            secureTextEntry={true}
            isDark={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.buttonWrapper}>
            <CustomButton
              title="Finalizar Cadastro"
              icon="user-plus"
              color="#ea580c"
              onPress={handleRegister}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  backButton: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  content: { padding: 24, paddingBottom: 40 },
  headerTextContainer: { marginBottom: 32, marginTop: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9ca3af' },
  form: { flex: 1 },
  buttonWrapper: { marginTop: 16 }
});