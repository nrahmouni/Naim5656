/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  Hammer, 
  ClipboardList, 
  Truck, 
  BarChart3, 
  User as UserIcon,
  Plus,
  ArrowRight,
  LogOut,
  MapPin,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { dataService } from './services/dataService';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// --- Importers ---
import { DailyReport } from './components/DailyReport';
import { DeliveryNotes } from './components/DeliveryNotes';
import { Projects } from './components/Projects';
import { Team } from './components/Team';
import { Onboarding } from './components/Onboarding';
import { Settings as SettingsPage } from './components/Settings';

// --- Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: any) => {
  const base = "touch-target px-6 py-3 font-display font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 industrial-shadow";
  const variants = {
    primary: "bg-industrial-teal text-white hover:bg-opacity-90",
    secondary: "bg-construction-orange text-white hover:bg-opacity-90",
    outline: "border-2 border-industrial-teal text-industrial-teal hover:bg-industrial-teal hover:text-white bg-transparent",
    ghost: "bg-transparent text-industrial-teal hover:bg-industrial-teal/10 shadow-none border-none"
  };
  
  return (
    <button className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Pages ---

const Landing = ({ onDemo }: { onDemo: () => void }) => {
  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('El usuario cerró la ventana de login antes de completar el proceso.');
      } else {
        console.error('Error durante el inicio de sesión:', error);
        alert('Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const Feature = ({ icon: Icon, title, desc }: any) => (
    <div className="p-8 bg-white industrial-shadow border border-industrial-teal/10 rounded-2xl">
      <div className="w-12 h-12 bg-industrial-teal/10 rounded-lg flex items-center justify-center mb-6">
        <Icon size={24} className="text-industrial-teal" />
      </div>
      <h3 className="font-display font-bold text-xl mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );

  return (
    <div className="bg-industrial-gray selection:bg-construction-orange selection:text-white">
      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[100] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer size={24} className="text-industrial-teal" />
            <span className="font-display font-bold text-xl tracking-tighter">OBRASERVICE</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Visión', 'Plataforma', 'Precios'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-industrial-teal transition-colors">{item}</a>
            ))}
            <Button onClick={login} className="!h-10 !px-4 text-xs">Acceso Clientes</Button>
          </div>
          <button className="md:hidden text-industrial-teal"><Menu /></button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-construction-orange/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-construction-orange rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-construction-orange">SaaS Construcción v2026</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] mb-8 uppercase">
              EL FIN DEL <br />
              <span className="text-industrial-teal">PAPEL EN OBRA.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              La plataforma mobile-first definitiva para gestionar operarios, partes de horas y albaranes con validez legal eIDAS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={login} variant="secondary" className="!px-8 !py-5">
                Empezar Gratis <ArrowRight size={20} />
              </Button>
              <Button onClick={onDemo} variant="outline" className="!px-8 !py-5">
                Ver Demo Interactiva
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-6 text-gray-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} referrerPolicy="no-referrer" alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-tighter">
                +250 Constructoras ya digitalizadas
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-industrial-teal/5 rounded-[40px] -rotate-3 scale-105" />
            <div className="relative bg-industrial-dark p-4 rounded-[40px] shadow-2xl border-x-4 border-industrial-teal/20">
              <img 
                src="https://picsum.photos/seed/obra/800/600" 
                referrerPolicy="no-referrer" 
                className="rounded-[30px] opacity-80 grayscale hover:grayscale-0 transition-all duration-700 h-[500px] w-full object-cover" 
                alt="App Preview"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white p-6 rounded-2xl shadow-2xl industrial-shadow animate-bounce">
                  <ClipboardList size={40} className="text-construction-orange" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="plataforma" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-sm font-bold text-construction-orange uppercase tracking-[0.3em] mb-4">¿Por qué ObraService?</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold uppercase leading-none">Diseñado por el barro, <br /> para el barro.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature 
              icon={Truck} 
              title="Albaranes Fragmentados" 
              desc="Genera albaranes automáticos por subcontrata a partir de un solo parte diario. Sin duplicidades ni errores."
            />
            <Feature 
              icon={MapPin} 
              title="Geofencing GPS" 
              desc="Asegura que el registro de horas solo sea válido dentro del perímetro de la obra. Prevención total de fraude."
            />
            <Feature 
              icon={ClipboardList} 
              title="Validez eIDAS" 
              desc="Firma digital conforme a normativa europea. Documentos con integridad legal para auditorías e inspecciones."
            />
            <Feature 
              icon={UserIcon} 
              title="Gestión de Subcontratas" 
              desc="Panel autónomo para proveedores. Revisan, aprueban o disputan sus albaranes en segundos."
            />
            <Feature 
              icon={BarChart3} 
              title="Analítica de Desviación" 
              desc="Horas consumidas vs presupuesto en tiempo real. Alertas predictivas antes de que los costes se disparen."
            />
            <Feature 
              icon={Hammer} 
              title="Modo Offline" 
              desc="Funciona sin conexión en sótanos o zonas remotas. Sincronización inteligente cuando vuelve la cobertura."
            />
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-industrial-dark text-white text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none overflow-hidden">
          <h2 className="text-[20vw] font-display font-bold whitespace-nowrap -ml-40">OBRASERVICE OBRASERVICE</h2>
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <p className="text-3xl md:text-5xl font-display font-bold leading-tight mb-8">
            "Hem reducido las disputas con subcontratas en un 80% y digitalizado el flujo de pago por completo."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-industrial-teal" />
            <div className="text-left">
              <p className="font-bold uppercase tracking-widest text-xs">Juan Pérez</p>
              <p className="text-gray-500 text-[10px] uppercase font-bold">Director de Producción @ Constructora X</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="precios" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 uppercase">Listo para <br /><span className="text-industrial-teal">transformar</span> tu obra.</h2>
          <p className="text-xl text-gray-500 mb-12">Empieza hoy con tu primer proyecto gratis. Sin tarjetas, sin compromiso.</p>
          <div className="p-12 bg-white industrial-shadow rounded-[40px] border-b-8 border-construction-orange">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Plan Enterprise</h3>
            <p className="text-6xl font-display font-bold mb-8 text-industrial-teal">99€<span className="text-xl text-gray-400">/мес</span></p>
            <ul className="text-left space-y-4 mb-12 max-w-xs mx-auto text-sm">
              <li className="flex items-center gap-3 font-bold"><Plus size={16} className="text-construction-orange"/> Proyectos Ilimitados</li>
              <li className="flex items-center gap-3 font-bold"><Plus size={16} className="text-construction-orange"/> Soporte Offline-First</li>
              <li className="flex items-center gap-3 font-bold"><Plus size={16} className="text-construction-orange"/> Firmas Digitales eIDAS</li>
              <li className="flex items-center gap-3 font-bold"><Plus size={16} className="text-construction-orange"/> API para ERP</li>
            </ul>
            <Button onClick={login} variant="primary" className="w-full !py-6">Acceso Inmediato</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Hammer size={24} className="text-industrial-teal" />
            <span className="font-display font-bold text-xl tracking-tighter text-industrial-dark">OBRASERVICE</span>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
            © 2026 ObraService - Software para Gigantes de la Construcción. <br />
            Hecho en España para Europa. Cumplimiento RGPD & eIDAS.
          </div>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'YouTube'].map(link => (
              <a key={link} href="#" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-industrial-teal transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

const Dashboard = ({ user, isDemo }: any) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    activeWorkers: 0,
    pendingNotes: 0,
    totalHours: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Albarán Escaneado', message: 'Se ha procesado un nuevo albarán y requiere validación.', time: 'Hace 5 min', read: false, link: '/notes' },
    { id: 2, title: 'Reporte Sin Firmar', message: 'El parte diario del Residencial Las Palmas sigue en borrador.', time: 'Hace 2 horas', read: false, link: '/report' },
    { id: 3, title: 'Presupuesto al 80%', message: 'El proyecto Torre Centro se acerca al límite de horas presupuestadas.', time: 'Ayer', read: true, link: '/projects' }
  ]);
  const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read).length);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isDemo) {
          setStats({
            activeProjects: 3,
            activeWorkers: 12,
            pendingNotes: 5,
            totalHours: 450
          });
          setRecentReports([
            { id: '1', status: 'SIGNED', projectId: 'P-LASPALMAS', createdAt: { seconds: Date.now()/1000 - 3600 } },
            { id: '2', status: 'DRAFT', projectId: 'P-CENTRO', createdAt: { seconds: Date.now()/1000 - 86400 } }
          ]);
          setLoading(false);
          return;
        }

        if (!user || !user.companyId) {
          setLoading(false);
          return;
        }
        
        const companyId = user.companyId;
        console.log(`[Dashboard] Fetching data for company: ${companyId}`);
        
        const [s, reports] = await Promise.all([
          dataService.getDashboardStats(companyId).catch(err => {
            console.error("[Dashboard] Stats error:", err);
            return null;
          }),
          dataService.getRecentReports(companyId, 5).catch(err => {
            console.error("[Dashboard] Reports error:", err);
            return null;
          })
        ]);
        
        if (s) setStats(s);
        if (reports) setRecentReports(reports);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isDemo]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-industrial-teal rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-industrial-teal">En directo: Residencial Las Palmas</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-industrial-dark uppercase tracking-tight">Panel de Control</h2>
          <p className="text-gray-500 font-medium">Operativo para {user.displayName} {user.companyName ? `• ${user.companyName}` : ''}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none p-3 bg-white industrial-shadow rounded-xl text-gray-400 hover:text-industrial-teal transition-colors">
            <Search size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex-1 md:flex-none p-3 bg-white industrial-shadow rounded-xl text-gray-400 hover:text-industrial-teal transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-construction-orange rounded-full border-2 border-white" />
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl industrial-shadow border border-gray-100 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-industrial-dark">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          setNotifications(notifications.map(n => ({ ...n, read: true })));
                          setUnreadCount(0);
                        }}
                        className="text-[10px] text-industrial-teal font-bold uppercase hover:underline"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer ${n.read ? 'opacity-60' : ''}`}
                          onClick={() => {
                            // Mark single notification as read
                            const updated = notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif);
                            setNotifications(updated);
                            setUnreadCount(updated.filter(n => !n.read).length);
                            if (n.link) navigate(n.link);
                            setShowNotifications(false);
                          }}
                        >
                          <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-construction-orange'}`} />
                          <div>
                            <p className="font-bold text-sm text-industrial-dark">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">{n.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest">Sin notificaciones</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button 
            onClick={() => navigate('/projects')}
            variant="secondary" 
            className="flex-grow md:flex-none !h-12 !px-6"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Nuevo Proyecto</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Proyectos Activos', value: stats.activeProjects, icon: MapPin, color: 'text-industrial-teal', trend: '+2 este mes' },
          { label: 'Operarios Hoy', value: stats.activeWorkers, icon: UserIcon, color: 'text-construction-orange', trend: '98% asistencia' },
          { label: 'Albaranes Pendientes', value: stats.pendingNotes, icon: Truck, color: 'text-industrial-teal', trend: '3 urgentes' },
          { label: 'Presupuesto Ejec.', value: stats.totalHours, icon: BarChart3, color: 'text-construction-orange', trend: '-5% desviación' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => {
              if (stat.label.includes('Albaranes')) navigate('/notes');
              if (stat.label.includes('Proyectos')) navigate('/projects');
              if (stat.label.includes('Operarios')) navigate('/report');
            }}
            className="bg-white p-6 rounded-2xl industrial-shadow flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-industrial-teal/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-industrial-gray rounded-xl group-hover:bg-industrial-teal/10 transition-colors">
                <stat.icon size={20} className="text-gray-400" />
              </div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className={`text-4xl font-display font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white rounded-[32px] p-8 industrial-shadow relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-display font-bold uppercase tracking-widest">Actividad de Obra</h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-industrial-teal hover:underline transition-all">Ver Historial</button>
          </div>
          
          <div className="space-y-6">
            {recentReports.length > 0 ? recentReports.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-industrial-gray transition-colors cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-industrial-teal/5 text-industrial-teal`}>
                  <ClipboardList size={20}/>
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-industrial-dark group-hover:text-industrial-teal transition-colors">Parte Diario {item.status === 'SIGNED' ? 'Firmado' : 'Borrador'}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{item.projectId} • {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 self-center" />
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ClipboardList size={40} className="opacity-20 mb-2" />
                <p className="text-xs uppercase font-bold tracking-widest">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-industrial-dark rounded-[32px] p-8 text-white industrial-shadow flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-display font-bold uppercase tracking-widest mb-6">Estado Global</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span>Presupuesto Consumido</span>
                  <span className="text-construction-orange">72%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-construction-orange" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span>Cumplimiento Plazos</span>
                  <span className="text-industrial-teal">94%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-industrial-teal" />
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-12 !border-white/20 !text-white hover:!bg-white/10">
              Analítica IA <BarChart3 size={16} />
            </Button>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-industrial-teal/10 rounded-full blur-3xl pointer-events-none" />
        </section>
      </div>
    </div>
  );
};

