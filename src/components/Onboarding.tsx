import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Users, ArrowRight, CheckCircle2, Layout, ShieldCheck } from 'lucide-react';
import { dataService } from '../services/dataService';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const Onboarding = ({ user, onComplete }: { user: any, onComplete: (userData: any) => void }) => {
  const [step, setStep] = useState<'CHOICE' | 'CREATE' | 'JOIN' | 'SUCCESS'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    cif: '',
    address: '',
    role: 'CONSTRUCTORA' as 'CONSTRUCTORA' | 'SUBCONTRATA'
  });

  const [joinCode, setJoinCode] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const companyId = await dataService.createCompany(user.uid, companyForm);
      const updatedUser = { ...user, companyId, role: companyForm.role, companyName: companyForm.name };
      
      // Also update firestore user doc with companyName for convenience
      await updateDoc(doc(db, 'users', user.uid), { companyName: companyForm.name });
      
      onComplete(updatedUser);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Error al crear la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await dataService.joinCompany(user.uid, joinCode);
      // Wait for user doc update or just update local state
      onComplete({ ...user, ...result });
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Código de invitación no válido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-gray flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {step === 'CHOICE' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-industrial-dark mb-4">Bienvenido a ObraService</h1>
                <p className="text-gray-500">Para empezar, necesitamos configurar tu entorno de trabajo profesional.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('CREATE')}
                  className="p-8 bg-white industrial-shadow rounded-[32px] text-left hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-industrial-teal"
                >
                  <div className="w-12 h-12 bg-industrial-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-industrial-teal transition-colors">
                    <Building2 size={24} className="text-industrial-teal group-hover:text-white" />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase mb-2">Crear Empresa</h3>
                  <p className="text-sm text-gray-400 mb-6">Si eres el administrador o dueño de la constructora/subcontrata.</p>
                  <div className="flex items-center gap-2 text-industrial-teal font-bold uppercase tracking-widest text-[10px]">
                    Empezar Registro <ArrowRight size={14} />
                  </div>
                </button>

                <button
                  onClick={() => setStep('JOIN')}
                  className="p-8 bg-white industrial-shadow rounded-[32px] text-left hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-construction-orange"
                >
                  <div className="w-12 h-12 bg-construction-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-construction-orange transition-colors">
                    <Users size={24} className="text-construction-orange group-hover:text-white" />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase mb-2">Unirse a Obra</h3>
                  <p className="text-sm text-gray-400 mb-6">Si ya tienes un código de invitación de tu empresa o encargado.</p>
                  <div className="flex items-center gap-2 text-construction-orange font-bold uppercase tracking-widest text-[10px]">
                    Usar Código <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'CREATE' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-10 rounded-[40px] industrial-shadow"
            >
              <button onClick={() => setStep('CHOICE')} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-industrial-dark mb-8">← Volver</button>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8">Registro de Empresa</h2>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Nombre de la Empresa</label>
                  <input
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full p-4 bg-industrial-gray rounded-xl border border-transparent focus:border-industrial-teal outline-none transition-all"
                    placeholder="Ej. Construcciones Globales S.L."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">CIF/NIF</label>
                    <input
                      required
                      value={companyForm.cif}
                      onChange={(e) => setCompanyForm({ ...companyForm, cif: e.target.value })}
                      className="w-full p-4 bg-industrial-gray rounded-xl border border-transparent focus:border-industrial-teal outline-none transition-all"
                      placeholder="Ej. B12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tipo de Empresa</label>
                    <select
                      value={companyForm.role}
                      onChange={(e: any) => setCompanyForm({ ...companyForm, role: e.target.value })}
                      className="w-full p-4 bg-industrial-gray rounded-xl border border-transparent focus:border-industrial-teal outline-none transition-all"
                    >
                      <option value="CONSTRUCTORA">Constructora</option>
                      <option value="SUBCONTRATA">Subcontrata</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Dirección Fiscal</label>
                  <input
                    required
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full p-4 bg-industrial-gray rounded-xl border border-transparent focus:border-industrial-teal outline-none transition-all"
                    placeholder="Calle, Ciudad, CP"
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-bold uppercase text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-industrial-teal text-white font-display font-bold uppercase tracking-widest rounded-2xl hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Finalizar Registro'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'JOIN' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-10 rounded-[40px] industrial-shadow text-center"
            >
              <button onClick={() => setStep('CHOICE')} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-industrial-dark mb-8 block ml-0">← Volver</button>
              <div className="w-20 h-20 bg-construction-orange/10 rounded-[24px] flex items-center justify-center mx-auto mb-8">
                <ShieldCheck size={40} className="text-construction-orange" />
              </div>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-4">Unirse a un Equipo</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Introduce el código de 6 dígitos que te ha proporcionado tu administrador.</p>
              
              <form onSubmit={handleJoin} className="space-y-6">
                <input
                  required
                  autoFocus
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full p-6 text-center text-4xl font-display font-bold tracking-[0.5em] bg-industrial-gray rounded-[32px] border-2 border-transparent focus:border-construction-orange outline-none transition-all uppercase placeholder:text-gray-200"
                  placeholder="ABC123"
                />

                {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || joinCode.length < 6}
                  className="w-full py-5 bg-construction-orange text-white font-display font-bold uppercase tracking-widest rounded-2xl hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Validando...' : 'Unirse al Ecosistema'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[48px] industrial-shadow text-center"
            >
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-4xl font-display font-bold uppercase tracking-tight mb-4">¡Todo Listo!</h2>
              <p className="text-gray-500 mb-12">Tu ecosistema profesional ha sido configurado correctamente. Accediendo al panel...</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-2 bg-industrial-teal rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
