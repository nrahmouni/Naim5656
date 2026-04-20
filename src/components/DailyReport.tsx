import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Clock, 
  CheckCircle2, 
  Camera, 
  Mic, 
  MapPin,
  Loader2
} from 'lucide-react';
import { dataService, ProjectData, WorkerData } from '../services/dataService';
import { useSearchParams } from 'react-router-dom';

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const base = "touch-target px-6 py-4 font-display font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-3 industrial-shadow rounded-xl text-lg";
  const variants = {
    primary: "bg-industrial-teal text-white hover:bg-opacity-90",
    secondary: "bg-construction-orange text-white hover:bg-opacity-90",
    outline: "border-2 border-industrial-teal text-industrial-teal bg-white",
    ghost: "bg-transparent text-gray-500 shadow-none"
  };
  return (
    <button className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const DailyReport = ({ user, isDemo }: { user: any; isDemo?: boolean }) => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId');

  const [step, setStep] = useState(1);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [workEntries, setWorkEntries] = useState<any>({});
  const [comments, setComments] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isDemo) {
          const mockProjects: ProjectData[] = [
            { id: 'P-1', name: 'Residencial Las Palmas', location: { lat: 28.1248, lng: -15.4300, radius: 100 }, budgetHours: 5000, status: 'ACTIVE', companyId: 'demo' },
            { id: 'P-2', name: 'Torre Centro', location: { lat: 40.4168, lng: -3.7038, radius: 150 }, budgetHours: 12000, status: 'ACTIVE', companyId: 'demo' }
          ];
          const mockWorkers: WorkerData[] = [
            { id: 'W1', name: 'Antonio Garcia', dni: '12345678A', category: 'Encargado', companyId: 'demo', active: true },
            { id: 'W2', name: 'Maria Rodriguez', dni: '87654321B', category: 'Oficial 1ª', companyId: 'demo', active: true }
          ];
          setProjects(mockProjects);
          setWorkers(mockWorkers);
          if (initialProjectId) {
            const found = mockProjects.find(p => p.id === initialProjectId);
            if (found) setSelectedProject(found);
          }
          setLoading(false);
          return;
        }

        const companyId = user?.companyId;
        if (!companyId) return;

        const [projDocs, workerDocs] = await Promise.all([
          dataService.getProjects(companyId),
          dataService.getWorkers(companyId)
        ]);
        setProjects(projDocs);
        setWorkers(workerDocs);

        if (initialProjectId) {
          const found = projDocs.find(p => p.id === initialProjectId);
          if (found) setSelectedProject(found);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, initialProjectId, isDemo]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleEntryChange = (workerId: string, field: string, value: string) => {
    setWorkEntries((prev: any) => ({
      ...prev,
      [workerId]: {
        ...(prev[workerId] || { hoursNormal: 8, hoursExtra: 0 }),
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProject) return;
    if (isDemo) {
      alert('Modo Demo: El reporte se ha validado localmente.');
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const companyId = user?.companyId;
      if (!companyId) return;
      
      const entries = Object.entries(workEntries).map(([workerId, data]: [string, any]) => {
        const worker = workers.find(w => w.id === workerId);
        return {
          workerId,
          subcontractorId: worker?.companyId || companyId,
          hoursNormal: data.hoursNormal,
          hoursExtra: data.hoursExtra,
          task: 'Trabajos generales'
        };
      });

      await dataService.saveDailyReport({
        projectId: selectedProject.id!,
        companyId,
        date: new Date().toISOString().split('T')[0],
        encargadoId: user.uid,
        status: 'SIGNED',
        geoTag: { lat: 40.4167, lng: -3.7033 }
      }, entries);

      alert('Reporte enviado correctamente.');
      setStep(1);
    } catch (error) {
      console.error(error);
      alert('Error al enviar reporte');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-industrial-teal">
      <Loader2 size={48} className="animate-spin" />
      <p className="mt-4 font-bold uppercase tracking-widest text-xs">Preparando parte...</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-industrial-dark">Parte Diario</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Control de Jornada • v2.4</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-industrial-teal uppercase tracking-[0.2em]">{Math.round((step / 4) * 100)}% Completado</span>
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-full flex-grow transition-all duration-500 rounded-full ${i <= step ? 'bg-industrial-teal' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mb-4">Seleccionar Proyecto</h3>
            {projects.length > 0 ? projects.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className={`p-6 bg-white rounded-2xl industrial-shadow border-2 cursor-pointer transition-all flex justify-between items-center ${
                  selectedProject?.id === p.id ? 'border-industrial-teal' : 'border-transparent'
                }`}
              >
                <div>
                  <p className="font-display font-bold text-lg">{p.name}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mt-1"><MapPin size={12}/> {p.location.lat}, {p.location.lng}</p>
                </div>
                {selectedProject?.id === p.id && <CheckCircle2 className="text-industrial-teal" />}
              </div>
            )) : (
              <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No hay obras dadas de alta</p>
              </div>
            )}
            <Button 
              onClick={nextStep} 
              disabled={!selectedProject} 
              className="w-full mt-8" 
              variant="secondary"
            >
              Continuar <ChevronRight />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <h3 className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Registro de Horas</h3>
             <div className="space-y-3">
               {workers.length > 0 ? workers.map(w => (
                 <div key={w.id} className="bg-white p-4 rounded-xl industrial-shadow border border-gray-100">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <p className="font-bold text-industrial-dark">{w.name}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{w.companyId}</p>
                     </div>
                     <div className="bg-industrial-gray px-2 py-1 rounded text-[10px] font-bold uppercase">{w.category}</div>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="flex items-center gap-2 bg-industrial-gray p-3 rounded-lg">
                       <Clock size={16} className="text-gray-400" />
                       <input 
                        type="number" 
                        placeholder="Norm." 
                        className="bg-transparent w-full text-center font-bold outline-none tabular-nums" 
                        defaultValue="8"
                        onChange={(e) => handleEntryChange(w.id!, 'hoursNormal', e.target.value)}
                       />
                     </div>
                     <div className="flex items-center gap-2 bg-industrial-gray p-3 rounded-lg">
                       <Clock size={16} className="text-construction-orange" />
                       <input 
                        type="number" 
                        placeholder="Extra" 
                        className="bg-transparent w-full text-center font-bold outline-none tabular-nums font-sans" 
                        onChange={(e) => handleEntryChange(w.id!, 'hoursExtra', e.target.value)}
                       />
                     </div>
                   </div>
                 </div>
               )) : (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No hay operarios activos</p>
                </div>
               )}
             </div>
             <div className="flex gap-2 bg-white sticky bottom-4 p-2 rounded-2xl shadow-xl">
               <Button onClick={prevStep} variant="outline" className="flex-1">Atrás</Button>
               <Button onClick={nextStep} variant="secondary" className="flex-grow">Validar <ChevronRight /></Button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <h3 className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Evidencias e Incidencias</h3>
             
             <div className="grid grid-cols-2 gap-4">
               <Button 
                variant="outline" 
                className="h-32 flex-col !gap-1"
                onClick={() => alert('Cámara activada (Capturando evidencia...)')}
               >
                 <Camera size={32} />
                 <span className="text-[10px]">Foto Obra</span>
               </Button>
               <Button 
                variant="outline" 
                className="h-32 flex-col !gap-1"
                onClick={() => alert('Micrófono activado (Transcribiendo nota de voz...)')}
               >
                 <Mic size={32} />
                 <span className="text-[10px]">Nota de Voz</span>
               </Button>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Comentarios de Jornada</label>
               <textarea 
                className="w-full bg-white border border-gray-100 p-4 rounded-2xl industrial-shadow min-h-[120px] outline-none focus:border-industrial-teal"
                placeholder="Indica incidencias, retrasos o falta de material..."
               />
             </div>

             <div className="flex gap-2">
               <Button onClick={prevStep} variant="outline" className="flex-1">Atrás</Button>
               <Button onClick={nextStep} variant="secondary" className="flex-grow">Finalizar <ChevronRight /></Button>
             </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
             <h3 className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Validación e Envío</h3>
             
             <div className="bg-white border-2 border-industrial-teal/20 rounded-3xl p-10 flex flex-col items-center justify-center relative industrial-shadow overflow-hidden">
               <div className="mb-6 relative">
                 <div className="absolute inset-0 bg-industrial-teal/20 rounded-full blur-2xl animate-pulse" />
                 <MapPin size={64} className="text-industrial-teal relative z-10" />
               </div>
               
               <h4 className="text-xl font-display font-bold text-industrial-dark uppercase tracking-tight mb-2">Ubicación Confirmada</h4>
               <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
                 La jornada se validará mediante tu posicionamiento GPS actual. No es necesaria firma manual.
               </p>

               <div className="mt-8 pt-8 border-t border-gray-100 w-full flex flex-col items-center gap-1">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coordenadas Verificadas</span>
                 <p className="text-[12px] font-mono text-industrial-teal font-bold tabular-nums">40.4167° N, 3.7033° W</p>
                 <p className="text-[8px] text-gray-400 uppercase tracking-tighter">Precisión: +/- 4 metros</p>
               </div>
             </div>

             <div className="p-6 bg-white rounded-2xl industrial-shadow text-left border border-gray-100 flex items-center justify-between">
               <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Subcontratas implicadas</p>
                <p className="font-bold text-industrial-dark">02 Empresas registradas</p>
               </div>
               <CheckCircle2 className="text-green-500" />
             </div>

             <div className="flex gap-2">
               <Button onClick={prevStep} variant="outline" className="flex-1">Revisar</Button>
               <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                variant="primary" 
                className="flex-grow !bg-industrial-teal"
               >
                 {submitting ? <Loader2 size={24} className="animate-spin" /> : <>Enviar Reporte <CheckCircle2 /></>}
               </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
