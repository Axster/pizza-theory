import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { DoughParams, DoughResult } from './calculator';

export interface HistoryItem {
  id: string;
  date: string;
  params: DoughParams;
  result: DoughResult;
  notes?: string;
  isFavorite?: boolean;
}

const STORAGE_KEY = '@pizzApp_history_v1';
const IS_WEB = Platform.OS === 'web';

const safeGetItem = async (key: string): Promise<string | null> => {
  if (IS_WEB) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  if (IS_WEB) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // AsyncStorage non disponibile (es. Expo Go con versione incompatibile)
  }
};

export const Storage = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const jsonValue = await safeGetItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error fetching history', e);
      return [];
    }
  },

  async saveHistoryItem(params: DoughParams, result: DoughResult): Promise<HistoryItem> {
    const history = await this.getHistory();
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      params,
      result,
      isFavorite: false,
    };
    let newHistory = [newItem, ...history];
    
    // Logic per limitare ai soli 30 impasti recenti (salvo i vecchi preferiti)
    newHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const newest30 = newHistory.slice(0, 30);
    const olderItems = newHistory.slice(30);
    const olderFavorites = olderItems.filter(item => item.isFavorite);
    
    newHistory = [...newest30, ...olderFavorites];

    try {
      await safeSetItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving history item', e);
    }
    return newItem;
  },

  async toggleFavorite(id: string): Promise<void> {
    const history = await this.getHistory();
    let updatedHistory = history.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    
    // Cleanup if a favorite was toggled off and it's beyond the 30 mark
    updatedHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const newest30 = updatedHistory.slice(0, 30);
    const olderItems = updatedHistory.slice(30);
    const olderFavorites = olderItems.filter(item => item.isFavorite);
    
    updatedHistory = [...newest30, ...olderFavorites];

    try {
      await safeSetItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  },

  async updateHistoryNote(id: string, notes: string): Promise<void> {
    const history = await this.getHistory();
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, notes } : item
    );
    try {
      await safeSetItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Error updating note', e);
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const history = await this.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    try {
      await safeSetItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Error deleting history item', e);
    }
  }
};
