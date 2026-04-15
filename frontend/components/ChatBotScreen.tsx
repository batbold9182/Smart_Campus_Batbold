import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import faqData from "../services/faq.json";
import { useTheme } from "../contexts/ThemeContext";
import { getChatBotStyles } from "../styles/components_style/chatBotStyles";

interface FaqEntry {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const faqs: FaqEntry[] = faqData as FaqEntry[];

const WELCOME_MESSAGE =
  "Hi! I'm your Smart Campus assistant. Ask me anything about enrollment, grades, attendance, assignments, schedules, or campus facilities.";

const NO_MATCH_MESSAGE =
  "I'm sorry, I couldn't find an answer to that question. Please try rephrasing, or contact the admin office for further assistance.";

function findAnswer(input: string): string {
  const normalised = input.toLowerCase().trim();
  if (!normalised) return NO_MATCH_MESSAGE;

  let bestMatch: FaqEntry | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;

    // Check keywords
    for (const keyword of faq.keywords) {
      if (normalised.includes(keyword.toLowerCase())) {
        score += keyword.split(" ").length; // multi-word keywords score higher
      }
    }

    // Check question words
    const qWords = faq.question.toLowerCase().split(/\s+/);
    for (const word of qWords) {
      if (word.length > 3 && normalised.includes(word)) {
        score += 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore > 0 && bestMatch ? bestMatch.answer : NO_MATCH_MESSAGE;
}

function buildSuggestions(): string[] {
  return [
    "How do I enroll in a course?",
    "How do I view my grades?",
    "What is the attendance policy?",
    "How do I submit an assignment?",
    "Where is the campus map?",
  ];
}

export default function ChatBotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", text: WELCOME_MESSAGE },
  ]);
  const [inputText, setInputText] = useState("");
  const { isDark, t, toggleTheme } = useTheme();
  const listRef = useRef<FlatList>(null);

  const s = getChatBotStyles(t, isDark);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      };
      const botMsg: Message = {
        id: `b-${Date.now() + 1}`,
        role: "bot",
        text: findAnswer(trimmed),
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    },
    []
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={isUser ? s.messageBubbleUser : s.messageBubbleBot}>
        <Text style={isUser ? s.messageTextUser : s.messageTextBot}>
          {item.text}
        </Text>
      </View>
    );
  };

  const suggestions = buildSuggestions();

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={s.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={s.headerBackText}>← Back to Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={s.themeToggle}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#facc15" : "#6b21a8"} />
            </TouchableOpacity>
          </View>
          <Text style={s.headerTitle}>Smart Campus Bot</Text>
          <Text style={s.headerSubtitle}>Ask me anything about campus</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() =>
            requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }))
          }
        />

        {/* Suggestion chips — only show when only the welcome message exists */}
        {messages.length === 1 && (
          <View style={s.suggestionsWrap}>
            <Text style={s.suggestionsLabel}>Suggested questions:</Text>
            <View style={s.suggestionsRow}>
              {suggestions.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => sendMessage(q)}
                  style={s.suggestionChip}
                >
                  <Text style={s.suggestionChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            placeholder="Type your question..."
            placeholderTextColor={t.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            style={s.sendButton}
          >
            <Text style={s.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
