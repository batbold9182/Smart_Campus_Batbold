import api from "../config/clientAPI";

export type LibrarySearchItem = {
  id: string;
  title: string;
  authors: string[];
  firstPublishYear: number | null;
  editionCount: number;
  languages: string[];
  coverUrl: string | null;
  openLibraryUrl: string | null;
};

export type LibrarySearchResponse = {
  query: string;
  category: string;
  page: number;
  limit: number;
  total: number;
  items: LibrarySearchItem[];
};

export const searchOnlineLibrary = async (query: string, page = 1, limit = 12, category = "") => {
  const response = await api.get<LibrarySearchResponse>("/api/library/search", {
    params: { q: query, page, limit, category },
  });

  return response.data;
};