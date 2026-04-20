import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Truck, CheckCircle2, AlertCircle, FileText, Download, Search, Settings, Calendar, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';

export const DeliveryNotes = ({ user, isDemo }: { user: any; isDemo?: boolean }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (isDemo) {
          setNotes([
            { id: 'NOTE-842', subcontractorId: 'Excavaciones Galdar SL', mainCompanyId: 'demo', status: 'SIGNED', totalHours: 120, createdAt: { seconds: Date.now()/1000 } },
            { id: 'NOTE-731', subcontractorId: 'Estructuras Sante S.A.', mainCompanyId: 'demo', status: 'PENDING', totalHours: 450, createdAt: { seconds: Date.now()/1000 - 86400 } },
            { id: 'NOTE-612', subcontractorId: 'Fontanería Brisa', mainCompanyId: 'demo', status: 'DISPUTED', totalHours: 42, createdAt: { seconds: Date.now()/1000 - 172800 } }
          ]);
          setLoading(false);
          return;
        }
        const companyId = user?.companyId;
        if (!companyId) return;

        const data = await dataService.getDeliveryNotes(companyId, user.role);
        setNotes(data);
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user, isDemo]);

  const StatusTag = ({ status }: { status: string }) => {
    const config: any = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
      SIGNED: { label: 'Firmado (eIDAS)', color: 'bg-green-50 text-green-600 border-green-100' },
      DISPUTED: { label: 'Disputado', color: 'bg-red-50 text-red-600 border-red-100' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-400' };
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${color}`}>{label}</span>;
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight text-industrial-dark">Albaranes</h2>
          <p className="text-gray-500 font-medium">Control de recepción y validación eIDAS</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar por subcontrata..." 
              className="w-full pl-10 pr-4 py-3 bg-white industrial-shadow rounded-xl outline-none focus:ring-2 focus:ring-industrial-teal/20 transition-all text-sm font-medium"
            />
          </div>
          <button className="p-3 bg-white industrial-shadow rounded-xl text-gray-400 hover:text-industrial-teal transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-industrial-teal" size={40} />
          </div>
        ) : notes.length > 0 ? notes.map((note, i) => (
          <motion.div 
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl industrial-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="bg-industrial-gray p-3 rounded-xl">
                <Truck className="text-industrial-dark" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-gray-400">#{note.id.substring(0, 8)}</span>
                  <StatusTag status={note.status} />
                </div>
                <p className="font-display font-bold text-lg">{note.subcontractorId}</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                    <CheckCircle2 size={12} /> {note.totalHours}h totales
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                    <FileText size={12} /> {note.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => alert(`Descargando PDF del Albarán ${note.id}...`)}
                className="flex-1 sm:flex-none p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                title="Descargar PDF"
              >
                <Download size={20} className="text-gray-400" />
              </button>
              <button 
                onClick={() => alert(`Cargando detalle inmutable del registro para ${note.subcontractorId}`)}
                className="flex-grow p-3 bg-industrial-teal text-white font-bold uppercase tracking-widest text-[10px] rounded-xl industrial-shadow active:scale-95 transition-all"
              >
                Ver Detalles
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="bg-white p-12 rounded-3xl text-center industrial-shadow border border-gray-100">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay albaranes disponibles</p>
          </div>
        )}
      </div>

      <div className="bg-industrial-dark p-8 rounded-[32px] text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-display font-bold text-2xl mb-2">VALIDACIÓN LEGAL</h4>
            <p className="text-gray-400 text-sm max-w-md">Todos los albaranes firmados cuentan con hash de integridad inmutable y timestamp conforme al reglamento eIDAS.</p>
          </div>
          <button 
            onClick={() => alert('Generando Certificado de Integridad Digital eIDAS...')}
            className="bg-construction-orange px-8 py-4 rounded-xl font-display font-bold uppercase tracking-[0.2em] industrial-shadow active:scale-95 transition-all"
          >
            Sello Digital
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      </div>
    </div>
  );
};
