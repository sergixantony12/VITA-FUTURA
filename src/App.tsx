/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Dog, 
  Briefcase, 
  Users, 
  Calendar, 
  Wallet, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause,
  ChevronRight,
  Home,
  Settings as SettingsIcon,
  Palette,
  Cpu,
  Stethoscope,
  GraduationCap,
  Rocket,
  Star,
  Globe,
  MessageCircle,
  Zap
} from 'lucide-react';
import { CareerPath, GameState, GameTask, Pet, Child, Milestone, LifeEvent, Friend, ChildEvent } from './types';
import { CAREERS, DOG_BREEDS, DAILY_TASKS, MILESTONES, RANDOM_EVENTS, CHILD_EVENTS } from './constants';

const DAY_DURATION_MS = 5 * 60 * 1000; // 5 minutes in ms

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showChoiceModal, setShowChoiceModal] = useState<'CAREER' | 'PET' | 'FAMILY' | 'MILESTONE' | null>(null);
  const [activeEvent, setActiveEvent] = useState<LifeEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'GOALS' | 'RELATIONS'>('HOME');

  // Initialize game
  useEffect(() => {
    const saved = localStorage.getItem('dream_sim_state');
    if (saved) {
      setGameState(JSON.parse(saved));
      setShowSetup(false);
    }
  }, []);

  // Save game automatically
  useEffect(() => {
    if (gameState) {
      localStorage.setItem('dream_sim_state', JSON.stringify(gameState));
    }
  }, [gameState]);

  // Main Game Loop for day progression
  useEffect(() => {
    if (!gameState || gameState.isPaused || showSetup) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= DAY_DURATION_MS) {
          advanceDay();
          return 0;
        }
        return prev + 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, showSetup]);

  const advanceDay = () => {
    setGameState(prev => {
      if (!prev) return null;
      
      const newDay = prev.gameDay + 1;
      const historyUpdate = [...prev.history, `Giorno ${prev.totalDays + 1}: È iniziato un nuovo giorno.`];
      
      // Income based on career
      const careerInfo = CAREERS.find(c => c.path === prev.career);
      const dailySalary = careerInfo ? careerInfo.salary : 0;
      
      // Daily decay/growth
      let happinessAdj = -2;
      let wealthAdj = dailySalary;
      let bondAdj = -1; // Natural decay

      // Unfinished tasks penalty
      const pendingTasks = prev.tasks.filter(t => !t.completed);
      happinessAdj -= pendingTasks.length * 5;

      // Aging Children (every 10 days)
      const updatedChildren = prev.children.map(child => {
        const shouldAgeUp = (prev.totalDays + 1) % 10 === 0;
        return {
          ...child,
          age: shouldAgeUp ? child.age + 1 : child.age
        };
      });

      // Random Event Logic
      const eventChance = Math.random();
      let eventToTrigger: LifeEvent | null = null;
      
      if (eventChance < 0.25) { 
        if (prev.children.length > 0 && Math.random() < 0.4) {
          // Trigger Child Event
          const randomChild = prev.children[Math.floor(Math.random() * prev.children.length)];
          const rawEvent = CHILD_EVENTS[Math.floor(Math.random() * CHILD_EVENTS.length)];
          const childEvent: ChildEvent = {
            ...rawEvent,
            childName: randomChild.name,
            description: `${randomChild.name}: ${rawEvent.description}`,
            developmentImpact: (rawEvent as any).developmentImpact || 0
          } as ChildEvent;
          eventToTrigger = childEvent;
          
          updatedChildren.forEach(c => {
            if (c.name === randomChild.name) {
              c.development = Math.min(100, c.development + childEvent.developmentImpact);
              c.bond = Math.min(100, Math.max(0, c.bond + childEvent.bondImpact));
            }
          });
        } else {
          eventToTrigger = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        }

        if (eventToTrigger) {
          setActiveEvent(eventToTrigger);
          wealthAdj += eventToTrigger.wealthImpact;
          happinessAdj += eventToTrigger.happinessImpact;
          bondAdj += eventToTrigger.bondImpact;
          historyUpdate.push(`Evento: ${eventToTrigger.title}`);
        }
      }

      return {
        ...prev,
        gameDay: newDay,
        totalDays: prev.totalDays + 1,
        wealth: prev.wealth + wealthAdj,
        happiness: Math.min(100, Math.max(0, prev.happiness + happinessAdj)),
        partner: prev.partner ? { ...prev.partner, bond: Math.min(100, Math.max(0, prev.partner.bond + bondAdj)) } : null,
        children: updatedChildren,
        history: historyUpdate.slice(-20),
        tasks: generateDailyTasks()
      };
    });
  };

  const handleInteract = (type: 'PARTNER' | 'FRIEND' | 'CHILD', id?: string) => {
    setGameState(prev => {
      if (!prev) return null;
      if (type === 'PARTNER' && prev.partner) {
        return {
          ...prev,
          partner: { ...prev.partner, bond: Math.min(100, prev.partner.bond + 10) },
          happiness: Math.min(100, prev.happiness + 5),
          history: [...prev.history, `Hai passato del tempo prezioso con ${prev.partner.name}.`]
        };
      }
      if (type === 'CHILD' && id) {
        return {
          ...prev,
          children: prev.children.map(c => c.name === id ? { ...c, bond: Math.min(100, c.bond + 10) } : c),
          happiness: Math.min(100, prev.happiness + 5),
          history: [...prev.history, `Hai giocato con ${id}.`]
        };
      }
      if (type === 'FRIEND' && id) {
        return {
          ...prev,
          friends: prev.friends.map(f => f.id === id ? { ...f, closeness: Math.min(100, f.closeness + 10) } : f),
          happiness: Math.min(100, prev.happiness + 3),
          history: [...prev.history, `Hai sentito un vecchio amico.`]
        };
      }
      return prev;
    });
  };

  const buyMilestone = (milestoneId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const milestone = prev.milestones.find(m => m.id === milestoneId);
      if (milestone && !milestone.unlocked && prev.wealth >= milestone.cost) {
        return {
          ...prev,
          wealth: prev.wealth - milestone.cost,
          happiness: Math.min(100, prev.happiness + 30),
          milestones: prev.milestones.map(m => m.id === milestoneId ? { ...m, unlocked: true } : m),
          history: [...prev.history, `Traguardo Raggiunto: ${milestone.title}!`]
        };
      }
      return prev;
    });
  };

  const generateDailyTasks = (): GameTask[] => {
    const shuffled = [...DAILY_TASKS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((t, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: t.title,
      description: t.description,
      type: t.type as any,
      completed: false,
      deadline: 1
    }));
  };

  const handleTaskComplete = (taskId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
        happiness: Math.min(100, prev.happiness + 5)
      };
    });
  };

  const startNewGame = (name: string, partnerName: string) => {
    const initialState: GameState = {
      gameDay: 1,
      totalDays: 0,
      playerName: name,
      partner: { name: partnerName, traits: ['Affettuoso', 'Sognatore'], bond: 80 },
      pets: [],
      children: [],
      friends: [
        { id: '1', name: 'Marco', closeness: 50 },
        { id: '2', name: 'Luca', closeness: 40 }
      ],
      milestones: MILESTONES.map(m => ({ ...m, unlocked: false } as Milestone)),
      career: CareerPath.UNEMPLOYED,
      wealth: 1000,
      happiness: 80,
      isPaused: false,
      tasks: generateDailyTasks(),
      history: ['Inizia il vostro viaggio insieme.']
    };
    setGameState(initialState);
    setShowSetup(false);
  };

  if (showSetup) {
    return <SetupScreen onStart={startNewGame} />;
  }

  if (!gameState) return null;

  const progress = (currentTime / DAY_DURATION_MS) * 100;
  const careerInfo = CAREERS.find(c => c.path === gameState.career);

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-950/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-950/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 h-screen overflow-y-auto pb-24 md:pb-8">
        
        {/* Sidebar - Stats & Identity */}
        <div className="md:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-2xl font-bold">
                {gameState.playerName[0]}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{gameState.playerName} & {gameState.partner?.name}</h1>
                <p className="text-white/40 text-sm">Giorno {gameState.totalDays + 1}</p>
              </div>
            </div>

            <div className="space-y-4">
              <StatItem 
                icon={<Heart className="text-rose-500" size={18} />} 
                label="Felicità" 
                value={gameState.happiness} 
                color="bg-rose-500" 
              />
              <StatItem 
                icon={<Wallet className="text-emerald-500" size={18} />} 
                label="Patrimonio" 
                value={gameState.wealth} 
                format={(v) => `€${v.toLocaleString()}`}
                max={100000}
                color="bg-emerald-500"
              />
              <div className="pt-4 border-t border-white/10 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-widest text-white/40 flex items-center">
                    <Clock size={12} className="mr-1" /> Tempo del Giorno
                  </span>
                  <span className="text-xs text-white/60">
                    {Math.floor((DAY_DURATION_MS - currentTime) / 1000)}s al domani
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Family & Pets */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4 flex items-center">
              <Users size={16} className="mr-2" /> Famiglia & Amici
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="p-2 bg-rose-500/20 rounded-xl text-rose-500">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-medium">{gameState.partner?.name}</p>
                  <p className="text-xs text-white/40">Partner di vita</p>
                </div>
              </div>

              {gameState.pets.map(pet => (
                <div key={pet.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500">
                    <Dog size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pet.name}</p>
                    <p className="text-xs text-white/40">{pet.breed}</p>
                  </div>
                </div>
              ))}

              {gameState.children.map((child, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{child.name}</p>
                    <p className="text-xs text-white/40">{child.age} anni</p>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setShowChoiceModal('PET')}
                className="w-full py-3 border border-dashed border-white/20 rounded-2xl text-xs text-white/40 hover:bg-white/5 transition-colors flex items-center justify-center"
              >
                <Plus size={14} className="mr-2" /> Adotta un Cane
              </button>

              {gameState.wealth > 5000 && gameState.happiness > 70 && (
                <button 
                  onClick={() => setShowChoiceModal('FAMILY')}
                  className="w-full py-3 border border-dashed border-rose-500/30 rounded-2xl text-xs text-rose-500/60 hover:bg-rose-500/5 transition-colors flex items-center justify-center mt-2"
                >
                  <Plus size={14} className="mr-2" /> Allarga la Famiglia
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-full px-6">
            <div className="flex space-x-1">
              <TabButton active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} icon={<Home size={16} />} label="Home" />
              <TabButton active={activeTab === 'GOALS'} onClick={() => setActiveTab('GOALS')} icon={<Star size={16} />} label="Obiettivi" />
              <TabButton active={activeTab === 'RELATIONS'} onClick={() => setActiveTab('RELATIONS')} icon={<Users size={16} />} label="Relazioni" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <button 
                  onClick={() => setGameState(prev => prev ? { ...prev, isPaused: !prev.isPaused } : null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"
                >
                  {gameState.isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                Live Simulation
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'HOME' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Active Career Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                    <Briefcase size={140} strokeWidth={1} />
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Carriera Attuale</h2>
                    {careerInfo ? (
                      <div>
                        <h3 className="text-4xl font-bold mb-3 flex items-center tracking-tight">
                          <span className="p-2 bg-orange-500/20 rounded-2xl text-orange-400 mr-4">
                            {getCareerIcon(careerInfo.icon)}
                          </span>
                          {careerInfo.title}
                        </h3>
                        <p className="text-white/50 mb-8 max-w-md text-sm leading-relaxed">{careerInfo.description}</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-xs font-bold tracking-wider flex items-center">
                            <Wallet size={14} className="mr-2 text-emerald-400" /> €{careerInfo.salary} / GIORNO
                          </div>
                          <button 
                            onClick={() => setShowChoiceModal('CAREER')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                          >
                            CAMBIA LAVORO
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-3xl font-bold mb-4 tracking-tight italic text-white/40">In cerca di una strada...</h3>
                        <button 
                          onClick={() => setShowChoiceModal('CAREER')}
                          className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold transition-all flex items-center shadow-lg shadow-orange-500/20"
                        >
                          Trova Lavoro <ChevronRight size={18} className="ml-2" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Daily Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center">
                      <CheckCircle2 size={14} className="mr-2 text-emerald-500" /> Impegni di Oggi
                    </h2>
                    <div className="space-y-3">
                      {gameState.tasks.map(task => (
                        <div 
                          key={task.id} 
                          onClick={() => !task.completed && handleTaskComplete(task.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${
                            task.completed 
                              ? 'bg-white/5 border-white/5 opacity-40' 
                              : 'bg-white/10 border-white/10 hover:border-white/30 hover:bg-white/[0.12]'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`p-2.5 rounded-xl mr-4 ${task.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${task.completed ? 'line-through text-white/30' : 'text-white/80'}`}>{task.title}</p>
                              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{task.type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center">
                      <TrendingUp size={14} className="mr-2 text-blue-500" /> Cronologia
                    </h2>
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {gameState.history.length === 0 && <p className="text-xs text-white/20 italic">Il vostro viaggio inizia qui...</p>}
                      {gameState.history.slice().reverse().map((entry, idx) => (
                        <div key={idx} className="relative pl-6 pb-6 border-l border-white/5 last:pb-0">
                          <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                          <p className="text-xs text-white/60 leading-relaxed font-medium">{entry}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'GOALS' && (
              <motion.div 
                key="goals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.milestones.map(m => (
                    <div 
                      key={m.id}
                      className={`p-6 rounded-[32px] border relative transition-all ${
                        m.unlocked 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {m.unlocked ? (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 text-xs font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full">
                          €{m.cost.toLocaleString()}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                          m.category === 'HOME' ? 'bg-blue-500/20 text-blue-400' :
                          m.category === 'TRAVEL' ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {m.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{m.title}</h3>
                      <p className="text-xs text-white/50 mb-6 leading-relaxed">{m.description}</p>
                      
                      {!m.unlocked && (
                        <button 
                          onClick={() => buyMilestone(m.id)}
                          disabled={gameState.wealth < m.cost}
                          className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
                            gameState.wealth >= m.cost 
                              ? 'bg-white text-black hover:bg-white/90' 
                              : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          {gameState.wealth >= m.cost ? 'Raggiungi Traguardo' : `Ti mancano €${(m.cost - gameState.wealth).toLocaleString()}`}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'RELATIONS' && (
              <motion.div 
                key="relations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Partner Detailed Card */}
                <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-[40px] p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="w-32 h-32 rounded-[40px] bg-rose-500 flex items-center justify-center text-4xl shadow-xl shadow-rose-500/20 font-serif">
                      {gameState.partner?.name[0]}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold mb-1 tracking-tight">{gameState.partner?.name}</h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                        {gameState.partner?.traits.map(t => (
                          <span key={t} className="text-[10px] font-bold uppercase tracking-widest text-rose-400/80 px-3 py-1 bg-rose-400/10 rounded-full">{t}</span>
                        ))}
                      </div>
                      <div className="max-w-xs mx-auto md:mx-0">
                        <StatItem 
                          icon={<Heart size={14} className="text-rose-400" />} 
                          label="Legame" 
                          value={gameState.partner?.bond || 0} 
                          color="bg-rose-500" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => handleInteract('PARTNER')}
                      className="px-8 py-4 bg-rose-500 hover:bg-rose-600 rounded-2xl font-bold flex items-center shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                    >
                      Dedica del tempo <MessageCircle size={18} className="ml-2" />
                    </button>
                  </div>
                </div>

                {/* Children & Friends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-6 flex items-center">
                      <Users size={14} className="mr-2" /> Figli
                    </h3>
                    <div className="space-y-4">
                      {gameState.children.length === 0 && <p className="text-xs text-white/20 italic">Non ci sono ancora figli...</p>}
                      {gameState.children.map(child => (
                        <div key={child.name} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-bold">{child.name}</p>
                              <p className="text-[10px] text-white/30">{child.age} anni • {child.mood}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleInteract('CHILD', child.name)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                              >
                                <MessageCircle size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <StatItem 
                              icon={<Star size={10} className="text-amber-400" />} 
                              label="Sviluppo" 
                              value={child.development} 
                              color="bg-amber-500" 
                            />
                            <StatItem 
                              icon={<Heart size={10} className="text-rose-400" />} 
                              label="Legame" 
                              value={child.bond} 
                              color="bg-rose-500" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-6 flex items-center">
                      <Users size={14} className="mr-2" /> Amici
                    </h3>
                    <div className="space-y-4">
                      {gameState.friends.map(friend => (
                        <div key={friend.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="font-bold">{friend.name}</p>
                            <p className="text-[10px] text-white/30">Vicinanza: {friend.closeness}%</p>
                          </div>
                          <button 
                            onClick={() => handleInteract('FRIEND', friend.id)}
                            className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {activeEvent && (
          <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
        )}
        {showChoiceModal && (
          <ChoiceModal 
            type={showChoiceModal} 
            onClose={() => setShowChoiceModal(null)} 
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
        active 
          ? 'bg-white text-black shadow-lg shadow-white/5' 
          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EventModal({ event, onClose }: { event: LifeEvent, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-[#151619] border-2 border-white/10 rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden"
      >
        <div className={`absolute top-0 inset-x-0 h-2 capitalize ${
          event.type === 'CAREER' ? 'bg-orange-500' : event.type === 'FINANCIAL' ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
        
        <div className="mb-8">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
            event.type === 'CAREER' ? 'bg-orange-500/20 text-orange-400' : 
            event.type === 'FINANCIAL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <Zap size={32} />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Evento Straordinario</h2>
          <h3 className="text-3xl font-bold tracking-tight">{event.title}</h3>
        </div>

        <p className="text-white/60 mb-10 leading-relaxed">{event.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {event.wealthImpact !== 0 && (
            <div className={`p-4 rounded-2xl border ${event.wealthImpact > 0 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
              <div className="text-[10px] font-bold uppercase mb-1 opacity-50">Patrimonio</div>
              <div className="font-bold">{event.wealthImpact > 0 ? '+' : ''}€{event.wealthImpact}</div>
            </div>
          )}
          {event.bondImpact !== 0 && (
            <div className={`p-4 rounded-2xl border ${event.bondImpact > 0 ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
              <div className="text-[10px] font-bold uppercase mb-1 opacity-50">Legame</div>
              <div className="font-bold">{event.bondImpact > 0 ? '+' : ''}{event.bondImpact}%</div>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-white text-black rounded-2xl font-bold hover:bg-white/90 active:scale-[0.98] transition-all"
        >
          Prosegui il Viaggio
        </button>
      </motion.div>
    </motion.div>
  );
}

function StatItem({ icon, label, value, format, max = 100, color }: { 
  icon: React.ReactNode, 
  label: string, 
  value: number, 
  format?: (v: number) => string,
  max?: number,
  color: string
}) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm text-white/60">{label}</span>
        </div>
        <span className="text-sm font-semibold">{format ? format(value) : `${value}%`}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SetupScreen({ onStart }: { onStart: (name: string, partner: string) => void }) {
  const [name, setName] = useState('');
  const [partner, setPartner] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0502] flex items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-900/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-rose-900/20 blur-[150px] rounded-full animate-pulse delay-700" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center rotate-12 shadow-lg">
            <Heart size={40} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold mb-2">L'Inizio di Noi</h1>
          <p className="text-white/40">Costruiamo insieme il vostro futuro.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 px-2">Il Tuo Nome</label>
            <input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Esempio: Sergio"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-2 px-2">Il Suo Nome</label>
            <input 
              value={partner}
              onChange={e => setPartner(e.target.value)}
              placeholder="Esempio: Maria"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>

          <button 
            disabled={!name || !partner}
            onClick={() => onStart(name, partner)}
            className="w-full py-5 bg-gradient-to-r from-orange-500 to-rose-600 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            Inizia il Sogno
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ChoiceModal({ type, onClose, gameState, setGameState }: { 
  type: 'CAREER' | 'PET' | 'FAMILY', 
  onClose: () => void,
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
}) {
  const selectCareer = (path: CareerPath) => {
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        career: path,
        history: [...prev.history, `Hai iniziato una nuova carriera come ${CAREERS.find(c => c.path === path)?.title}.`]
      };
    });
    onClose();
  };

  const addPet = (breed: string, name: string) => {
    if (!name) return;
    const newPet: Pet = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      breed
    };
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pets: [...prev.pets, newPet],
        wealth: prev.wealth - 500,
        happiness: prev.happiness + 20,
        history: [...prev.history, `Benvenuto in famiglia, ${name}! Un bellissimo ${breed}.`]
      };
    });
    onClose();
  };

  const addFamily = (name: string) => {
    if (!name) return;
    const newChild: Child = {
      name,
      age: 0,
      bond: 100,
      development: 0,
      mood: 'Felice'
    };
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        children: [...prev.children, newChild],
        happiness: 100,
        history: [...prev.history, `La famiglia cresce! Benvenuto/a ${name}.`]
      };
    });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-[#151619] border border-white/10 rounded-[40px] p-8 md:p-12 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {type === 'CAREER' && 'Scegli la tua strada'}
            {type === 'PET' && 'Uno nuovo amico'}
            {type === 'FAMILY' && 'Nuovi inizi'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">Chiudi</button>
        </div>

        {type === 'CAREER' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAREERS.map(c => (
              <div 
                key={c.path}
                onClick={() => selectCareer(c.path)}
                className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-orange-500/50 cursor-pointer transition-all group"
              >
                <div className="mb-4 text-orange-400 group-hover:scale-110 transition-transform">
                  {getCareerIcon(c.icon)}
                </div>
                <h3 className="font-bold text-lg mb-1">{c.title}</h3>
                <p className="text-xs text-white/40 mb-3">{c.description}</p>
                <div className="text-sm font-mono text-emerald-400">€{c.salary}/giorno</div>
              </div>
            ))}
          </div>
        )}

        {type === 'PET' && (
          <PetSetup breeds={DOG_BREEDS} onComplete={addPet} canAfford={gameState.wealth >= 500} />
        )}

        {type === 'FAMILY' && (
          <div className="space-y-6">
            <p className="text-white/60">State pensando di allargare la famiglia? È un momento magico.</p>
            <FamilySetup onComplete={addFamily} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function PetSetup({ breeds, onComplete, canAfford }: { breeds: string[], onComplete: (b: string, n: string) => void, canAfford: boolean }) {
  const [selectedBreed, setSelectedBreed] = useState(breeds[0]);
  const [name, setName] = useState('');

  return (
    <div className="space-y-6">
      {!canAfford && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">Non hai abbastanza risparmi (€500 richiesti).</div>}
      <div>
        <label className="block text-xs text-white/40 uppercase mb-2">Razza</label>
        <select 
          value={selectedBreed}
          onChange={e => setSelectedBreed(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
        >
          {breeds.map(b => <option key={b} value={b} className="bg-neutral-900">{b}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-white/40 uppercase mb-2">Come si chiamerà?</label>
        <input 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome del cane..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none"
        />
      </div>
      <button 
        disabled={!name || !canAfford}
        onClick={() => onComplete(selectedBreed, name)}
        className="w-full py-4 bg-orange-500 rounded-2xl font-bold disabled:opacity-50"
      >
        Adotta per €500
      </button>
    </div>
  );
}

function FamilySetup({ onComplete }: { onComplete: (n: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs text-white/40 uppercase mb-2">Il nome del bambino/a</label>
        <input 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none"
        />
      </div>
      <button 
        disabled={!name}
        onClick={() => onComplete(name)}
        className="w-full py-4 bg-rose-500 rounded-2xl font-bold disabled:opacity-50"
      >
        Benvenuto/a in Famiglia!
      </button>
    </div>
  );
}

function getCareerIcon(icon: string) {
  switch(icon) {
    case 'Cpu': return <Cpu size={24} />;
    case 'Palette': return <Palette size={24} />;
    case 'Stethoscope': return <Stethoscope size={24} />;
    case 'GraduationCap': return <GraduationCap size={24} />;
    case 'Rocket': return <Rocket size={24} />;
    default: return <Briefcase size={24} />;
  }
}
