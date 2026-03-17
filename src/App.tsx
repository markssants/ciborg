import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  Music,
  Calendar,
  User,
  Image as ImageIcon,
  Download,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Play,
  ExternalLink,
  ChevronRight,
  Disc,
  Palette,
  Upload,
  Sparkles,
  Wand2,
  Loader2,
  RefreshCw,
  Cpu,
  Cloud,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import logoImg from '../midia/LOGO_CIBORG.png';
import hiloImg from '../midia/LOGO_hilo.png';
import heroImg from '../midia/imageheader.png';
import aboutImg from '../midia/image1.png';
import imageImg from '../midia/image.png';
import image2Img from '../midia/image2.png';
import image3Img from '../midia/image3.png';
import gallery1Img from '../midia/1.png';
import gallery2Img from '../midia/2.png';
import gallery3Img from '../midia/3.png';
import gallery4Img from '../midia/4.png';
import gallery5Img from '../midia/5.jpg';
import gallery6Img from '../midia/6.jpg';
import gallery7Img from '../midia/7.jpg';
import gallery8Img from '../midia/8.jpg';



// --- Components ---

// --- Components ---

const AIVisualizer = () => {
  const availablePhotos = [imageImg, aboutImg, image2Img];
  const [photo, setPhoto] = useState<string>(availablePhotos[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [creativityLevel, setCreativityLevel] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationsLeft, setGenerationsLeft] = useState<number>(7);

  const getApiKey = () => {
    return process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
  };

  React.useEffect(() => {
    const checkLimit = () => {
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('imagine_limit');
      
      if (storedData) {
        const { date, count } = JSON.parse(storedData);
        if (date === today) {
          setGenerationsLeft(Math.max(0, 7 - count));
        } else {
          localStorage.setItem('imagine_limit', JSON.stringify({ date: today, count: 0 }));
          setGenerationsLeft(7);
        }
      } else {
        localStorage.setItem('imagine_limit', JSON.stringify({ date: today, count: 0 }));
        setGenerationsLeft(7);
      }
    };

    checkLimit();
  }, []);

  const improvePrompt = async () => {
    if (!customPrompt.trim()) {
      setError("Digite algo no prompt para que eu possa melhorar.");
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      setError("Chave da API não encontrada. Por favor, configure a variável GEMINI_API_KEY no painel de Secrets (AI Studio) ou Environment Variables (Vercel).");
      return;
    }
    setIsImprovingPrompt(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Você é um especialista em engenharia de prompt para geração de imagens de IA. 
        O usuário forneceu o seguinte prompt inicial para um flyer de DJ: "${customPrompt}"
        
        Sua tarefa é expandir e melhorar este prompt para torná-lo mais descritivo, visual e eficaz para uma IA de geração de imagem. 
        Foque em detalhes de iluminação (neon, volumétrica), atmosfera (fumaça, partículas), estilo (cyberpunk, futurista, minimalista) e composição.
        Mantenha o prompt em português. 
        IMPORTANTE: Retorne APENAS o prompt melhorado, sem explicações ou introduções.`,
      });

      if (response.text) {
        setCustomPrompt(response.text.trim());
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Erro desconhecido";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        msg = "Limite de uso atingido. A cota gratuita desta chave de API acabou por agora. Tente novamente em alguns minutos ou use uma nova chave.";
      } else if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        msg = "A chave da API foi bloqueada por segurança (vazamento detectado) ou não tem permissão. Por favor, configure uma nova chave GEMINI_API_KEY nas variáveis de ambiente.";
      } else if (msg.includes("400") || msg.includes("INVALID_ARGUMENT") || msg.includes("expired")) {
        msg = "A chave da API expirou ou é inválida. Por favor, gere uma nova chave no Google AI Studio e atualize suas configurações.";
      }
      setError(`Erro ao melhorar o prompt: ${msg}`);
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateVisual = async () => {
    if (!photo) {
      setError("Por favor, selecione uma foto primeiro.");
      return;
    }

    if (generationsLeft <= 0) {
      setError("Você atingiu o limite de 7 gerações por dia. Volte amanhã!");
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      setError("Chave da API não encontrada. Por favor, configure a variável GEMINI_API_KEY no painel de Secrets (AI Studio) ou Environment Variables (Vercel).");
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-2.5-flash-image";

      const photoData = await getBase64FromUrl(photo);
      
      const creativityInstructions = creativityLevel < 30 
        ? "Mantenha a composition extremamente fiel à foto original, alterando apenas sutilmente a iluminação para um ambiente de DJ."
        : creativityLevel < 70
        ? "Equilibre a fidelidade da foto com elementos criativos de iluminação, fumaça e atmosfera de festival."
        : "Seja altamente criativo com o cenário, luzes e efeitos visuais, transformando o ambiente em algo épico e futurista, mas MANTENDO O ROSTO IDENTIFICÁVEL.";

      const basePrompt = `Crie um flyer de alta qualidade para um DJ de música eletrônica. 
      PRESERVAÇÃO DE IDENTIDADE ABSOLUTA: Você DEVE manter as características faciais EXATAS, a estrutura óssea e a identidade da pessoa na foto fornecida. O rosto na imagem gerada deve ser uma correspondência idêntica e fotorrealista de 1:1 com a imagem de origem. NÃO altere, embeleze ou estilize o rosto; ele deve ser perfeitamente reconhecível como a mesma pessoa real.
      NÍVEL DE CRIATIVIDADE: ${creativityInstructions}
      NÃO inclua nenhum logo ou marca d'água na imagem, foque apenas na foto do DJ e na ambientação.
      IMPORTANTE: NÃO adicione nenhum texto, palavras, letras ou números na imagem (como nomes de eventos, datas, locais ou 'DJ'), a menos que seja explicitamente solicitado pelo usuário no prompt customizado. Foque exclusivamente na arte visual, luzes, cores e na composição artística.`;

      const finalPrompt = customPrompt
        ? `${basePrompt} Instruções adicionais do usuário: ${customPrompt}. LEMBRE-SE: A fidelidade do rosto é a prioridade máxima.`
        : `${basePrompt} O estilo deve ser futurista, com luzes neon, fumaça e uma atmosfera de festival de techno melódico. Mantenha o rosto idêntico.`;

      const parts: any[] = [
        { inlineData: { data: photoData, mimeType: "image/png" } },
        { text: `A imagem fornecida é a foto do DJ.
        
        ${finalPrompt}` }
      ];

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: parts
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          
          // Update limit
          const today = new Date().toDateString();
          const storedData = localStorage.getItem('imagine_limit');
          if (storedData) {
            const { count } = JSON.parse(storedData);
            const newCount = count + 1;
            localStorage.setItem('imagine_limit', JSON.stringify({ date: today, count: newCount }));
            setGenerationsLeft(Math.max(0, 7 - newCount));
          }
          break;
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Erro de conexão ou API";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        msg = "Limite de gerações atingido! A cota gratuita da API do Gemini foi esgotada para esta chave. Tente novamente mais tarde ou configure uma nova chave de API.";
      } else if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        msg = "A chave da API foi bloqueada por segurança (vazamento detectado) ou não tem permissão. Por favor, configure uma nova chave GEMINI_API_KEY nas variáveis de ambiente.";
      } else if (msg.includes("400") || msg.includes("INVALID_ARGUMENT") || msg.includes("expired")) {
        msg = "A chave da API expirou ou é inválida. Por favor, gere uma nova chave no Google AI Studio e atualize suas configurações.";
      }
      setError(`Erro ao gerar imagem: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-display font-bold">Configuração do Criativo</h3>
            <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", generationsLeft > 0 ? "bg-emerald-500" : "bg-red-500")} />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                {generationsLeft} {generationsLeft === 1 ? 'restante' : 'restantes'} hoje
              </span>
            </div>
          </div>
          <p className="text-zinc-400 text-sm">Escolha uma das fotos e digite o que você imagina para o seu flyer.</p>

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Selecione sua Foto</label>
            <div className="grid grid-cols-3 gap-4">
              {availablePhotos.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setPhoto(imgUrl)}
                  className={cn(
                    "aspect-square rounded-2xl border-2 cursor-pointer transition-all overflow-hidden relative group",
                    photo === imgUrl ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt={`Option ${idx + 1}`} referrerPolicy="no-referrer" />
                  {photo === imgUrl && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <div className="bg-emerald-500 text-black rounded-full p-1">
                        <Sparkles size={12} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 glass-dark p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Nível de Criatividade</label>
              <span className="text-emerald-500 font-mono text-sm font-bold">{creativityLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-zinc-600 font-bold mt-1">
              <span>Fiel à Imagem</span>
              <span>Equilibrado</span>
              <span>Criativo</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Estilo / Prompt Customizado (Opcional)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Estilo cyberpunk, cores roxas e laranjas, ambiente de floresta mágica..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={improvePrompt}
              disabled={isGenerating || isImprovingPrompt || !customPrompt.trim()}
              className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Melhorar Prompt com IA"
            >
              {isImprovingPrompt ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              {isImprovingPrompt ? "Melhorando..." : "Melhorar"}
            </button>

            <button
              onClick={generateVisual}
              disabled={isGenerating || isImprovingPrompt || !photo || generationsLeft <= 0}
              className="flex-[2] bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {isGenerating ? "Gerando..." : "Imaginar"}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>

        <div className="relative aspect-[4/5] glass rounded-3xl overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" />
                </div>
                <p className="text-zinc-400 font-display uppercase tracking-[0.2em] text-xs">Processando Visual...</p>
              </motion.div>
            ) : generatedImage ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative group"
              >
                <img src={generatedImage} className="w-full h-full object-cover" alt="Generated Flyer" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={generatedImage}
                    download="dj-liquid-flyer.png"
                    className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    <Download size={14} /> Salvar Imagem
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="text-zinc-600" size={32} />
                </div>
                <p className="text-zinc-500 text-sm">O flyer gerado aparecerá aqui.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Section = ({ id, title, children, className }: { id: string, title: string, children: React.ReactNode, className?: string }) => (
  <section id={id} className={cn("py-24 px-6 relative", className)}>
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4">
          <span className="text-gradient uppercase">{title}</span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
      </motion.div>
      {children}
    </div>
  </section>
);

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

const GlassCard = ({ children, className }: GlassCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={cn("glass rounded-3xl p-8 transition-all duration-300", className)}
  >
    {children}
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [activeSection, setActiveSection] = useState<string | null>(null);

  React.useEffect(() => {
    const sections = ['sobre', 'agenda', 'músicas', 'sets', 'galeria', 'imagine', 'identidade', 'presskit', 'contato'];
    const observers: IntersectionObserver[] = [];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    // When scrolled back to top (hero), clear active section
    const heroObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActiveSection(null); },
      { threshold: 0.5 }
    );
    const heroEl = document.getElementById('hero');
    if (heroEl) { heroObs.observe(heroEl); observers.push(heroObs); }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const { scrollY } = useScroll();
  const blob1Y = useTransform(scrollY, [0, 3000], [0, -400]);
  const blob2Y = useTransform(scrollY, [0, 3000], [0, -200]);
  const blob3Y = useTransform(scrollY, [0, 3000], [0, -600]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá! Meu nome é ${formData.name}. Meu email é ${formData.email}. Mensagem: ${formData.message}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/5519974230470?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30">
      {/* Background Elements - Parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div style={{ y: blob1Y }} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] animate-blob" />
        <motion.div style={{ y: blob2Y }} className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <motion.div style={{ y: blob3Y }} className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl">
        <div className="glass-dark rounded-full px-8 py-3 flex items-center justify-between border-white/10">
          <div className="flex-1 flex items-center justify-start">
            <button onClick={() => scrollToSection('hero')} className="focus:outline-none cursor-pointer bg-transparent border-none p-0">
              <img src={logoImg} alt="Ciborg Logo" className="h-8 md:h-10 object-contain" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-400 relative">
            {['Sobre', 'Agenda', 'Músicas', 'Sets', 'Galeria', 'Imagine', 'Presskit'].map((item) => {
              const id = item.toLowerCase();
              // Presskit pill is active for both #identidade and #presskit
              const isActive = item === 'Presskit'
                ? (activeSection === 'presskit' || activeSection === 'identidade')
                : activeSection === id;
              // Presskit scrolls to #identidade
              const targetId = item === 'Presskit' ? 'identidade' : id;
              return (
                <a
                  key={item}
                  href={`#${targetId}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection(targetId); }}
                  className={`relative px-3 py-1.5 uppercase tracking-widest transition-colors duration-300 rounded-full z-10 cursor-pointer ${isActive ? 'text-black font-bold' : 'hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item}
                </a>
              );
            })}
          </div>
          <div className="flex-1 flex items-center justify-end">
            <button
              onClick={() => scrollToSection('contato')}
              className="relative text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors cursor-pointer"
              style={{ color: (activeSection === null || activeSection === 'contato') ? 'black' : 'white' }}
            >
              {(activeSection === null || activeSection === 'contato') && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Contato
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center z-10"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-8 group"
          >
            {/* CIB | Photo | ORG layout */}
            <div className="flex items-center justify-center gap-1 md:gap-2">

              {/* CIB Waveform */}
              <div className="pointer-events-none flex-shrink-0 -mr-2 md:-mr-4 lg:-mr-5">
                <svg viewBox="0 0 360 180" className="h-16 md:h-28 lg:h-36 w-auto" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="wave-grad-l" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
                    </linearGradient>
                    <clipPath id="cib-clip">
                      <text x="180" y="154" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="168" letterSpacing="-6">CIB</text>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#cib-clip)">
                    {[...Array(60)].map((_, i) => {
                      const barW = 360 / 60;
                      return (
                        <motion.rect
                          key={i}
                          x={i * barW + 0.5}
                          y={0}
                          width={barW - 1.5}
                          height={180}
                          fill="url(#wave-grad-l)"
                          style={{ transformOrigin: `${i * barW + barW / 2}px 90px` }}
                          animate={{ scaleY: [0.15, 0.6, 0.3, 0.9, 0.2, 0.75, 0.15], opacity: [0.6, 1, 0.7, 1, 0.6, 1, 0.6] }}
                          transition={{ duration: 3.5 + Math.abs(Math.sin(i * 0.3)) * 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
                        />
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Photo Circle */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 flex-shrink-0 rounded-full p-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 animate-glow relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-black/20">
                  <img
                    src={heroImg}
                    alt="DJ Ciborg"
                    className="w-full h-full object-cover grayscale-0 hover:grayscale transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* ORG Waveform */}
              <div className="pointer-events-none flex-shrink-0 -ml-4 md:-ml-7 lg:-ml-9">
                <svg viewBox="0 0 360 180" className="h-16 md:h-28 lg:h-36 w-auto" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="wave-grad-r" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
                    </linearGradient>
                    <clipPath id="org-clip">
                      <text x="180" y="154" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="168" letterSpacing="-6">RG</text>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#org-clip)">
                    {[...Array(60)].map((_, i) => {
                      const barW = 360 / 60;
                      return (
                        <motion.rect
                          key={i}
                          x={i * barW + 0.5}
                          y={0}
                          width={barW - 1.5}
                          height={180}
                          fill="url(#wave-grad-r)"
                          style={{ transformOrigin: `${i * barW + barW / 2}px 90px` }}
                          animate={{ scaleY: [0.2, 0.7, 0.25, 0.95, 0.15, 0.8, 0.2], opacity: [0.6, 1, 0.7, 1, 0.6, 1, 0.6] }}
                          transition={{ duration: 3.8 + Math.abs(Math.sin(i * 0.25)) * 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.055 }}
                        />
                      );
                    })}
                  </g>
                </svg>
              </div>

            </div>
          </motion.div>
          <motion.p
            className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto font-light tracking-wide mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Produtor musical e DJ especializado. Músicas extremamente envolventes, com groove inovador, dando muita energia e emoção ao escutá-las.
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <a href="#músicas" className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2">
              <Play size={18} fill="currentColor" /> Ouvir Agora
            </a>
            <a href="#imagine" onClick={(e) => { e.preventDefault(); scrollToSection('imagine'); }} className="glass px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              Imagine
            </a>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-10 md:left-20 glass p-4 rounded-2xl opacity-20 hidden md:block"
          >
            <Disc size={40} className="text-emerald-500" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-10 md:right-20 glass p-4 rounded-2xl opacity-20 hidden md:block"
          >
            <Music size={40} className="text-blue-500" />
          </motion.div>
        </div>
      </section>

      {/* Sobre Section */}
      <Section id="sobre" title="Sobre">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass p-2">
              <img
                src={aboutImg}
                alt="DJ Profile"
                className="w-full h-full object-cover rounded-2xl grayscale-0 hover:grayscale transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 glass p-6 rounded-2xl animate-float">
              <div className="text-3xl font-bold text-emerald-400">8+</div>
              <div className="text-xs uppercase tracking-widest text-white">Anos de Estrada</div>
            </div>
          </motion.div>
          <div className="space-y-6">
            <p className="text-xl text-zinc-300 leading-relaxed font-light">
              Com uma carreira forjada nas pistas mais vibrantes do país, <span className="text-white font-medium">Ciborg</span> traz uma fusão única de sonoridades etéreas e grooves profundos.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Sua jornada começou nos clubes underground de São Paulo, onde desenvolveu uma sensibilidade aguçada para a leitura de pista. Hoje, suas produções são reconhecidas pela complexidade rítmica e atmosferas envolventes que transportam o público para uma jornada sensorial completa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <GlassCard className="p-4">
                <div className="text-emerald-500 mb-2"><Disc size={24} /></div>
                <div className="text-sm font-bold uppercase tracking-tighter">Techno</div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="text-blue-500 mb-2"><Music size={24} /></div>
                <div className="text-sm font-bold uppercase tracking-tighter">Prog Trance</div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="text-purple-500 mb-2"><Cpu size={24} /></div>
                <div className="text-sm font-bold uppercase tracking-tighter">Produtor</div>
              </GlassCard>
            </div>
          </div>
        </div>
      </Section>

      {/* Agenda Section */}
      <Section id="agenda" title="Agenda" className="bg-zinc-900/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { date: '01 MAR', event: 'Farofa Trance', city: 'Club A, SP', status: 'Ingressos' },
            { date: '01 MAR', event: 'Prog Revolution', city: 'Sítio Quero Quero, SP', status: 'Ingressos' },
            { date: '01 MAR', event: 'Sociedélic', city: 'Synaptic Stage, SP', status: 'Ingressos' },
            { date: '01 MAR', event: 'Insight Festival', city: 'Festival Grounds, SP', status: 'Ingressos' },
          ].map((gig, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="text-2xl font-display font-black text-emerald-500 w-20">{gig.date}</div>
                <div>
                  <div className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{gig.event}</div>
                  <div className="text-zinc-500 text-sm uppercase tracking-widest">{gig.city}</div>
                </div>
              </div>
              {gig.status === 'Sold Out' ? (
                <button disabled className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-zinc-800 text-zinc-500 cursor-not-allowed">
                  Sold Out
                </button>
              ) : (
                <a
                  href={`https://wa.me/5519974230470?text=${encodeURIComponent(`Quero comprar ingresso da festa ${gig.event}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-emerald-500 transition-all"
                >
                  {gig.status}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Musicas Section */}
      <Section id="músicas" title="Músicas">
        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-0 overflow-hidden h-fit">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/artist/25hq9w7IwFxbfDYeyyrCFQ?utm_source=generator"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </GlassCard>
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-display font-bold">Últimos Lançamentos</h3>
              <p className="text-zinc-400">Ouça as últimas produções e remixes originais lançados pelo Ciborg.</p>
            </div>
            <div className="space-y-4">
              {[
                { title: 'PROFANA', label: 'PsyTrance Rmx', year: '2026', url: 'https://soundcloud.com/ciborgmusic/profana-psytrance-rmx' },
                { title: 'TERRA', label: 'CIBORG & NIKBASS', year: '2025', url: 'https://soundcloud.com/ciborgmusic/terra_ciborg-nikbass-rmx' },
                { title: 'Neon ERVA DA JAMAICA SQUARE', label: 'REMIX', year: '2025', url: 'https://soundcloud.com/ciborgmusic/erva-da-jamaica-square-remix' },
              ].map((track, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-white/5 group hover:bg-white/5 transition-all rounded-xl">
                  <div className="flex items-center gap-4">
                    {track.url ? (
                      <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer"
                      >
                        <Play size={16} fill="currentColor" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <Play size={16} fill="currentColor" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold">{track.title}</div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest">{track.label}</div>
                    </div>
                  </div>
                  <div className="text-zinc-600 font-mono text-sm">{track.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 pt-12">
          <a href="https://open.spotify.com/artist/25hq9w7IwFxbfDYeyyrCFQ?si=UqQm5SUvQl6Bn0J6pGIIeA" target="_blank" rel="noopener noreferrer" className="text-emerald-400 flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">
            Ver Perfil no Spotify <ExternalLink size={14} />
          </a>
          <a href="https://on.soundcloud.com/Ka7gT4Yic4gGZRQm8" target="_blank" rel="noopener noreferrer" className="text-orange-500 flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">
            Ver Perfil no SoundCloud <ExternalLink size={14} />
          </a>
        </div>
      </Section>

      {/* Sets Section */}
      <Section id="sets" title="Sets" className="bg-zinc-900/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '420 Voltz',
              duration: '54:05m – VÍDEO',
              image: 'https://i.ytimg.com/vi/LNemyWpftZg/hqdefault.jpg?sqp=-oaymwFBCNACELwBSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGEsgRShlMA8=&rs=AOn4CLDJamivv3Ys63CCjBFVW3jnp_IDiQ',
              url: 'https://youtu.be/LNemyWpftZg'
            },
            {
              title: 'Xingu',
              duration: '1h 01:36m - VÍDEO',
              image: 'https://i1.sndcdn.com/artworks-000636988027-hgossn-t1080x1080.jpg',
              url: 'https://youtu.be/EUri3iqPgH8'
            },
            {
              title: 'ARENA EPICO',
              duration: '1h 27:26m - ÁUDIO',
              image: 'https://i1.sndcdn.com/artworks-n9ZV8bd7nY49KBjt-cMfzcw-t1080x1080.png',
              url: 'https://soundcloud.com/ciborgmusic/set-arena-epico'
            },
            {
              title: 'Farofa Trance',
              duration: '58:38m - ÁUDIO',
              image: 'https://i1.sndcdn.com/artworks-rbNMUizEnJAnyyty-WjBUww-t1080x1080.png',
              url: 'https://soundcloud.com/ciborgmusic/set-farofa-abril-2025'
            },
          ].map((set, idx) => (
            <GlassCard key={idx} className="p-0 overflow-hidden group">
              <div className="relative aspect-video">
                <img src={set.image} alt={set.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {set.url ? (
                    <a
                      href={set.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black hover:scale-110 transition-transform"
                    >
                      <Play size={24} fill="currentColor" />
                    </a>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                      <Play size={24} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="text-xl font-bold mb-1 flex items-center gap-2">
                  {set.url?.includes('youtu') && <Youtube size={20} className="text-red-500 shrink-0" />}
                  {set.url?.includes('soundcloud') && <Cloud size={20} className="text-orange-500 shrink-0" />}
                  {set.title}
                </div>
                <div className="text-zinc-500 text-sm flex items-center gap-2">
                  <Disc size={14} /> {set.duration}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Galeria Section */}
      <Section id="galeria" title="Galeria">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            gallery1Img,
            gallery2Img,
            gallery3Img,
            gallery4Img,
            gallery5Img,
            gallery6Img,
            gallery7Img,
            gallery8Img,
          ].map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="aspect-square rounded-2xl overflow-hidden glass p-1"
            >
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover rounded-xl grayscale-0 hover:grayscale transition-all duration-500" referrerPolicy="no-referrer" />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* AI Visualizer Section */}
      <Section id="imagine" title="Imagine">
        <AIVisualizer />
      </Section>

      {/* Identidade Visual Section */}
      <Section id="identidade" title="Identidade Visual" className="bg-zinc-900/30">
        <div className="grid grid-cols-2 gap-6">
          {/* Logo & Agência — card 1 */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Disc className="text-blue-500" />
              <h3 className="text-xl font-bold">Logo, Agência & Foto</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 glass-dark rounded-2xl flex flex-col items-center justify-center gap-3">
                <div className="text-xs uppercase tracking-widest text-zinc-500">Logo</div>
                <img src={logoImg} alt="Ciborg Logo" className="h-16 object-contain" />
              </div>
              <div className="p-6 glass-dark rounded-2xl flex flex-col items-center justify-center gap-3">
                <div className="text-xs uppercase tracking-widest text-zinc-500">Agência</div>
                <img src={hiloImg} alt="Hilo Agency Logo" className="h-16 object-contain" />
              </div>
            </div>
          </GlassCard>
          {/* Paleta de Cores — card 1 */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Palette className="text-emerald-500" />
              <h3 className="text-xl font-bold">Paleta de Cores</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { color: '#10b981', name: 'Emerald' },
                { color: '#3b82f6', name: 'Blue' },
                { color: '#09090b', name: 'Zinc' },
              ].map((c, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-20 rounded-2xl border border-white/10" style={{ backgroundColor: c.color }} />
                  <div className="text-xs font-mono text-center">{c.color}</div>
                </div>
              ))}
            </div>
          </GlassCard>
          {/* Foto — card 3 */}
          <GlassCard className="space-y-4 p-0 overflow-hidden">
            <img src={image3Img} alt="Ciborg" className="w-full h-full object-cover rounded-3xl" />
          </GlassCard>
          {/* Release — card 4 */}
          <GlassCard className="space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Music className="text-emerald-500 shrink-0" size={20} />
              <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">Release</h3>
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-wide">Mais um nome confirmado!</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Ele é presença constante, energia garantida e vibração lá no alto.{' '}
              <span className="text-white font-semibold">CIBORG</span> é mais que um artista — é um parceiro de confiança,
              que caminha com o nosso evento desde sempre, acreditando na proposta e fortalecendo cada edição com sua entrega e conexão única com a pista.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Com performances eletrizantes, presença marcante e uma identidade sonora que mistura potência e precisão,
              CIBORG transforma sets em experiências hipnóticas, conduzindo o público por verdadeiras viagens emocionais e dançantes.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
              E desta vez não será diferente. Ele está de volta para mais uma missão, com tudo o que você já espera — e muito mais.
            </p>
          </GlassCard>
        </div>
      </Section>

      {/* Download Presskit Section */}
      <section id="presskit" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="py-16 px-8 border-emerald-500/20">
            <Download size={48} className="mx-auto text-emerald-500 mb-6 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">DOWNLOAD PRESS KIT</h2>
            <p className="text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed text-sm">
              <span className="text-white font-semibold">Ciborg</span> é um projeto criado por Everton Araújo em outubro de 2018, tendo como foco a modalidade progressive trance. Músicas extremamente envolventes, com groove inovador, dando muita energia e emoção ao escutá-las. Ciborg já dividiu palco com grandes artistas da cena trance como Aura Vortex, Becker, Menumas, Zanon, Blazzy, entre outros. O nome Ciborg veio devido a uma deficiência parcial em uma das pernas, e junto com a sua vontade e força de dançar em cada apresentação ele vem com todo seu amor pela música!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a
                href="https://drive.google.com/drive/folders/183J5Zom7Y2UeS4GCPvzrzxW0wxhRYPMb?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                Download Full Kit (ZIP)
              </a>
              <a
                href="https://drive.google.com/file/d/1XG1r6sEJKyiREwxlopIZyZ9QFGUsmAkM/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="glass px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Proposta de Contratação (PDF)
              </a>
            </div>
          </GlassCard>
        </div>
      </section >

      {/* Contato Section */}
      <Section id="contato" title="Contato">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-display font-bold">Vamos Conversar?</h3>
              <p className="text-zinc-400">Para bookings, parcerias ou apenas para dizer oi, utilize os canais abaixo.</p>
            </div>
            <div className="space-y-4">
              <a href="mailto:ciborgmusic.br@gmail.com" className="flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">Email</div>
                  <div className="font-bold">ciborgmusic.br@gmail.com</div>
                </div>
              </a>
              <a href="https://wa.me/5519974230470" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">WhatsApp</div>
                  <div className="font-bold">+55 19 97423-0470</div>
                </div>
              </a>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                {
                  Icon: () => (
                    <svg viewBox="15.583 -197.416 989.654 989.654" fill="currentColor" className="w-8 h-8">
                      <path d="M26.791 272.388c-2.065 0-3.704 1.597-3.971 3.874l-7.237 54.972 7.237 54.025c.267 2.277 1.905 3.863 3.971 3.863 2 0 3.629-1.575 3.948-3.843v-.011.011l8.578-54.046-8.578-54.982c-.309-2.267-1.958-3.863-3.948-3.863zm40.699-30.035c-.341-2.362-2.033-3.991-4.119-3.991-2.097 0-3.832 1.682-4.119 3.991 0 .021-9.728 88.881-9.728 88.881l9.728 86.912c.277 2.331 2.012 4.013 4.119 4.013 2.075 0 3.768-1.639 4.108-3.991l11.068-86.934-11.057-88.881zm153.304-81.984c-3.991 0-7.291 3.267-7.482 7.418l-7.748 163.521 7.748 105.676c.202 4.129 3.491 7.386 7.482 7.386 3.97 0 7.259-3.268 7.493-7.407v.032l8.759-105.687-8.759-163.521c-.235-4.151-3.524-7.418-7.493-7.418zm-79.345 56.834c-3.065 0-5.566 2.448-5.812 5.715l-8.727 108.347 8.727 104.824c.234 3.246 2.746 5.694 5.812 5.694 3.033 0 5.534-2.448 5.801-5.694l9.919-104.824-9.919-108.369c-.267-3.245-2.768-5.693-5.801-5.693zM301.427 444.36c4.949 0 8.972-3.992 9.174-9.101l7.6-103.898-7.589-217.706c-.202-5.109-4.226-9.1-9.174-9.1-4.992 0-9.025 4.002-9.186 9.111l-6.737 217.684 6.737 103.941c.16 5.067 4.193 9.069 9.175 9.069zm165.075.49c6.812 0 12.432-5.609 12.559-12.506v.074-.074l5.301-100.919-5.302-251.434c-.117-6.886-5.747-12.505-12.559-12.505-6.822 0-12.452 5.609-12.559 12.516l-4.736 251.338c0 .16 4.736 101.067 4.736 101.067.108 6.833 5.748 12.443 12.56 12.443zm-83.166-.394c5.929 0 10.707-4.758 10.867-10.824v.074l6.449-102.323-6.46-219.281c-.16-6.067-4.938-10.813-10.867-10.813-5.971 0-10.749 4.747-10.877 10.813l-5.736 219.292 5.747 102.302c.128 6.002 4.906 10.76 10.877 10.76zm-202.369-.958c3.523 0 6.376-2.821 6.642-6.535l9.345-105.697-9.345-100.546c-.255-3.714-3.107-6.514-6.642-6.514-3.575 0-6.428 2.82-6.651 6.557l-8.228 100.503 8.228 105.687c.234 3.724 3.075 6.545 6.651 6.545zm-78.716-5.79c2.575 0 4.661-2.033 4.959-4.843l10.494-101.621-10.484-105.452c-.309-2.82-2.395-4.854-4.97-4.854-2.608 0-4.694 2.044-4.96 4.854l-9.238 105.452 9.238 101.6c.256 2.82 2.342 4.864 4.961 4.864zM424.76 108.451c-6.439 0-11.602 5.12-11.729 11.676l-5.236 211.277 5.236 101.663c.128 6.471 5.279 11.591 11.729 11.591 6.428 0 11.559-5.109 11.707-11.665v.085l5.875-101.663-5.875-211.31c-.149-6.534-5.28-11.654-11.707-11.654zM260.961 444.573c4.449 0 8.121-3.63 8.334-8.26l8.174-104.974-8.174-200.921c-.224-4.641-3.885-8.259-8.334-8.259-4.491 0-8.152 3.629-8.344 8.259l-7.237 200.921 7.248 105.017c.18 4.587 3.841 8.217 8.333 8.217zm91.276-9.909v-.054l7.024-103.238-7.024-225.039c-.171-5.587-4.577-9.972-10.016-9.972-5.471 0-9.877 4.374-10.025 9.972l-6.237 225.028 6.247 103.292c.149 5.534 4.556 9.908 10.016 9.908 5.449 0 9.834-4.374 10.016-9.94v.043zm531.284-233.011c-16.678 0-32.589 3.374-47.085 9.451-9.686-109.709-101.685-195.77-213.906-195.77-27.459 0-54.227 5.407-77.865 14.549-9.185 3.555-11.633 7.216-11.718 14.315v386.346c.096 7.45 5.875 13.655 13.145 14.39.309.032 335.248.202 337.42.202 67.222 0 121.726-54.504 121.726-121.736-.001-67.233-54.494-121.747-121.717-121.747zM508.063 43.858c-7.312 0-13.314 6.003-13.421 13.378l-5.492 274.221 5.503 99.524c.096 7.27 6.099 13.262 13.41 13.262 7.29 0 13.293-5.992 13.399-13.368v.117l5.971-99.535-5.971-274.242c-.106-7.354-6.109-13.357-13.399-13.357z" />
                    </svg>
                  ),
                  href: 'https://soundcloud.com/ciborgmusic',
                  color: 'text-orange-500 hover:text-orange-400'
                },
                { Icon: Youtube, href: 'https://www.youtube.com/@ciborgBR', color: 'text-red-500 hover:text-red-400' },
                { Icon: Instagram, href: 'https://www.instagram.com/ciborgmusicbr/', color: 'text-pink-500 hover:text-pink-400' },
                {
                  Icon: () => (
                    <svg viewBox="-204.79995 -341.33325 1774.9329 2047.9995" fill="currentColor" className="w-8 h-8">
                      <mask id="fb-mask">
                        <rect x="-2000" y="-2000" width="4000" height="4000" fill="white" />
                        <path d="M948.4 880l30.267-197.333H789.333V554.609C789.333 500.623 815.78 448 900.584 448h86.083V280s-78.124-13.333-152.814-13.333c-155.936 0-257.853 94.506-257.853 265.6v150.4H402.667V880H576v477.04a687.805 687.805 0 00106.667 8.293c36.288 0 71.91-2.84 106.666-8.293V880H948.4" fill="black" />
                      </mask>
                      <path mask="url(#fb-mask)" d="M1365.333 682.667C1365.333 305.64 1059.693 0 682.667 0 305.64 0 0 305.64 0 682.667c0 340.738 249.641 623.16 576 674.373V880H402.667V682.667H576v-150.4c0-171.094 101.917-265.6 257.853-265.6 74.69 0 152.814 13.333 152.814 13.333v168h-86.083c-84.804 0-111.25 52.623-111.25 106.61v128.057h189.333L948.4 880H789.333v477.04c326.359-51.213 576-333.635 576-674.373" />
                    </svg>
                  ),
                  href: 'https://www.facebook.com/ciborgmusic',
                  color: 'text-blue-500 hover:text-blue-400'
                },
                {
                  Icon: () => (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.503 17.306c-.218.358-.682.474-1.036.255-2.859-1.745-6.458-2.14-10.697-1.171-.41.094-.818-.163-.912-.572-.094-.41.163-.818.572-.912 4.636-1.06 8.59-.61 11.789 1.343.354.217.47.681.284 1.057zm1.47-3.26c-.275.447-.859.591-1.306.315-3.272-2.012-8.257-2.596-12.126-1.42-.505.153-1.038-.135-1.192-.64-.154-.505.135-1.038.64-1.192 4.414-1.34 9.904-.683 13.663 1.632.447.275.592.859.321 1.305zm.127-3.39c-3.924-2.33-10.39-2.545-14.156-1.402-.602.183-1.238-.163-1.42-.765-.183-.602.163-1.238.765-1.42 4.318-1.311 11.455-1.054 15.96 1.62.54.32.716 1.015.396 1.555-.32.54-1.015.717-1.545.412z" />
                    </svg>
                  ),
                  href: 'https://open.spotify.com/intl-pt/artist/25hq9w7IwFxbfDYeyyrCFQ',
                  color: 'text-emerald-500 hover:text-emerald-400'
                },
              ].map((item, idx) => (
                <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer" className={cn("w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all", item.color)}>
                  <item.Icon />
                </a>
              ))}
            </div>
          </div>
          <GlassCard>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Mensagem</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all"
              >
                Enviar Mensagem
              </button>
            </form>
          </GlassCard>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-zinc-600 text-lg flex items-center justify-center gap-1">
          🚀 Desenvolvido por <a href="https://www.instagram.com/markbeys/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><span className="animate-marks italic">Marks</span><span className="animate-beys italic">Beys</span> 1.4</a> 🎨
        </p>
      </footer>
    </div >
  );
}
