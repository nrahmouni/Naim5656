import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo?: any;
}

export const handleFirestoreError = (error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never => {
  console.error(`Firestore Error [${operation}]:`, error);
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown error',
    operationType: operation,
    path
  };
  throw new Error(JSON.stringify(errorInfo));
};

// Services
export const ProjectService = {
  subscribeToProjects: (companyId: string, role: string, callback: (projects: any[]) => void) => {
    const q = role === 'CONSTRUCTORA' 
      ? query(collection(db, 'projects'), where('companyId', '==', companyId))
      : query(collection(db, 'projects')); // For subcontractors, we rely on server-side rules filtering their specific access

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, 'list', 'projects'));
  }
};

export const ReportService = {
  createDailyReport: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, 'daily_reports'), {
        ...data,
        status: 'DRAFT',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, 'create', 'daily_reports');
    }
  },
  
  signReport: async (reportId: string, signature: string, geoTag: any) => {
    try {
      const docRef = doc(db, 'daily_reports', reportId);
      await updateDoc(docRef, {
        status: 'SIGNED',
        signature,
        geoTag,
        signedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `daily_reports/${reportId}`);
    }
  }
};
