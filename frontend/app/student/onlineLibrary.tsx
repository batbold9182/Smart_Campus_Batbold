import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ScreenLayout from "../../components/ScreenLayout";
import { SkeletonList } from "../../components/Skeleton";
import { searchOnlineLibrary, type LibrarySearchItem } from "../../services/studentServices/onlineLibraryService";
import { AppButton, AppInput } from "../../components/ui";

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
    <ScreenLayout title="Online Library" backRoute="/student/dashboard">

      {/* Search panel */}
      <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
        <Text className="mb-1 text-app-base font-semibold text-app-text">Search OpenLibrary</Text>
        <Text className="mb-3 text-app-sm text-app-muted">
          Find books by title, author, or topic using OpenLibrary&apos;s free catalog.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2">
            {LIBRARY_CATEGORIES.map((category) => {
              const active = selectedCategory === category.value;
              return (
                <TouchableOpacity
                  key={category.label}
                  className={`rounded-full px-3 py-2 ${active ? "bg-app-primary" : "bg-app-border-light"}`}
                  onPress={() => {
                    setSelectedCategory(category.value);
                    if (searched || query.trim()) {
                      onSearch(1, category.value);
                    }
                  }}
                >
                  <Text className={`text-app-xs font-semibold ${active ? "text-white" : "text-app-text-secondary"}`}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View className="mb-3">
          <AppInput
            placeholder="Try: algorithms, physics, psychology"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => onSearch(1)}
            returnKeyType="search"
          />
        </View>

        <AppButton title="Search Books" onPress={() => onSearch(1)} />
      </View>

      {loading ? (
        <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
          <SkeletonList rows={3} />
        </View>
      ) : null}

      {!loading && searched ? (
        <View className="mb-3 rounded-xl bg-app-surface p-4 shadow-card">
          <Text className="text-app-sm text-app-muted">
            Found {total} results, showing {results.length} on page {currentPage}
          </Text>
          <Text className="mt-1 text-app-xs text-app-placeholder">Active category: {appliedCategoryLabel}</Text>
        </View>
      ) : null}

      {!loading && searched && usedCategoryFallback ? (
        <View className="mb-3 rounded-xl border border-app-warning-bg bg-app-warning-bg p-4">
          <Text className="font-semibold text-app-warning">No results in {selectedCategoryLabel}</Text>
          <Text className="mt-1 text-app-sm text-app-warning">Showing all categories for &quot;{query.trim()}&quot;.</Text>
        </View>
      ) : null}

      {!loading && searched && results.length === 0 ? (
        <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
          <Text className="text-app-muted">No books found. Try a different keyword.</Text>
        </View>
      ) : null}

      {!loading && results.map((book) => (
        <View key={book.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow-card border border-app-border-light">
          <View className="flex-row">
            <View className="mr-3 h-[96px] w-[72px] items-center justify-center overflow-hidden rounded-app-md bg-app-bg-muted">
              {book.coverUrl ? (
                <Image source={{ uri: book.coverUrl }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <Text className="text-app-xs text-app-placeholder">No Cover</Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-app-base font-semibold text-app-text">{book.title}</Text>
              <Text className="mt-1 text-app-sm text-app-muted" numberOfLines={2}>
                {book.authors.length ? `By ${book.authors.join(", ")}` : "Author unavailable"}
              </Text>
              <Text className="mt-1 text-app-xs text-app-placeholder">
                {book.firstPublishYear ? `First published ${book.firstPublishYear}` : "Year unknown"} · {book.editionCount} editions
              </Text>

              <TouchableOpacity
                className="mt-3 self-start rounded-full bg-app-primary-light px-3 py-2"
                onPress={() => openBook(book.openLibraryUrl)}
              >
                <Text className="text-app-xs font-semibold text-app-primary-dark">Open in Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {!loading && searched && total > pageSize ? (
        <View className="mb-4 flex-row items-center justify-between gap-3">
          <AppButton
            title="Previous"
            size="sm"
            variant={currentPage > 1 ? "primary" : "outline"}
            disabled={currentPage <= 1}
            onPress={() => onSearch(currentPage - 1, appliedCategory)}
          />
          <Text className="text-app-sm text-app-muted">Page {currentPage}</Text>
          <AppButton
            title="Next"
            size="sm"
            variant={currentPage * pageSize < total ? "primary" : "outline"}
            disabled={currentPage * pageSize >= total}
            onPress={() => onSearch(currentPage + 1, appliedCategory)}
          />
        </View>
      ) : null}

      <AppButton onPress={() => router.push("/student/dashboard")}>
        Back to Dashboard
      </AppButton>
    </ScreenLayout>
  );
}
