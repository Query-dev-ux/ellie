import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import type { 
  DocumentData,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { db, analytics } from '../firebase/config';
import { useTelegram } from './useTelegram';
import { logEvent } from 'firebase/analytics';

interface FirestoreError {
  code: string;
  message: string;
}

export const useFirestore = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const { user, urlParams } = useTelegram();

  // Логирование событий в Firebase Analytics
  const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (analytics && typeof window !== 'undefined') {
      try {
        logEvent(analytics, eventName, {
          user_id: user?.id?.toString(),
          username: user?.username,
          country: urlParams?.country || user?.country,
          device: urlParams?.device || user?.device,
          source: urlParams?.source || user?.source || 'direct',
          ...eventParams
        });
      } catch (err) {
        console.error('Failed to log analytics event:', err);
      }
    }
  };

  /**
   * Получить документ по ID
   */
  const getDocument = async <T = DocumentData>(
    collectionName: string, 
    docId: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      setLoading(false);
      
      logAnalyticsEvent('get_document', { 
        collection: collectionName, 
        doc_id: docId,
        exists: docSnap.exists()
      });

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (err: any) {
      setLoading(false);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Произошла ошибка при получении документа'
      });
      
      logAnalyticsEvent('error', { 
        operation: 'get_document',
        collection: collectionName,
        doc_id: docId,
        error_message: err.message
      });
      
      return null;
    }
  };

  /**
   * Получить все документы из коллекции
   */
  const getCollection = async <T = DocumentData>(
    collectionName: string,
    conditions?: {
      field: string;
      operator: '==' | '<' | '<=' | '>' | '>=' | '!=';
      value: any;
    }[],
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
  ): Promise<T[]> => {
    setLoading(true);
    setError(null);

    try {
      const collectionRef = collection(db, collectionName);
      
      // Построение запроса с условиями
      let q = collectionRef;
      
      if (conditions && conditions.length > 0) {
        q = query(
          collectionRef, 
          ...conditions.map(cond => where(cond.field, cond.operator, cond.value))
        ) as CollectionReference<DocumentData>;
      }
      
      // Добавление сортировки
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection || 'asc')) as CollectionReference<DocumentData>;
      }
      
      // Добавление лимита
      if (limitCount) {
        q = query(q, limit(limitCount)) as CollectionReference<DocumentData>;
      }
      
      const querySnapshot = await getDocs(q);
      
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });

      setLoading(false);
      
      logAnalyticsEvent('get_collection', { 
        collection: collectionName, 
        result_count: documents.length,
        has_conditions: !!conditions
      });
      
      return documents;
    } catch (err: any) {
      setLoading(false);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Произошла ошибка при получении коллекции'
      });
      
      logAnalyticsEvent('error', { 
        operation: 'get_collection',
        collection: collectionName,
        error_message: err.message
      });
      
      return [];
    }
  };

  /**
   * Добавить документ с автоматическим ID
   */
  const addDocument = async <T = DocumentData>(
    collectionName: string, 
    data: T
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Добавляем метаданные о пользователе и времени создания
      const enhancedData = {
        ...data,
        createdAt: new Date().toISOString(),
        userId: user?.id?.toString() || null,
        username: user?.username || null,
        country: urlParams?.country || user?.country,
        device: urlParams?.device || user?.device,
        source: urlParams?.source || user?.source || 'direct'
      };

      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, enhancedData);
      
      setLoading(false);
      
      logAnalyticsEvent('add_document', { 
        collection: collectionName, 
        doc_id: docRef.id
      });
      
      return docRef.id;
    } catch (err: any) {
      setLoading(false);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Произошла ошибка при добавлении документа'
      });
      
      logAnalyticsEvent('error', { 
        operation: 'add_document',
        collection: collectionName,
        error_message: err.message
      });
      
      return null;
    }
  };

  /**
   * Установить документ с указанным ID
   */
  const setDocument = async <T = DocumentData>(
    collectionName: string, 
    docId: string, 
    data: T
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Добавляем метаданные о пользователе и времени изменения
      const enhancedData = {
        ...data,
        updatedAt: new Date().toISOString(),
        userId: user?.id?.toString() || null,
        username: user?.username || null,
        country: urlParams?.country || user?.country,
        device: urlParams?.device || user?.device,
        source: urlParams?.source || user?.source || 'direct'
      };

      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, enhancedData);
      
      setLoading(false);
      
      logAnalyticsEvent('set_document', { 
        collection: collectionName, 
        doc_id: docId
      });
      
      return true;
    } catch (err: any) {
      setLoading(false);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Произошла ошибка при установке документа'
      });
      
      logAnalyticsEvent('error', { 
        operation: 'set_document',
        collection: collectionName,
        doc_id: docId,
        error_message: err.message
      });
      
      return false;
    }
  };

  /**
   * Обновить существующий документ
   */
  const updateDocument = async (
    collectionName: string, 
    docId: string, 
    data: Partial<DocumentData>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Добавляем метаданные о времени обновления
      const enhancedData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id?.toString() || null
      };

      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, enhancedData);
      
      setLoading(false);
      
      logAnalyticsEvent('update_document', { 
        collection: collectionName, 
        doc_id: docId
      });
      
      return true;
    } catch (err: any) {
      setLoading(false);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Произошла ошибка при обновлении документа'
      });
      
      logAnalyticsEvent('error', { 
        operation: 'update_document',
        collection: collectionName,
        doc_id: docId,
        error_message: err.message
      });
      
      return false;
    }
  };

  /**
   * Удалить документ
   */
  const deleteDocument = async (
    collectionName: string, 
    docId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      
      setLoading(false);
      
      logAnalyticsEvent('delete_document', { 
        collection: collectionName, 
        doc_id: docId
      });
      
      return true;
    } catch (err: any) {
      setLoading(false);
      setError({
        code: err.code || 'unknown',
        message: err.message || 'Произошла ошибка при удалении документа'
      });
      
      logAnalyticsEvent('error', { 
        operation: 'delete_document',
        collection: collectionName,
        doc_id: docId,
        error_message: err.message
      });
      
      return false;
    }
  };

  return {
    loading,
    error,
    getDocument,
    getCollection,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    logAnalyticsEvent
  };
}; 