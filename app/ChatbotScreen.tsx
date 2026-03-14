import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { askGemini } from '../src/api/gemini';

type Message = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      from: 'bot',
      text:
        "Hi, I'm your Smart Campus assistant.\n\n" +
        'You can ask about:\n' +
        '- Bus timings and routes\n' +
        '- Distance between two campus locations',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || sending) return;

    const userMsg: Message = {
      id: `${Date.now()}-u`,
      from: 'user',
      text: q,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const reply = await askGemini(q);
      const botMsg: Message = {
        id: `${Date.now()}-b`,
        from: 'bot',
        text: reply,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const botMsg: Message = {
        id: `${Date.now()}-e`,
        from: 'bot',
        text: 'Something went wrong talking to Gemini. Please try again in a moment.',
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Campus Assistant</Text>
          <Text style={styles.sub}>Ask about buses and map</Text>
        </View>
      </View>

      <ScrollView
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(m => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.from === 'user' ? styles.bubbleUser : styles.bubbleBot,
            ]}
          >
            <Text
              style={m.from === 'user' ? styles.textUser : styles.textBot}
            >
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about bus timings or distance..."
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendTxt}>{sending ? '...' : '➤'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backTxt: { fontSize: 20, fontWeight: '600', color: '#111827' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#9CA3AF' },

  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 40 },

  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  textUser: { color: '#FFFFFF', fontSize: 14 },
  textBot: { color: '#111827', fontSize: 14 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendTxt: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});

