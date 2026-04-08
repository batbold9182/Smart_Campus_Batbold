import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { searchOnlineLibrary, type LibrarySearchItem } from "../../services/studentServices/onlineLibraryService";

const LIBRARY_CATEGORIES = [
  { label: "All", value: "" },
  { label: "Computer Science", value: "computer_science" },
  { label: "Mathematics", value: "mathematics" },
  { label: "Physics", value: "physics" },
  { label: "Psychology", value: "psychology" },
  { label: "Business", value: "business" },
    { label: "Biology", value: "biology" },
    { label: "History", value: "history" },
    { label: "Literature", value: "literature" },
    { label: "Art", value: "art" },
    { label: "Music", value: "music" },
];


export default function OnlineLibrary() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [usedCategoryFallback, setUsedCategoryFallback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LibrarySearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const onSearch = async (page = 1, categoryOverride?: string) => {
    const cleanQuery = query.trim();
    const effectiveCategory = categoryOverride ?? selectedCategory;

    if (!cleanQuery && !effectiveCategory) {
      Alert.alert("Search required", "Type a keyword or pick a category.");
      return;
    }

    try {
      setLoading(true);
      let response = await searchOnlineLibrary(cleanQuery, page, pageSize, effectiveCategory);
      let fallbackApplied = false;
      let finalCategory = effectiveCategory;

      // If strict category filtering yields no result for a keyword search,
      // retry once without category so users still get useful matches.
      if (response.items.length === 0 && !!cleanQuery && !!effectiveCategory) {
        response = await searchOnlineLibrary(cleanQuery, page, pageSize, "");
        fallbackApplied = true;
        finalCategory = "";
      }

      setResults(response.items);
      setTotal(response.total);
      setCurrentPage(page);
      setAppliedCategory(finalCategory);
      setUsedCategoryFallback(fallbackApplied);
      setSearched(true);
    } catch (error: any) {
      Alert.alert("Search failed", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openBook = async (url: string | null) => {
    if (!url) {
      Alert.alert("Unavailable", "OpenLibrary page is not available for this result.");
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Unable to open", "Could not open this link on your device.");
      return;
    }

    await Linking.openURL(url);
  };

  const selectedCategoryLabel = LIBRARY_CATEGORIES.find((item) => item.value === selectedCategory)?.label || "All";
  const appliedCategoryLabel = LIBRARY_CATEGORIES.find((item) => item.value === appliedCategory)?.label || "All";

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-[22px] font-bold text-app-text">Online Library</Text>

        <View className="mb-4 rounded-xl bg-app-surface p-4 shadow">
          <Text className="mb-2 text-[16px] font-semibold text-app-text">Search OpenLibrary</Text>
          <Text className="mb-3 text-app-muted">
            Find books by title, author, or topic using OpenLibrary&apos;s free catalog.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-2">
              {LIBRARY_CATEGORIES.map((category) => {
                const active = selectedCategory === category.value;
                return (
                  <TouchableOpacity
                    key={category.label}
                    className={`rounded-full px-3 py-2 ${active ? "bg-blue-500" : "bg-app-border-light"}`}
                    onPress={() => {
                      setSelectedCategory(category.value);
                      if (searched || query.trim()) {
                        onSearch(1, category.value);
                      }
                    }}
                  >
                    <Text className={`text-[12px] font-semibold ${active ? "text-white" : "text-app-text-secondary"}`}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TextInput
            placeholder="Try: algorithms, physics, psychology"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => onSearch(1)}
            className="rounded-lg border border-app-border px-4 py-3 text-app-text"
            returnKeyType="search"
          />

          <TouchableOpacity className="mt-3 items-center rounded-lg bg-blue-500 p-[12px]" onPress={() => onSearch(1)}>
            <Text className="font-semibold text-white">Search Books</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="mb-4 items-center rounded-xl bg-app-surface p-6 shadow">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-3 text-app-muted">Searching library...</Text>
          </View>
        ) : null}

        {!loading && searched ? (
          <View className="mb-3 rounded-xl bg-app-surface p-4 shadow">
            <Text className="text-app-muted">Found {total} results, showing {results.length} on page {currentPage}</Text>
            <Text className="mt-1 text-[12px] text-app-placeholder">Active category: {appliedCategoryLabel}</Text>
          </View>
        ) : null}

        {!loading && searched && usedCategoryFallback ? (
          <View className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Text className="font-semibold text-amber-800">No results in {selectedCategoryLabel}</Text>
            <Text className="mt-1 text-amber-700">Showing all categories for “{query.trim()}”.</Text>
          </View>
        ) : null}

        {!loading && searched && results.length === 0 ? (
          <View className="mb-4 rounded-xl bg-app-surface p-4 shadow">
            <Text className="text-app-muted">No books found. Try a different keyword.</Text>
          </View>
        ) : null}

        {!loading && results.map((book) => (
          <View key={book.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow">
            <View className="flex-row">
              <View className="mr-3 h-[96px] w-[72px] items-center justify-center overflow-hidden rounded-md bg-app-bg-muted">
                {book.coverUrl ? (
                  <Image source={{ uri: book.coverUrl }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <Text className="text-[10px] text-app-placeholder">No Cover</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-[16px] font-semibold text-app-text">{book.title}</Text>
                <Text className="mt-1 text-app-muted" numberOfLines={2}>
                  {book.authors.length ? `By ${book.authors.join(", ")}` : "Author unavailable"}
                </Text>
                <Text className="mt-1 text-[12px] text-app-placeholder">
                  {book.firstPublishYear ? `First published ${book.firstPublishYear}` : "Year unknown"} • {book.editionCount} editions
                </Text>

                <TouchableOpacity className="mt-3 self-start rounded-full bg-app-primary-light px-3 py-2" onPress={() => openBook(book.openLibraryUrl)}>
                  <Text className="font-semibold text-app-primary-dark">Open in Library</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {!loading && searched && total > pageSize ? (
          <View className="mb-4 flex-row items-center justify-between rounded-xl bg-app-surface p-4 shadow">
            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${currentPage > 1 ? "bg-blue-500" : "bg-app-primary-muted"}`}
              disabled={currentPage <= 1}
              onPress={() => onSearch(currentPage - 1, appliedCategory)}
            >
              <Text className="font-semibold text-white">Previous</Text>
            </TouchableOpacity>

            <Text className="text-app-muted">Page {currentPage}</Text>

            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${currentPage * pageSize < total ? "bg-blue-500" : "bg-app-primary-muted"}`}
              disabled={currentPage * pageSize >= total}
              onPress={() => onSearch(currentPage + 1, appliedCategory)}
            >
              <Text className="font-semibold text-white">Next</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          className="items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/student/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