// --- Layout & Auth ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        setIsDemo(false);
        // Init profile in Firestore if it doesn't exist
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const newUser = {
            email: u.email,
            displayName: u.displayName,
            role: null, // To be set in onboarding
            companyId: null, // To be set in onboarding
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newUser);
          setUser({ ...u, ...newUser });
        } else {
          setUser({ ...u, ...snap.data() });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const startDemo = () => {
    setIsDemo(true);
    setUser({
      displayName: 'Usuario Demo (ObraService)',
      email: 'demo@obraservice.com',
      role: 'CONSTRUCTORA',
      isDemo: true
    });
  };

  const handleSignOut = () => {
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
    } else {
      signOut(auth);
    }
  };

  if (loading) return (
/* ... loading block ... */
    <div className="h-screen w-screen flex items-center justify-center bg-industrial-gray">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-industrial-teal"
      >
        <Hammer size={48} />
      </motion.div>
    </div>
  );

  return (
    <Router>
      {!user ? (
        <Landing onDemo={startDemo} />
      ) : !user.companyId && !isDemo ? (
        <Onboarding user={user} onComplete={(updatedUser) => setUser(updatedUser)} />
      ) : (
        <AuthenticatedLayout user={user} isDemo={isDemo} handleSignOut={handleSignOut} />
      )}
    </Router>
  );
}

