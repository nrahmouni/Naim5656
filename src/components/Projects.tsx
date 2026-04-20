import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Users, Clock, ArrowRight, Search, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataService, ProjectData } from '../services/dataService';

export const Projects = ({ user, isDemo }: { user: any; isDemo?: boolean }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    address: '',
    budgetHours: 0,
    status: 'ACTIVE' as const
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (isDemo) {
          setProjects([
            { id: 'P-1', name: 'Residencial Las Palmas', location: { lat: 28.1248, lng: -15.4300, radius: 100 }, budgetHours: 5000, status: 'ACTIVE', ownerCompanyId: 'demo' },
            { id: 'P-2', name: 'Torre Centro', location: { lat: 40.4168, lng: -3.7038, radius: 150 }, budgetHours: 12000, status: 'ACTIVE', ownerCompanyId: 'demo' },
            { id: 'P-3', name: 'Puente Norte', location: { lat: 43.2630, lng: -2.9350, radius: 200 }, budgetHours: 8500, status: 'PAUSED', ownerCompanyId: 'demo' }
          ]);
          setLoading(false);
          return;
        }
        const companyId = user?.companyId;
        if (!companyId) return;
        
        const data = await dataService.getProjects(companyId);
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user, isDemo]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    try {
      const companyId = user?.companyId || 'demo-company';
      await dataService.createProject({
        name: newProject.name,
        // Optional: in an advanced version, use a geocoding service here
        location: { lat: 40.4167, lng: -3.7033, radius: 100 }, 
        budgetHours: newProject.budgetHours,
        status: newProject.status,
        ownerCompanyId: companyId
      });
      setShowCreateModal(false);
      setNewProject({ name: '', address: '', budgetHours: 0, status: 'ACTIVE' });
      // Refresh list
      const data = await dataService.getProjects(companyId);
      setProjects(data);
    } catch (error) {
      alert('Error al crear proyecto');
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight text-industrial-dark">Proyectos</h2>
          <p className="text-gray-500 font-medium">Gestión y control de activos en tiempo real</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar obra..." 
              className="w-full pl-10 pr-4 py-3 bg-white industrial-shadow rounded-xl outline-none focus:ring-2 focus:ring-industrial-teal/20 transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-3 bg-industrial-teal text-white rounded-xl industrial-shadow active:scale-95 transition-all flex items-center gap-2 px-4 whitespace-nowrap"
          >
            <Plus size={20} /> <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Nueva Obra</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-industrial-dark/40 backdrop-blur-sm"
          >
            <form onSubmit={handleCreateProject} className="bg-white p-8 rounded-[32px] industrial-shadow max-w-md w-full space-y-6">
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Alta de Proyecto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nombre de la Obra</label>
                  <input 
                    required
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    className="w-full p-4 bg-industrial-gray rounded-xl outline-none focus:ring-2 ring-industrial-teal"
                    placeholder="Ej. Residencial Las Palmas"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Dirección (Opcional)</label>
                  <input 
                    value={newProject.address}
                    onChange={e => setNewProject({...newProject, address: e.target.value})}
                    className="w-full p-4 bg-industrial-gray rounded-xl outline-none focus:ring-2 ring-industrial-teal"
                    placeholder="Calle, Ciudad..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Presupuesto (Horas)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={newProject.budgetHours || ''}
                    onChange={e => setNewProject({...newProject, budgetHours: parseInt(e.target.value) || 0})}
                    className="w-full p-4 bg-industrial-gray rounded-xl outline-none focus:ring-2 ring-industrial-teal"
                    placeholder="Ej. 5000"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 font-bold uppercase tracking-widest text-gray-400 text-xs hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-industrial-teal text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-industrial-teal/20 active:scale-95 transition-all text-xs"
                >
                  Confirmar Alta
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-industrial-teal">
          <Loader2 size={48} className="animate-spin" />
          <p className="mt-4 font-bold uppercase tracking-widest text-xs">Cargando Obras...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length > 0 ? projects.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 industrial-shadow relative overflow-hidden group border border-transparent hover:border-industrial-teal/20 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-industrial-gray p-4 rounded-2xl group-hover:bg-industrial-teal group-hover:text-white transition-colors">
                  <MapPin size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  p.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.status}
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold mb-2 uppercase">{p.name}</h3>
              <p className="text-gray-400 text-sm mb-6 flex items-center gap-1"><MapPin size={14}/> {p.location.lat}, {p.location.lng}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-industrial-gray/50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Presupuesto</p>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-industrial-teal" />
                    <span className="font-display font-bold text-lg">{p.budgetHours}h</span>
                  </div>
                </div>
                <div className="bg-industrial-gray/50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-construction-orange" />
                    <span className="font-display font-bold text-lg">En curso</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => alert('Próximamente: Historial de Trazas Auditadas')}
                  className="p-2 text-gray-400 hover:text-industrial-teal transition-colors"
                  title="Auditoría eIDAS"
                >
                  <BarChart3 size={18} />
                </button>
                <button 
                   onClick={() => navigate(`/report?projectId=${p.id}`)}
                  className="flex-grow ml-4 py-4 bg-industrial-teal text-white rounded-2xl font-display font-bold uppercase tracking-[0.2em] text-[10px] industrial-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Gestionar Obra <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center industrial-shadow">
              <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-display font-bold uppercase">No hay obras activas</h3>
              <p className="text-gray-400 text-sm mt-2">Crea tu primera obra para empezar a reportar actividad.</p>
              <button 
                onClick={handleCreateProject}
                className="mt-6 px-8 py-3 bg-industrial-teal text-white rounded-xl font-bold uppercase text-xs tracking-widest"
              >
                Crear Proyecto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
