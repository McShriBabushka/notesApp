import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchNewsStart, loadMoreNews, clearError, resetRateLimit } from '../store/slices/newsSlice';
import NewsCard from '../components/NewsCard';
import type { NewsArticle } from '../store/slices/newsSlice';

export default function NewsScreen() {
  const dispatch = useAppDispatch();
  const { articles, loading, error, hasMore, filters, isRateLimited } = useAppSelector((state) => state.news);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'from' | 'to'>('from');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Auto-clear rate limit error after 1 minute
  useEffect(() => {
    if (isRateLimited) {
      const timer = setTimeout(() => {
        dispatch(resetRateLimit());
      }, 60000); // 1 minute

      return () => clearTimeout(timer);
    }
  }, [isRateLimited, dispatch]);

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString();
  };

  const handleDateConfirm = (date: Date) => {
    if (datePickerType === 'from') {
      setFromDate(date);
    } else {
      setToDate(date);
    }
    setShowDatePicker(false);
  };

  const handleFetchNews = () => {
    if (fromDate && toDate && fromDate > toDate) {
      Alert.alert('Invalid Date Range', 'From date cannot be after To date');
      return;
    }

    // Client-side validation for date range (past month limit)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (fromDate && fromDate < oneMonthAgo) {
      Alert.alert(
        'Date Not Allowed', 
        'Free accounts can only access articles from the past month. Please select a date from the last 30 days.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (toDate && toDate < oneMonthAgo) {
      Alert.alert(
        'Date Not Allowed', 
        'Free accounts can only access articles from the past month. Please select a date from the last 30 days.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Clear any existing errors
    dispatch(clearError());

    dispatch(fetchNewsStart({
      from: fromDate ? formatDateForAPI(fromDate) : undefined,
      to: toDate ? formatDateForAPI(toDate) : undefined,
      page: 1,
    }));
  };

  const handleLoadMore = useCallback(() => {
    // Don't load more if rate limited or already loading
    if (!loading && hasMore && !isRateLimited) {
      dispatch(fetchNewsStart({
        from: filters.from,
        to: filters.to,
        page: Math.floor(articles.length / 20) + 1,
      }));
    }
  }, [loading, hasMore, articles.length, filters, dispatch, isRateLimited]);

  const handleRefresh = useCallback(() => {
    // Allow refresh even if rate limited (it's a fresh search)
    dispatch(clearError());
    dispatch(fetchNewsStart({
      from: filters.from,
      to: filters.to,
      page: 1,
    }));
  }, [filters, dispatch]);

  const handleRetryAfterRateLimit = () => {
    dispatch(resetRateLimit());
    dispatch(clearError());
  };

  const renderNewsItem = ({ item }: { item: NewsArticle }) => (
    <NewsCard article={item} />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && articles.length === 0) return null;
    
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100
      }}>
        <Text style={{
          fontSize: 18,
          color: 'white',
          fontWeight: '600',
          marginBottom: 12
        }}>
          No news articles found
        </Text>
        <Text style={{
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center'
        }}>
          Try adjusting your date filters and search again
        </Text>
      </View>
    );
  };

  const renderRateLimitError = () => {
    if (!error || !error.toLowerCase().includes('rate limit')) return null;

    return (
      <View style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)'
      }}>
        <Text style={{ 
          color: '#EF4444', 
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8
        }}>
          Too Many Requests
        </Text>
        <Text style={{ 
          color: '#EF4444', 
          fontSize: 14,
          marginBottom: 12,
          lineHeight: 20
        }}>
          You've reached the API rate limit. Please wait a moment before trying again.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#EF4444',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignSelf: 'flex-start'
          }}
          onPress={handleRetryAfterRateLimit}
        >
          <Text style={{
            color: 'white',
            fontSize: 14,
            fontWeight: '600'
          }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGeneralError = () => {
    if (!error || error.toLowerCase().includes('rate limit')) return null;

    return (
      <View style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
      }}>
        <Text style={{ color: '#EF4444', fontSize: 14 }}>
          {error}
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 16
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16
          }}>BBC News</Text>

          {/* Date Filters */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12
            }}>Date Filter</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 12,
                  borderRadius: 8,
                  flex: 0.45
                }}
                onPress={() => {
                  setDatePickerType('from');
                  setShowDatePicker(true);
                }}
                disabled={isRateLimited}
              >
                <Text style={{ color: 'white', fontSize: 12, marginBottom: 4 }}>From</Text>
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {fromDate ? formatDateForDisplay(fromDate) : 'Select Date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 12,
                  borderRadius: 8,
                  flex: 0.45
                }}
                onPress={() => {
                  setDatePickerType('to');
                  setShowDatePicker(true);
                }}
                disabled={isRateLimited}
              >
                <Text style={{ color: 'white', fontSize: 12, marginBottom: 4 }}>To</Text>
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {toDate ? formatDateForDisplay(toDate) : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: isRateLimited ? 'rgba(156, 163, 175, 0.5)' : '#3B82F6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={handleFetchNews}
              disabled={loading || isRateLimited}
            >
              <Text style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 16
              }}>
                {loading && articles.length === 0 ? 'Loading...' : 
                 isRateLimited ? 'Rate Limited' : 'Search News'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Messages */}
          {renderRateLimitError()}
          {renderGeneralError()}
        </View>

        {/* News List */}
        <FlatList
          data={articles}
          renderItem={renderNewsItem}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={loading && articles.length > 0}
              onRefresh={handleRefresh}
              tintColor="white"
            />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate height of each item
            offset: 200 * index,
            index,
          })}
        />

        {/* Date Picker Modal */}
        <DatePicker
          modal
          open={showDatePicker}
          date={datePickerType === 'from' ? (fromDate || new Date()) : (toDate || new Date())}
          mode="date"
          maximumDate={new Date()}
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}