const AuthenticatedLayout = ({ user, isDemo, handleSignOut }: any) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-industrial-gray">
          {isDemo && (
            <div className="fixed top-0 left-0 right-0 bg-construction-orange text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 z-[100] text-center">
              Modo Demo - Los datos no se guardarán permanentemente
            </div>
          )}
          {/* Mobile Header */}
          <div className={`md:hidden bg-industrial-dark p-4 flex justify-between items-center text-white sticky top-0 z-[110] shadow-xl ${isDemo ? 'mt-6' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="bg-construction-orange p-1.5 rounded-lg">
                <Hammer size={18} />
              </div>
              <span className="font-display font-bold text-xl tracking-tighter">OBRASERVICE</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={18} />
              </button>
              <button onClick={handleSignOut} className="p-2 text-red-400 active:scale-95 transition-all">
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <nav className="hidden md:flex flex-col w-72 bg-industrial-dark text-white p-6 sticky top-0 h-screen border-r border-white/5 shadow-2xl z-[120]">
            <div className={`flex items-center gap-3 mb-10 ${isDemo ? 'mt-6' : ''}`}>
              <div className="bg-construction-orange p-2.5 rounded-xl shadow-lg shadow-construction-orange/20">
                <Hammer size={24} />
              </div>
              <span className="font-display font-bold text-2xl tracking-tighter">OBRASERVICE</span>
            </div>

            <div className="space-y-1 flex-grow">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 ml-4">Empresa</div>
              <SidebarLink to="/" icon={<BarChart3 size={20} />} label="Dashboard" />
              <SidebarLink to="/report" icon={<ClipboardList size={20} />} label="Daily Report" />
              <SidebarLink to="/notes" icon={<Truck size={20} />} label="Albaranes" />
              <SidebarLink to="/projects" icon={<MapPin size={20} />} label="Proyectos" />
              <SidebarLink to="/team" icon={<UserIcon size={20} />} label="Operarios" />
              
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-8 mb-4 ml-4">Sistema</div>
              <SidebarLink to="/settings" icon={<Settings size={20} />} label="Configuración" />
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-industrial-teal flex items-center justify-center font-bold text-xs">
                  {user.displayName?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate capitalize">{user.companyName || user.role?.toLowerCase()}</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-display font-bold tracking-widest text-[10px] uppercase">Cerrar Sesión</span>
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-grow pb-16 md:pb-0 overflow-y-auto max-h-screen">
            <AnimatePresence mode="wait">
              <Routes location={location}>
                <Route path="/" element={
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Dashboard user={user} isDemo={isDemo} />
                  </motion.div>
                } />
                <Route path="/report" element={
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <DailyReport user={user} isDemo={isDemo} />
                  </motion.div>
                } />
                <Route path="/notes" element={
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <DeliveryNotes user={user} isDemo={isDemo} />
                  </motion.div>
                } />
                <Route path="/projects" element={
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Projects user={user} isDemo={isDemo} />
                  </motion.div>
                } />
                <Route path="/team" element={
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Team user={user} isDemo={isDemo} />
                  </motion.div>
                } />
                <Route path="/settings" element={
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <SettingsPage user={user} isDemo={isDemo} />
                  </motion.div>
                } />
                <Route path="*" element={<div className="p-8">Sección en desarrollo</div>} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50">
            <MobileLink to="/" icon={<BarChart3 />} />
            <MobileLink to="/report" icon={<ClipboardList />} />
            <MobileLink to="/notes" icon={<Truck />} />
            <MobileLink to="/projects" icon={<MapPin />} />
      </div>
    </div>
  );
};

function SidebarLink({ to, icon, label }: any) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
        isActive ? 'bg-industrial-teal text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="font-bold tracking-widest text-xs uppercase">{label}</span>
    </Link>
  );
}

function MobileLink({ to, icon }: any) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link 
      to={to} 
      className={`p-3 rounded-full transition-all ${
        isActive ? 'bg-industrial-teal text-white shadow-lg -translate-y-2' : 'text-gray-400'
      }`}
    >
      {icon}
    </Link>
  );
}
