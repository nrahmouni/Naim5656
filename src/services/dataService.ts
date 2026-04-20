import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

export interface ProjectData {
  id?: string;
  name: string;
  location: { lat: number; lng: number; radius: number };
  budgetHours: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  companyId: string;
}

export interface WorkerData {
  id?: string;
  name: string;
  dni: string;
  category: string;
  companyId: string;
  active: boolean;
}

export interface DailyReportData {
  id?: string;
  projectId: string;
  companyId: string;
  date: string;
  encargadoId: string;
  status: 'DRAFT' | 'SIGNED';
  geoTag: { lat: number; lng: number };
  createdAt: any;
}

export const dataService = {
  // Projects
  async getProjects(companyId: string) {
    const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  },

  async createProject(data: Omit<ProjectData, 'id'>) {
    return await addDoc(collection(db, 'projects'), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  // Workers
  async getWorkers(companyId: string) {
    const q = query(collection(db, 'workers'), where('companyId', '==', companyId), where('active', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  },

  async createWorker(worker: Omit<WorkerData, 'id'>) {
    return await addDoc(collection(db, 'workers'), {
      ...worker,
      createdAt: serverTimestamp()
    });
  },

  // Incidents
  async createIncident(incident: any) {
    const docRef = await addDoc(collection(db, 'incidents'), {
      ...incident,
      createdAt: serverTimestamp()
    });
    await this.logAction('CREATE_INCIDENT', docRef.id, { projectId: incident.projectId });
    return docRef.id;
  },

  // Audit Logs
  async logAction(action: string, resourceId: string, metadata: any = {}) {
    const user = auth.currentUser;
    if (!user) return;
    
    return addDoc(collection(db, 'audit_logs'), {
      userId: user.uid,
      action,
      resourceId,
      metadata,
      timestamp: serverTimestamp()
    });
  },

  // Ecosistema: Project Companies
  async inviteSubcontractor(projectId: string, companyId: string) {
    const id = `${projectId}_${companyId}`;
    await setDoc(doc(db, 'project_companies', id), {
      projectId,
      companyId,
      role: 'SUBCONTRATA',
      invitedAt: serverTimestamp()
    });
    await this.logAction('INVITE_SUBCONTRATOR', id, { projectId, companyId });
  },

  async getProjectCompanies(projectId: string) {
    const q = query(collection(db, 'project_companies'), where('projectId', '==', projectId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  },

  // Daily Reports
  async saveDailyReport(report: Omit<DailyReportData, 'id' | 'createdAt'>, entries: any[]) {
    // 1. Fetch project to get mainCompanyId for better security and querying
    const projectSnap = await getDoc(doc(db, 'projects', report.projectId));
    const projectData = projectSnap.data() as ProjectData;
    const mainCompanyId = projectData?.companyId || report.companyId;

    // 2. Save main report
    const reportRef = await addDoc(collection(db, 'daily_reports'), {
      ...report,
      mainCompanyId,
      createdAt: serverTimestamp()
    });

    // 3. Save individual work entries as subcollection
    const entriesPromises = entries.map(entry => 
      addDoc(collection(db, `daily_reports/${reportRef.id}/entries`), {
        ...entry,
        dailyReportId: reportRef.id,
        createdAt: serverTimestamp()
      })
    );

    await Promise.all(entriesPromises);

    // 4. Fragmentation Engine: Create delivery notes per subcontractor
    const subIdSet = new Set(entries.map(e => e.subcontractorId).filter(Boolean));
    const subContractors = Array.from(subIdSet);

    const notesPromises = subContractors.map(async (subId) => {
      const subEntries = entries.filter(e => e.subcontractorId === subId);
      const totalHours = subEntries.reduce((sum, e) => sum + (e.hoursNormal || 0) + (e.hoursExtra || 0), 0);
      
      const noteRef = await addDoc(collection(db, 'delivery_notes'), {
        dailyReportId: reportRef.id,
        subcontractorId: subId,
        projectId: report.projectId,
        mainCompanyId,
        status: 'PENDING',
        totalHours,
        createdAt: serverTimestamp()
      });
      return noteRef.id;
    });

    await Promise.all(notesPromises);
    
    // 5. Audit Log
    await this.logAction('CREATE_DAILY_REPORT', reportRef.id, { projectId: report.projectId });

    return reportRef.id;
  },

  async getRecentReports(companyId: string, limitCount = 5) {
    const q = query(
      collection(db, 'daily_reports'), 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  },

  // Delivery Notes
  async getDeliveryNotes(companyId: string, role: string) {
    let q;
    if (role === 'CONSTRUCTORA') {
      // Constructor sees all notes linked to their company (as project owner)
      q = query(
        collection(db, 'delivery_notes'),
        where('mainCompanyId', '==', companyId)
      );
    } else {
      // Subcontractor only sees their own notes
      q = query(
        collection(db, 'delivery_notes'),
        where('subcontractorId', '==', companyId)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  },

  // Stats for Dashboard
  async getDashboardStats(companyId: string) {
    const projects = await this.getProjects(companyId);
    const workers = await this.getWorkers(companyId);
    const reports = await this.getRecentReports(companyId, 100);
    
    return {
      activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
      activeWorkers: workers.length,
      pendingNotes: 0, // Mock for now
      totalHours: 0    // Mock for now
    };
  },

  // Onboarding & Company Management
  async createCompany(userId: string, companyData: { name: string; cif: string; address: string; role: 'CONSTRUCTORA' | 'SUBCONTRATA' }) {
    const companyRef = await addDoc(collection(db, 'companies'), {
      ...companyData,
      adminId: userId,
      createdAt: serverTimestamp(),
      joinCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    // Update user with company info
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      companyId: companyRef.id,
      role: companyData.role
    });

    return companyRef.id;
  },

  async joinCompany(userId: string, joinCode: string) {
    const q = query(collection(db, 'companies'), where('joinCode', '==', joinCode.toUpperCase()));
    const snap = await getDocs(q);
    
    if (snap.empty) throw new Error('Código de invitación no válido');
    
    const companyId = snap.docs[0].id;
    const companyData = snap.docs[0].data();

    // Update user with company info
    const userRef = doc(db, 'users', userId);
    const updateData = {
      companyId: companyId,
      companyName: companyData.name,
      role: companyData.role === 'CONSTRUCTORA' ? 'ENCARGADO' : 'OPERARIO'
    };
    await updateDoc(userRef, updateData);

    return updateData;
  }
};
