import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Phone, Mail, Award, Search, Plus, Loader2 } from 'lucide-react';
import { dataService, WorkerData } from '../services/dataService';

export const Team = ({ user, isDemo }: { user: any; isDemo?: boolean }) => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    dni: '',
    category: 'Oficial 1ª'
  });

  const companyId = user?.companyId || 'demo-company';

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setWorkers([
          { id: 'W1', name: 'Antonio Garcia', dni: '12345678A', category: 'Encargado', companyId: 'demo', active: true },
          { id: 'W2', name: 'Maria Rodriguez', dni: '87654321B', category: 'Oficial 1ª', companyId: 'demo', active: true },
          { id: 'W3', name: 'Carlos Martinez', dni: '11223344C', category: 'Peón Especialista', companyId: 'demo', active: false },
          { id: 'W4', name: 'Ana Belén Ruiz', dni: '55667788D', category: 'Ayudante', companyId: 'demo', active: true }
        ]);
        setLoading(false);
        return;
      }
      if (!companyId || companyId === 'demo-company') return;
      
      const data = await dataService.getWorkers(companyId);
      setWorkers(data);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [user, isDemo]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.createWorker({
        ...newWorker,
        companyId,
        active: true
      });
      setShowAdd(false);
      setNewWorker({ name: '', dni: '', category: 'Oficial 1ª' });
      fetchWorkers();
    } catch (error) {
      console.error("Error adding worker:", error);
      alert('Error al añadir operario');
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight text-industrial-dark">Plantilla</h2>
          <p className="text-gray-500 font-medium">Control de acceso y cualificaciones</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar operario..." 
              className="w-full pl-10 pr-4 py-3 bg-white industrial-shadow rounded-xl outline-none text-sm"
            />
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="p-3 bg-industrial-teal text-white rounded-xl industrial-shadow active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-industrial-dark/40 backdrop-blur-sm"
          >
            <form onSubmit={handleAddWorker} className="bg-white p-8 rounded-[32px] industrial-shadow max-w-md w-full space-y-6">
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Alta de Operario</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nombre Completo</label>
                  <input 
                    required
                    value={newWorker.name}
                    onChange={e => setNewWorker({...newWorker, name: e.target.value})}
                    className="w-full p-4 bg-industrial-gray rounded-xl outline-none focus:ring-2 ring-industrial-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">DNI / NIE</label>
                  <input 
                    required
                    value={newWorker.dni}
                    onChange={e => setNewWorker({...newWorker, dni: e.target.value})}
                    className="w-full p-4 bg-industrial-gray rounded-xl outline-none focus:ring-2 ring-industrial-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Categoría Profesional</label>
                  <select 
                    value={newWorker.category}
                    onChange={e => setNewWorker({...newWorker, category: e.target.value})}
                    className="w-full p-4 bg-industrial-gray rounded-xl outline-none focus:ring-2 ring-industrial-teal"
                  >
                    <option>Oficial 1ª</option>
                    <option>Oficial 2ª</option>
                    <option>Ayudante</option>
                    <option>Peón Especialista</option>
                    <option>Encargado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-4 font-bold uppercase tracking-widest text-gray-400 text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-industrial-teal text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-industrial-teal/20 active:scale-95 transition-all"
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.length > 0 ? workers.map((w, i) => (
            <motion.div 
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] industrial-shadow relative overflow-hidden flex flex-col items-center text-center"
            >
              <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${w.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              
              <div className="w-20 h-20 rounded-full bg-industrial-gray flex items-center justify-center mb-4 border-4 border-white shadow-inner">
                <User size={40} className="text-gray-400" />
              </div>

              <h3 className="text-xl font-display font-bold text-industrial-dark group-hover:text-industrial-teal transition-colors tracking-tight">
                {w.name}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-4">{w.category} • {w.companyId}</p>

              <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                <button className="p-3 bg-industrial-gray rounded-xl text-gray-400 hover:text-industrial-teal transition-colors">
                  <Phone size={18} className="mx-auto" />
                </button>
                <button className="p-3 bg-industrial-gray rounded-xl text-gray-400 hover:text-industrial-teal transition-colors">
                  <Shield size={18} className="mx-auto" />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl industrial-shadow">
              <User size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay operarios registrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
