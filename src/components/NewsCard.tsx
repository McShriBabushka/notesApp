import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import type { NewsArticle } from '../store/slices/newsSlice';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const handlePress = async () => {
    try {
      await Linking.openURL(article.url);
    } catch (error) {
      console.log('Error opening URL:', error);}
    };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={handlePress}
    >
      {article.urlToImage && (
        <Image
          source={{ uri: article.urlToImage }}
          style={{
            width: '100%',
            height: 200,
            backgroundColor: '#f0f0f0'
          }}
          resizeMode="cover"
        />
      )}
      
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: 8,
          lineHeight: 22
        }}>
          {article.title}
        </Text>

        {article.description && (
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 8,
            lineHeight: 20
          }}>
            {truncateText(article.description)}
          </Text>
        )}

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8
        }}>
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
            fontWeight: '500'
          }}>
            {article.author || article.source.name}
          </Text>
          
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF'
          }}>
            {formatDate(article.publishedAt)}
          </Text>
        </View>

        <View style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        }}>
          <Text style={{
            fontSize: 12,
            color: '#3B82F6',
            fontWeight: '600'
          }}>
            Tap to read full article →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}