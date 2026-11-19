import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function ChatModal({ visible, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Olá! Sou a IA da pizzaria. Posso tirar dúvidas ou sugerir sabores! 🍕',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsgText = inputText.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
    };

    // Adiciona a mensagem do usuário na tela
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Envia a mensagem para a rota do backend (/chat)
      const response = await api.post('/chat', { message: userMsgText });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.data.reply || response.data.resposta || response.data.message || 'Desculpe, não entendi.',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.log('Erro no chat:', error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Ops! Ocorreu um erro ao consultar o Garçom IA. Tente novamente.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Cabeçalho do Chat */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <View style={styles.onlineDot} />
              <MaterialCommunityIcons name="robot-outline" size={22} color="#ffffff" />
              <Text style={styles.headerText}>Garçom IA</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Histórico de Mensagens */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Indicador de carregamento */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ea580c" />
              <Text style={styles.loadingText}>Garçom IA está digitando...</Text>
            </View>
          )}

          {/* Campo de Entrada de Texto */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua dúvida..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.6 }]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              <Feather name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '75%', paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f2937', paddingHorizontal: 20, paddingVertical: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  headerTitle: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginLeft: 8 },
  closeButton: { padding: 4 },
  chatContainer: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  aiBubble: { backgroundColor: '#1f2937', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#ea580c', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  aiText: { color: '#f3f4f6' },
  userText: { color: '#ffffff' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  loadingText: { fontSize: 12, color: '#9ca3af', marginLeft: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  input: { flex: 1, backgroundColor: '#1f2937', color: '#ffffff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, marginRight: 8 },
  sendButton: { backgroundColor: '#ea580c', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});