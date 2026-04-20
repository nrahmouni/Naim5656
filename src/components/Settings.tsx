import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Copy, 
  Check, 
  Save, 
  Shield, 
  Smartphone, 
  MapPin, 
  Briefcase,
  ExternalLink,
  Share2
} from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const Settings = ({ user, isDemo }: { user: any; isDemo?: boolean }) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cif: '',
    address: ''
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (isDemo) {
          const mockCompany = {
            name: 'Constructora Demo S.A.',
            cif: 'B12345678',
            address: 'Calle Mayor 1, Madrid, España',
            role: 'CONSTRUCTORA',
            joinCode: 'DEMO99'
          };
          setCompany(mockCompany);
          setFormData({
            name: mockCompany.name,
            cif: mockCompany.cif,
            address: mockCompany.address
          });
          setLoading(false);
          return;
        }
        if (!user.companyId) return;
        const snap = await getDoc(doc(db, 'companies', user.companyId));
        if (snap.exists()) {
          const data = snap.data();
          setCompany(data);
          setFormData({
            name: data.name || '',
            cif: data.cif || '',
            address: data.address || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [user, isDemo]);

  const handleCopy = () => {
    if (company?.joinCode) {
      navigator.clipboard.writeText(company.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (isDemo) {
      setCompany({ ...company, ...formData });
      setEditing(false);
      alert('Modo Demo: Cambios guardados localmente.');
      return;
    }
    try {
      setLoading(true);
      await updateDoc(doc(db, 'companies', user.companyId), formData);
      setCompany({ ...company, ...formData });
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Cargando configuración...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="mb-12">
        <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-industrial-dark">Configuración</h1>
        <p className="text-gray-500 font-medium">Gestiona tu ecosistema y credenciales de empresa</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Card */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-[32px] p-8 industrial-shadow space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-industrial-teal/10 rounded-xl">
                  <Building2 className="text-industrial-teal" size={20} />
                </div>
                <h3 className="font-display font-bold uppercase tracking-widest">Perfil de Empresa</h3>
              </div>
              <button 
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-industrial-teal hover:underline flex items-center gap-2"
              >
                {editing ? <><Save size={14} /> Guardar</> : 'Editar Perfil'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nombre Comercial</label>
                {editing ? (
                  <input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-industrial-gray rounded-xl border-none focus:ring-2 ring-industrial-teal outline-none"
                  />
                ) : (
                  <p className="font-bold text-lg">{company?.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">CIF / NIF</label>
                  {editing ? (
                    <input 
                      value={formData.cif} 
                      onChange={e => setFormData({...formData, cif: e.target.value})}
                      className="w-full p-3 bg-industrial-gray rounded-xl border-none focus:ring-2 ring-industrial-teal outline-none"
                    />
                  ) : (
                    <p className="font-mono font-bold">{company?.cif}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Rol en Sistema</label>
                  <p className="inline-flex px-3 py-1 bg-industrial-teal/10 text-industrial-teal text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {company?.role}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Dirección de Sede</label>
                {editing ? (
                  <input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 bg-industrial-gray rounded-xl border-none focus:ring-2 ring-industrial-teal outline-none"
                  />
                ) : (
                  <p className="text-gray-500 text-sm">{company?.address}</p>
                )}
              </div>
            </div>
          </section>

          {/* Invitation Card */}
          <section className="bg-industrial-dark text-white rounded-[32px] p-8 industrial-shadow relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Share2 size={20} className="text-construction-orange" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase tracking-widest">Invitar a tu Ecosistema</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Código de Acceso Rápido</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <span className="text-4xl font-display font-bold tracking-[0.5em] flex-grow">
                  {company?.joinCode}
                </span>
                <button 
                  onClick={handleCopy}
                  className="p-4 bg-construction-orange rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-construction-orange/20"
                >
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Comparte este código con tus encargados y operarios para que se unan automáticamente a tu empresa.
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-construction-orange/10 rounded-full blur-3xl pointer-events-none" />
          </section>
        </div>

        {/* Sidebar / Profile Card */}
        <div className="space-y-6">
          <section className="bg-white rounded-[32px] p-8 industrial-shadow text-center">
            <div className="w-20 h-20 bg-industrial-teal text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-industrial-gray">
              {user.displayName?.[0]}
            </div>
            <h4 className="font-display font-bold text-xl uppercase tracking-tight">{user.displayName}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{user.role}</p>
            
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-industrial-gray transition-colors cursor-pointer group">
                <Shield size={16} className="text-gray-400 group-hover:text-industrial-teal" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Seguridad 2FA</span>
              </div>
              <div className="flex items-center gap-3 text-left p-3 rounded-xl hover:bg-industrial-gray transition-colors cursor-pointer group">
                <Smartphone size={16} className="text-gray-400 group-hover:text-industrial-teal" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Dispositivos</span>
              </div>
            </div>
          </section>

          <section className="bg-construction-orange/5 border border-construction-orange/20 rounded-[32px] p-8">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-construction-orange mb-4">Estado del Servicio</h5>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold">API obv.eIDAS: Activa</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold">
              Todas las firmas realizadas en este ecosistema cumplen con el reglamento (UE) Nº 910/2014.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
