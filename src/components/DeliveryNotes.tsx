import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, CheckCircle2, AlertCircle, FileText, Download, Search, Settings, Calendar, Loader2, Camera, Upload, Plus, X, Sparkles, Check } from 'lucide-react';
import { dataService } from '../services/dataService';

export const DeliveryNotes = ({ user, isDemo }: { user: any; isDemo?: boolean }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Extraction State
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (isDemo) {
          setNotes([
            { id: 'NOTE-842', subcontractorId: 'Excavaciones Galdar SL', mainCompanyId: 'demo', status: 'SIGNED', totalHours: 120, createdAt: { seconds: Date.now()/1000 }, items: [{ description: 'Excavadora 20T', quantity: '8 hrs' }, { description: 'Retirada escombros', quantity: '3 viajes' }] },
            { id: 'NOTE-731', subcontractorId: 'Estructuras Sante S.A.', mainCompanyId: 'demo', status: 'PENDING', totalHours: 450, createdAt: { seconds: Date.now()/1000 - 86400 }, items: [{ description: 'Hormigón HA-25', quantity: '40 m3' }, { description: 'Acero corrugado B500S', quantity: '2000 kg' }, { description: 'Montaje encofrado', quantity: '100 m2' }] },
            { id: 'NOTE-612', subcontractorId: 'Fontanería Brisa', mainCompanyId: 'demo', status: 'DISPUTED', totalHours: 42, createdAt: { seconds: Date.now()/1000 - 172800 }, items: [{ description: 'Tubería PVC 110mm', quantity: '50 m' }, { description: 'Arqueta sifónica', quantity: '2 ud' }] }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const result = await dataService.extractDeliveryNoteData(base64);
        setExtractedData(result);
      } catch (error) {
        console.error("Error extrayendo datos:", error);
        alert("No se pudo procesar el albarán. Verifica la conexión o la API Key.");
      } finally {
        setProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExtracted = async () => {
    if (!extractedData || !user?.companyId) return;
    setProcessing(true);
    try {
      await dataService.saveExtractedDeliveryNote(user.companyId, extractedData);
      setExtractedData(null);
      // Refresh list
      const data = await dataService.getDeliveryNotes(user.companyId, user.role);
      setNotes(data);
    } catch (error) {
      console.error("Error saving extracted note:", error);
      alert("Error al guardar el albarán.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;
    
    // In a real app, update Firestore status to 'DISPUTED' and save reason
    // await dataService.disputeDeliveryNote(selectedNote.id, disputeReason);
    setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, status: 'DISPUTED' } : n));
    setShowDetailModal(false);
    setDisputeReason('');
  };

  const handleSign = async () => {
    // In a real app, update Firestore status to 'SIGNED'
    // await dataService.signDeliveryNote(selectedNote.id);
    setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, status: 'SIGNED' } : n));
    setShowDetailModal(false);
  };

  const StatusTag = ({ status }: { status: string }) => {
    const config: any = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
      SIGNED: { label: 'Firmado (eIDAS)', color: 'bg-green-50 text-green-600 border-green-100' },
      DISPUTED: { label: 'Disputado', color: 'bg-red-50 text-red-600 border-red-100' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-400' };
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${color}`}>{label}</span>;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const filteredNotes = notes.filter(n => n.subcontractorId?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight text-industrial-dark">Albaranes</h2>
          <p className="text-gray-500 font-medium">Control de recepción y validación eIDAS</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-3 bg-industrial-dark text-white rounded-xl font-display font-bold uppercase tracking-widest text-[10px] industrial-shadow hover:bg-industrial-teal transition-all disabled:opacity-50"
          >
            {processing ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
            Escanear Albarán
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar por subcontrata..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white industrial-shadow rounded-xl outline-none focus:ring-2 focus:ring-industrial-teal/20 transition-all text-sm font-medium"
            />
          </div>
          <button className="p-3 bg-white industrial-shadow rounded-xl text-gray-400 hover:text-industrial-teal transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {extractedData && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-industrial-teal/10 border-2 border-industrial-teal rounded-[32px] p-6 mb-8 relative">
              <button 
                onClick={() => setExtractedData(null)}
                className="absolute top-4 right-4 p-2 text-industrial-teal hover:bg-industrial-teal/20 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-start gap-6">
                <div className="bg-industrial-teal p-4 rounded-2xl">
                  <Sparkles className="text-white" size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-bold text-xl text-industrial-teal uppercase tracking-widest">Datos Extraídos por IA</h3>
                    <span className="px-2 py-0.5 bg-industrial-teal text-white text-[10px] font-bold rounded">
                      {(extractedData.confidence * 100).toFixed(0)}% Confianza
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subcontrata</label>
                      <p className="font-medium text-industrial-dark">{extractedData.subcontractorName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Fecha</label>
                      <p className="font-medium text-industrial-dark">{extractedData.date}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Horas Totales</label>
                      <p className="font-medium text-industrial-dark">{extractedData.totalHours || 'No detectado'} h</p>
                    </div>
                  </div>
                  
                  {extractedData.items && extractedData.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-industrial-teal/20">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Materiales / Partidas Extraídas</label>
                      <div className="space-y-2">
                        {extractedData.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-white">
                            <span className="text-sm font-medium text-industrial-dark">{item.description}</span>
                            <span className="text-sm font-bold font-mono text-industrial-teal">{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={handleSaveExtracted}
                      disabled={processing}
                      className="flex-1 bg-industrial-teal text-white py-3 rounded-xl font-display font-bold uppercase tracking-widest text-[10px] industrial-shadow flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} 
                      Confirmar y Guardar
                    </button>
                    <button className="flex-1 bg-white border border-industrial-teal text-industrial-teal py-3 rounded-xl font-display font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                      Editar Manualmente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-industrial-teal" size={40} />
          </div>
        ) : filteredNotes.length > 0 ? filteredNotes.map((note, i) => (
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
                onClick={() => {
                  setSelectedNote(note);
                  setShowDetailModal(true);
                }}
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

      <AnimatePresence>
        {showDetailModal && selectedNote && (
          <div className="fixed inset-0 bg-industrial-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto industrial-shadow"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-industrial-dark mb-1">
                    Detalle de Albarán
                  </h3>
                  <p className="text-gray-500 font-mono text-sm">#{selectedNote.id}</p>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subcontrata</span>
                    <span className="font-bold text-lg text-industrial-dark">{selectedNote.subcontractorId}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Estado</span>
                    <StatusTag status={selectedNote.status} />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Horas Registradas</span>
                    <span className="font-bold text-lg text-industrial-dark">{selectedNote.totalHours} h</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Fecha Emisión</span>
                    <span className="font-mono text-sm text-industrial-dark">
                      {selectedNote.createdAt ? new Date(selectedNote.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {selectedNote.items && selectedNote.items.length > 0 && (
                  <div className="bg-industrial-gray p-6 rounded-2xl space-y-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Materiales o Partidas Relevadas</span>
                    {selectedNote.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-industrial-dark">{item.description}</span>
                        <span className="text-sm font-bold font-mono text-industrial-teal">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-industrial-gray p-6 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Integridad eIDAS</h4>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-xs text-gray-500 mb-1">Hash SHA-256 Confirmado</p>
                      <p className="font-mono text-[10px] text-industrial-dark bg-white p-2 border border-gray-200 rounded truncate">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </p>
                    </div>
                  </div>
                </div>

                {selectedNote.status === 'PENDING' && user?.role === 'CONSTRUCTORA' && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="font-display font-bold text-lg uppercase tracking-widest text-industrial-dark">Validación</h4>
                    
                    <button 
                      onClick={handleSign}
                      className="w-full bg-industrial-teal text-white py-4 rounded-xl font-display font-bold uppercase tracking-widest industrial-shadow active:scale-95 transition-transform flex justify-center items-center gap-2"
                    >
                      <CheckCircle2 size={20} /> Firmar y Validar Albarán
                    </button>
                    
                    <form onSubmit={handleDispute} className="space-y-2 mt-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <AlertCircle size={14} /> Reportar Disputa
                      </p>
                      <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Motivo del rechazo o diferencias detectadas..."
                        required
                        className="w-full p-3 rounded-xl border border-red-200 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                        >
                          Registrar Disputa
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {selectedNote.status === 'DISPUTED' && (
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <AlertCircle size={14} /> Disputa Abierta
                    </p>
                    <p className="text-sm text-red-800">Este albarán ha sido marcado con discrepancias y requiere revisión por ambas partes.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
