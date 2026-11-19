import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export function CustomInput({ label, placeholder, keyboardType, multiline, numberOfLines, secureTextEntry, isDark, value, onChangeText, autoCapitalize }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      
      {/* As propriedades value e onChangeText são obrigatórias para o React Native ler o que foi escrito */}
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          isDark && styles.inputDark
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines || 1}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize || 'none'}
      />
    </View>
  );
}

export function CustomButton({ title, icon, color, onPress, loading }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color || '#ea580c', opacity: loading ? 0.7 : 1 }]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
    >
      {icon && !loading && <Feather name={icon} size={20} color="#ffffff" />}
      <Text style={styles.buttonText}>{loading ? 'Aguarde...' : title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 8, letterSpacing: 0.5 },
  labelDark: { color: '#9ca3af' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: '#1f2937', minHeight: 48 },
  inputDark: { backgroundColor: '#1f2937', borderColor: '#374151', color: '#ffffff' },
  textArea: { paddingTop: 12, textAlignVertical: 'top', minHeight: 100 },
  button: { flexDirection: 'row', height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});