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
} from "react-native";
import { useRouter } from "expo-router";
import faqData from "../services/faq.json";

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
  const listRef = useRef<FlatList>(null);

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
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    []
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        className={`my-1 max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "self-end rounded-br-sm bg-blue-500"
            : "self-start rounded-bl-sm bg-white border border-gray-200"
        }`}
      >
        <Text className={`text-[15px] leading-5 ${isUser ? "text-white" : "text-gray-800"}`}>
          {item.text}
        </Text>
      </View>
    );
  };

  const suggestions = buildSuggestions();

  return (
    <SafeAreaView className="flex-1 bg-[#f0f4f8]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View className="bg-blue-600 px-4 py-4 shadow-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-2 flex-row items-center"
          >
            <Text className="text-blue-200 text-[13px]">← Back to Dashboard</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Smart Campus Bot</Text>
          <Text className="text-blue-100 text-[13px]">Ask me anything about campus</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Suggestion chips — only show when only the welcome message exists */}
        {messages.length === 1 && (
          <View className="px-4 pb-2">
            <Text className="text-[12px] text-gray-500 mb-2">Suggested questions:</Text>
            <View className="flex-row flex-wrap gap-2">
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => sendMessage(s)}
                  className="rounded-full border border-blue-400 bg-white px-3 py-1"
                >
                  <Text className="text-blue-600 text-[12px]">{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View className="flex-row items-center bg-white border-t border-gray-200 px-3 py-2">
          <TextInput
            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-[15px] text-gray-800"
            placeholder="Type your question..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-blue-500"
          >
            <Text className="font-bold text-white text-lg">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
