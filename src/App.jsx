import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { authService, promptService, userService } from './services/api';
import { LogIn, LogOut, BookOpen, GraduationCap, Sparkles, CheckCircle, Lock, LayoutDashboard, MessageCircle, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar user={user} logout={logout} />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login onLogin={login} />} />
            <Route path="/register" element={<Register onLogin={login} />} />
            <Route 
              path="/dashboard" 
              element={token ? <Dashboard token={token} user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

// --- Components ---

const Navbar = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="container flex items-center justify-between py-6 relative z-50">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
        <Wand2 className="text-primary" size={32} />
        <span>SIMENA <span className="text-sm font-normal text-text-muted hidden md:inline ml-2">| Mejora tus Prompts</span></span>
      </Link>
      
      {/* Desktop Links */}
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-text-muted hover:text-error transition-colors">
              <LogOut size={20} /> Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-primary transition-colors">Iniciar Sesión</Link>
            <Link to="/register" className="btn-primary">Registrarse</Link>
          </>
        )}
      </div>

      {/* Mobile Toggle */}
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <LogOut size={28} className="rotate-45" /> : <BookOpen size={28} />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 glass-card p-6 flex flex-col gap-4 md:hidden z-50"
          >
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 py-2 border-b border-glass-border">
                  <LayoutDashboard size={24} /> Dashboard
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-4 py-2 text-error">
                  <LogOut size={24} /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="py-2 border-b border-glass-border">Iniciar Sesión</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center">Registrarse</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Landing = () => (
  <div className="container py-12 md:py-20 text-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
        Domina la IA con <br /> Prompts Perfectos
      </h1>
      <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 px-4">
        Aprende a comunicarte con la inteligencia artificial. Evaluamos tu nivel y te entregamos 
        los mejores prompts o corregimos los tuyos para resultados increíbles.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
        <Link to="/register" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto">Empieza Gratis</Link>
      </div>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-6 mt-20 md:mt-32">
      {[
        { icon: <BookOpen />, title: '50+ Prompts por Materia', desc: 'Contenido curado para cada nivel educativo.' },
        { icon: <GraduationCap />, title: 'Primaria y Secundaria', desc: 'Adaptado al desarrollo cognitivo de tus alumnos.' },
        { icon: <CheckCircle />, title: 'Listos para Usar', desc: 'Copia, pega y transforma tu aula al instante.' }
      ].map((feature, i) => (
        <motion.div 
          key={i}
          whileHover={{ scale: 1.05 }}
          className="glass-card flex flex-col items-center text-center"
        >
          <div className="p-4 bg-primary/20 rounded-2xl text-primary mb-6">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-text-muted">{feature.desc}</p>
        </motion.div>
      ))}
    </div>

    <div className="mt-32">
      <h2 className="text-3xl md:text-5xl font-bold mb-12">Preguntas Frecuentes</h2>
      <FAQ />
    </div>
  </div>
);

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="container max-w-md py-20">
      <div className="glass-card">
        <h2 className="text-3xl font-bold mb-6 text-center">Bienvenido de nuevo</h2>
        {error && <p className="text-error mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary w-full py-4 mt-4">Entrar</button>
        </form>
        <p className="mt-6 text-center text-text-muted">
          ¿No tienes cuenta? <Link to="/register" className="text-primary">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

const Register = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('bajo');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(name, email, password, experienceLevel);
      const data = await authService.login(email, password);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="container max-w-md py-20">
      <div className="glass-card">
        <h2 className="text-3xl font-bold mb-6 text-center">Crea tu cuenta</h2>
        {error && <p className="text-error mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <label className="block text-sm font-bold mb-2 text-text-muted uppercase tracking-wider text-left mt-4">Nivel de Experiencia con IA</label>
          <select 
            value={experienceLevel} 
            onChange={(e) => setExperienceLevel(e.target.value)} 
            className="w-full bg-background/50 border border-glass-border rounded-xl p-4 text-text focus:outline-none focus:border-primary transition-colors mb-4"
          >
            <option value="bajo">Bajo (Principiante)</option>
            <option value="intermedio">Intermedio (Avanzado)</option>
          </select>

          <button type="submit" className="btn-primary w-full py-4 mt-4">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ token, user, setUser }) => {
  const [view, setView] = useState('library'); // 'library', 'guide', or 'correction'
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    if (view === 'library') {
      const fetchPrompts = async () => {
        try {
          const data = await promptService.getList();
          setPrompts(data);
          setLoading(false);
        } catch (err) {
          setLoading(false);
        }
      };
      fetchPrompts();
    }
  }, [token, view]);

  const fetchContent = async (id) => {
    try {
      const data = await promptService.getContent(id);
      setSelectedPrompt(data);
      setAccessError('');
    } catch (err) {
      setAccessError(err.response?.data?.message || 'Error de acceso');
      setSelectedPrompt(null);
    }
  };

  const handleTogglePayment = async () => {
    try {
      const data = await userService.togglePayment();
      setUser({ ...user, pago: data.pago });
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      updatedUser.pago = data.pago;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container py-20 text-center">Cargando...</div>;

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Hola, {user.name}</h1>
            <p className="text-text-muted">Potencia tus clases con IA</p>
          </div>
          <div className="segmented-control w-fit">
            <button 
              onClick={() => setView('library')}
              className={`tab-btn ${view === 'library' ? 'active' : ''}`}
            >
              Biblioteca
            </button>
            <button 
              onClick={() => setView('guide')}
              className={`tab-btn ${view === 'guide' ? 'active' : ''}`}
            >
              Guía de Prompts
            </button>
            <button 
              onClick={() => setView('correction')}
              className={`tab-btn ${view === 'correction' ? 'active' : ''}`}
            >
              Corregir Prompt
            </button>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <div className={`px-4 py-1 rounded-full text-sm font-bold ${user.pago ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
            {user.pago ? 'PRO (Acceso Total)' : 'GRATIS (Acceso Limitado)'}
          </div>
          {!user.pago && (
            <button onClick={handleTogglePayment} className="text-xs text-primary underline">
              Simular Pago (Prueba)
            </button>
          )}
        </div>
      </div>

      {view === 'library' ? (
        <div className="dashboard-layout">
          <div className="prompt-list space-y-4 custom-scrollbar">
            {prompts.map(p => (
              <div 
                key={p.id} 
                onClick={() => fetchContent(p.id)}
                className={`glass-card p-4 cursor-pointer transition-all hover:border-primary ${selectedPrompt?.id === p.id ? 'border-primary bg-primary/10' : ''}`}
              >
                <h4 className="font-bold">{p.title}</h4>
                <p className="text-xs text-text-muted mt-1">{p.subject} • {p.level}</p>
              </div>
            ))}
          </div>

          <div className="min-h-[300px]">
            {selectedPrompt ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card h-full"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">{selectedPrompt.title}</h2>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm">{selectedPrompt.subject}</span>
                </div>
                <div className="bg-background/50 p-4 md:p-6 rounded-xl border border-glass-border mb-6">
                  <p className="whitespace-pre-wrap text-sm md:text-base">{selectedPrompt.content}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigator.clipboard.writeText(selectedPrompt.content)}
                    className="btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <Sparkles size={18} /> Copiar Prompt
                  </button>
                  
                  {user.pago && (
                    <>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedPrompt.content);
                          window.open('https://gemini.google.com/app?hl=es', '_blank');
                        }}
                        className="glass-card !py-3 !px-6 !rounded-xl flex items-center gap-2 flex-1 sm:flex-none justify-center border-primary/30 hover:border-primary transition-all"
                      >
                        <Sparkles size={18} className="text-primary" /> Gemini
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedPrompt.content);
                          window.open('https://chatgpt.com/', '_blank');
                        }}
                        className="glass-card !py-3 !px-6 !rounded-xl flex items-center gap-2 flex-1 sm:flex-none justify-center border-secondary/30 hover:border-secondary transition-all"
                      >
                        <Sparkles size={18} className="text-secondary" /> ChatGPT
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : accessError ? (
              <div className="glass-card flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <div className="p-6 bg-error/10 rounded-full text-error mb-6">
                  <Lock size={48} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Contenido Premium</h2>
                <p className="text-text-muted max-w-sm mb-6 text-sm">
                  {accessError} Suscríbete para desbloquear todos los prompts.
                </p>
                <button onClick={handleTogglePayment} className="btn-primary w-full sm:w-auto">Suscribirse Ahora</button>
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center min-h-[400px] text-text-muted text-center">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p>Selecciona un prompt para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      ) : view === 'guide' ? (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="glass-card">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Sparkles className="text-primary" /> ¿Cómo funciona la IA?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-text-muted leading-relaxed mb-4">
                  Imagina a la IA como un asistente que ha leído casi todo lo escrito en internet. No "piensa" como nosotros, sino que **predice la siguiente palabra más probable** basándose en patrones.
                </p>
                <p className="text-text-muted leading-relaxed">
                  Cuanto más contexto le des, más precisa será su predicción. Por eso, un buen prompt es la diferencia entre una respuesta genérica y una herramienta educativa poderosa.
                </p>
              </div>
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <h4 className="font-bold mb-3 text-primary">El Secreto de los Maestros</h4>
                <p className="text-sm italic">"La IA es como un estudiante brillante pero que necesita instrucciones extremadamente claras."</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card border-none bg-white/5">
              <h3 className="text-xl font-bold mb-6 text-secondary">La Fórmula Maestra</h3>
              <div className="space-y-6">
                <div className="guide-step" data-step="R">
                  <h4 className="font-bold">Rol</h4>
                  <p className="text-sm text-text-muted">Define la identidad de la IA (ej: Especialista en Educación).</p>
                </div>
                <div className="guide-step" data-step="C">
                  <h4 className="font-bold">Contexto</h4>
                  <p className="text-sm text-text-muted">Describe el escenario y tus alumnos.</p>
                </div>
                <div className="guide-step" data-step="T">
                  <h4 className="font-bold">Tarea</h4>
                  <p className="text-sm text-text-muted">El objetivo concreto que buscas lograr.</p>
                </div>
                <div className="guide-step" data-step="C">
                  <h4 className="font-bold">Constricción</h4>
                  <p className="text-sm text-text-muted">Límites y reglas específicas a seguir.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-card border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="font-bold">💡 Tip Pro #1</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">Pide a la IA que te haga preguntas antes de generar el resultado. Esto asegura que tenga toda la información necesaria.</p>
              </div>
              
              <div className="glass-card border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <CheckCircle size={16} />
                  </div>
                  <h3 className="font-bold">💡 Tip Pro #2</h3>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">Usa ejemplos reales. Copia un formato que te guste y dile: "Imita este estilo pero con el nuevo tema".</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <PromptCorrection user={user} />
      )}
    </div>
  );
};


const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const questions = [
    {
      q: "¿Qué es SIMENA?",
      a: "SIMENA es una plataforma diseñada para empoderar a maestros con herramientas de Inteligencia Artificial, proporcionando prompts curados y guías prácticas para mejorar la enseñanza."
    },
    {
      q: "¿Cómo puedo acceder a los prompts premium?",
      a: "Puedes acceder a todo el contenido premium mediante una suscripción activa. Esto te permite ver prompts avanzados y usar atajos directos a ChatGPT y Gemini."
    },
    {
      q: "¿Los prompts funcionan para cualquier materia?",
      a: "Sí, tenemos prompts diseñados para Matemáticas, Ciencias, Lenguaje, Historia y muchas más, adaptados tanto para primaria como para secundaria."
    },
    {
      q: "¿Puedo sugerir nuevos prompts?",
      a: "¡Claro! Estamos en constante crecimiento. Puedes contactarnos por WhatsApp para enviarnos tus sugerencias o feedback."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto text-left">
      {questions.map((item, i) => (
        <div key={i} className="faq-item">
          <button 
            className="faq-question"
            onClick={() => setActiveIndex(activeIndex === i ? null : i)}
          >
            <span>{item.q}</span>
            {activeIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <AnimatePresence>
            {activeIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="faq-answer"
              >
                <p>{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const INTENT_OPTIONS = [
  { value: 'auto', label: '🤖 Detectar automáticamente' },
  { value: 'planeacion', label: '📚 Plan de clase' },
  { value: 'examen', label: '📝 Examen / Prueba' },
  { value: 'rubrica', label: '📊 Rúbrica de evaluación' },
  { value: 'tarea_o_guia', label: '📋 Guía / Taller' },
  { value: 'comunicacion', label: '✉️ Carta / Comunicado' },
  { value: 'convivencia', label: '🤝 Convivencia / Conflicto' },
  { value: 'reunion', label: '🕐 Reunión escolar' },
  { value: 'proyecto', label: '🎯 Proyecto pedagógico' },
  { value: 'explicacion', label: '💡 Explicación de concepto' },
  { value: 'inclusion', label: '♿ Inclusión / NEE' },
];

const EXAMPLES = [
  { bad: 'hazme una clase', good: 'Quiero planear una clase de fracciones para cuarto de primaria, duración 45 minutos' },
  { bad: 'un examen de ciencias', good: 'Diseña un examen de ciencias naturales para quinto grado con 10 preguntas de selección múltiple' },
  { bad: 'carta para padres', good: 'Necesito una carta formal para citar a los padres de un estudiante por bajo rendimiento en matemáticas' },
];

const PromptCorrection = ({ user }) => {
  const [input, setInput] = useState('');
  const [manualIntent, setManualIntent] = useState('auto');
  const [result, setResult] = useState(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCorrect = async () => {
    if (!input.trim()) return;
    setIsCorrecting(true);
    setError('');
    setResult(null);
    
    try {
      const data = await promptService.review(input, manualIntent);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al corregir el prompt.');
    } finally {
      setIsCorrecting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Ejemplos antes/después */}
      <div className="glass-card">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Wand2 className="text-primary" /> Mejorador de Prompts
        </h2>
        <p className="text-text-muted mb-6">
          Escribe tu idea y la transformaremos en un prompt profesional. Cuantos más detalles des, mejor será el resultado.
        </p>

        <div className="mb-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">💡 Ejemplos — antes y después</p>
          <div className="grid md:grid-cols-3 gap-3">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className="bg-background/40 border border-glass-border rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-error font-bold shrink-0">✗</span>
                  <span className="text-text-muted italic">"{ex.bad}"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-success font-bold shrink-0">✓</span>
                  <span className="text-text">"{ex.good}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="glass-card space-y-5">
        {/* Selector de categoría */}
        <div>
          <label className="block text-sm font-bold mb-2 text-text-muted uppercase tracking-wider">
            ¿Qué tipo de recurso necesitas? (opcional)
          </label>
          <select
            value={manualIntent}
            onChange={(e) => setManualIntent(e.target.value)}
            className="w-full bg-background/50 border border-glass-border rounded-xl p-3 text-text focus:outline-none focus:border-primary transition-colors"
          >
            {INTENT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-1">Si no estás seguro, déjalo en "Detectar automáticamente".</p>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-sm font-bold mb-2 text-text-muted uppercase tracking-wider">
            Describe lo que necesitas
          </label>
          <textarea 
            placeholder="Ej: Quiero una clase de fracciones para cuarto de primaria. La duración es de 45 minutos..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
          />
          <p className="text-xs text-text-muted mt-1">
            Tip: menciona el grado, la materia y el objetivo. Cuanto más detallado, mejor el resultado.
          </p>
        </div>

        <button 
          onClick={handleCorrect}
          disabled={isCorrecting || !input.trim()}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isCorrecting ? (
            <><Sparkles size={20} className="animate-spin" /> Analizando con IA...</>
          ) : (
            <><Wand2 size={20} /> Mejorar Mi Prompt</>
          )}
        </button>

        {error && <p className="text-error text-center">{error}</p>}
      </div>

      {/* Resultado */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Badge de intención detectada */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Categoría detectada:</span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary/20 text-primary border border-primary/30">
              {result.detectedIntentLabel || 'Solicitud General'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Consejos */}
            <div className="glass-card bg-secondary/5 border-secondary/20">
              <h4 className="font-bold mb-4 text-secondary flex items-center gap-2 text-lg">
                <Sparkles size={18} /> Consejos para tu prompt
              </h4>
              <div className="space-y-3">
                {result.advice.split('\n').filter(l => l.trim()).map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed text-text-muted">{line}</p>
                ))}
              </div>
            </div>

            {/* Prompt mejorado */}
            <div className="glass-card bg-primary/5 border-primary/20">
              <h4 className="font-bold mb-4 text-primary flex items-center gap-2 text-lg">
                <CheckCircle size={18} /> Tu Prompt Mejorado
              </h4>
              <div className="bg-background/50 p-4 rounded-xl border border-glass-border mb-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.improvedPrompt}</p>
              </div>
              <button 
                onClick={() => handleCopy(result.improvedPrompt)}
                className={`btn-primary w-full py-3 flex items-center justify-center gap-2 transition-all ${copied ? 'bg-success/80' : ''}`}
              >
                {copied ? (
                  <><CheckCircle size={18} /> ¡Copiado al portapapeles!</>
                ) : (
                  <><Sparkles size={18} /> Copiar Prompt Mejorado</>
                )}
              </button>
              {user?.pago && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { handleCopy(result.improvedPrompt); window.open('https://gemini.google.com/app?hl=es', '_blank'); }}
                    className="glass-card !py-2 !px-4 !rounded-xl flex items-center gap-2 flex-1 justify-center border-primary/30 hover:border-primary transition-all text-sm"
                  >
                    <Sparkles size={14} className="text-primary" /> Pegar en Gemini
                  </button>
                  <button
                    onClick={() => { handleCopy(result.improvedPrompt); window.open('https://chatgpt.com/', '_blank'); }}
                    className="glass-card !py-2 !px-4 !rounded-xl flex items-center gap-2 flex-1 justify-center border-secondary/30 hover:border-secondary transition-all text-sm"
                  >
                    <Sparkles size={14} className="text-secondary" /> Pegar en ChatGPT
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};



const Footer = () => (
  <footer className="footer">
    <div className="container text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter opacity-50">
          <Wand2 size={24} />
          <span>SIMENA</span>
        </div>
        <p className="text-text-muted text-sm max-w-md">
          Tu compañero para crear los mejores prompts de Inteligencia Artificial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <a href="https://wa.me/573183763021" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-muted hover:text-success transition-colors">
            <MessageCircle size={18} /> +57 3183763021
          </a>
          <a href="https://wa.me/573146848215" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-muted hover:text-success transition-colors">
            <MessageCircle size={18} /> +57 3146848215
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-glass-border w-full max-w-xs">
          <p className="text-xs text-text-muted">
            Pagina realizada por <br />
            <a href="https://bcode-one.vercel.app" target="_blank" rel="noopener noreferrer" className="bcode-link text-lg">
              bcode-one.vercel.app
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default App;
