import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchNewsStart, 
  fetchNewsSuccess, 
  fetchNewsFailure,
  FetchNewsParams 
} from '../slices/newsSlice';

const API_KEY = 'f0168210985c4dd5b78b63fb6db9d577';
const BASE_URL = 'https://newsapi.org/v2';

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
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
    console.warn("FULL URL->",url);
    const response: Response = yield call(fetch, url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: NewsResponse = yield call([response, 'json']);
    
    yield put(fetchNewsSuccess({
      articles: data.articles,
      totalResults: data.totalResults,
      page,
      hasMore: data.articles.length === 20 && page * 20 < data.totalResults
    }));
  } catch (error: any) {
    yield put(fetchNewsFailure(error.message || 'Failed to fetch news'));
  }
}

export function* watchFetchNews() {
  yield takeLatest(fetchNewsStart.type, fetchNewsApi);
}