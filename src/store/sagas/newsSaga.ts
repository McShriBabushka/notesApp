import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchNewsStart,
  fetchNewsSuccess,
  fetchNewsFailure,
  FetchNewsParams
} from '../slices/newsSlice';

const API_KEY = '9ea3766d973b4ac994e15da2a6825daf';
const BASE_URL = 'https://newsapi.org/v2';

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
  message?: string; // message field for error responses
}

interface NewsArticle {
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

function* fetchNewsApi(action: PayloadAction<FetchNewsParams>) {
  try {
    const { from, to, page = 1 } = action.payload;
    
    let url = `${BASE_URL}/everything?apiKey=${API_KEY}&domains=techcrunch.com&page=${page}&pageSize=20`;
    
    if (from) {
      url += `&from=${from}`;
    }
    if (to) {
      url += `&to=${to}`;
    }
    
    console.warn("FULL URL->", url);
    const response: Response = yield call(fetch, url);
    
    // Handle rate limiting specifically
    if (response.status === 429) {
      yield put(fetchNewsFailure('Rate limit exceeded. Please try again later.'));
      return;
    }
    
    if (!response.ok) {
      // Handle other HTTP errors
      if (response.status === 401) {
        yield put(fetchNewsFailure('API key error. Please check your configuration.'));
      } else if (response.status === 403) {
        yield put(fetchNewsFailure('Access forbidden. Your API key may not have the required permissions.'));
      } else if (response.status >= 400 && response.status < 500) {
        yield put(fetchNewsFailure('Client error occurred. Please check your request.'));
      } else if (response.status >= 500) {
        yield put(fetchNewsFailure('Server error occurred. Please try again later.'));
      } else {
        yield put(fetchNewsFailure(`HTTP error! status: ${response.status}`));
      }
      return;
    }
    
    const data: NewsResponse = yield call([response, 'json']);
    
    yield put(fetchNewsSuccess({
      articles: data.articles,
      totalResults: data.totalResults,
      page,
      hasMore: data.articles.length === 20 && page * 20 < data.totalResults
    }));
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      yield put(fetchNewsFailure('Network error. Please check your connection.'));
    } else {
      yield put(fetchNewsFailure(error.message || 'Failed to fetch news'));
    }
  }
}

export function* watchFetchNews() {
  yield takeLatest(fetchNewsStart.type, fetchNewsApi);
}