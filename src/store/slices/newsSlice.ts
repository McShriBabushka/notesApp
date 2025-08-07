import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NewsArticle {
  source: {
    id: string;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export interface FetchNewsParams {
  from?: string;
  to?: string;
  page?: number;
}

interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  hasMore: boolean;
  filters: {
    from?: string;
    to?: string;
  };
}

const initialState: NewsState = {
  articles: [],
  loading: false,
  error: null,
  totalResults: 0,
  currentPage: 1,
  hasMore: false,
  filters: {},
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    fetchNewsStart: (state, action: PayloadAction<FetchNewsParams>) => {
      const { from, to, page = 1 } = action.payload;
      
      if (page === 1) {
        state.articles = [];
      }
      
      state.loading = true;
      state.error = null;
      state.currentPage = page;
      state.filters = { from, to };
    },
    fetchNewsSuccess: (state, action: PayloadAction<{
      articles: NewsArticle[];
      totalResults: number;
      page: number;
      hasMore: boolean;
    }>) => {
      const { articles, totalResults, page, hasMore } = action.payload;
      
      if (page === 1) {
        state.articles = articles;
      } else {
        state.articles = [...state.articles, ...articles];
      }
      
      state.loading = false;
      state.totalResults = totalResults;
      state.currentPage = page;
      state.hasMore = hasMore;
    },
    fetchNewsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearNews: (state) => {
      state.articles = [];
      state.totalResults = 0;
      state.currentPage = 1;
      state.hasMore = false;
    },
    loadMoreNews: (state) => {
      //This shoudl trigger fetchNewsStart with incremented page
    },
  },
});

export const {
  fetchNewsStart,
  fetchNewsSuccess,
  fetchNewsFailure,
  clearNews,
  loadMoreNews,
} = newsSlice.actions;

export default newsSlice.reducer;