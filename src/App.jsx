import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import VocabSRS from './components/VocabSRS';
import Quiz from './components/Quiz';
import Clauses from './components/Clauses';
import Grammar from './components/Grammar';
import Writing from './components/Writing';
import Immersion from './components/Immersion';
import Planner from './components/Planner';
import PlaceholderModule from './components/PlaceholderModule';
import { initializeDB, getProgress } from './data/db';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Edit3, 
  Tv, 
  HelpCircle, 
  Layers, 
  Calendar,
  Flame,
  Menu,
  X,
  ShieldAlert,
  Moon
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [progress, setProgress] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize Local Storage DB
    initializeDB();
    // Fetch initial progress to show in header
    setProgress(getProgress());
  }, []);

  const handleActivityLogged = () => {
    // Refresh header indicators whenever an activity occurs
    setProgress(getProgress());
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, step: 2, isStub: false },
    { id: 'vocab', name: 'Vocabulary SRS', icon: BookOpen, step: 4, isStub: false },
    { id: 'quiz', name: 'Quiz Bank', icon: HelpCircle, step: 5, isStub: false },
    { id: 'clauses', name: 'Clause Library', icon: FileText, step: 6, isStub: false },
    { id: 'grammar', name: 'Grammar Reference', icon: Layers, step: 6, isStub: false },
    { id: 'writing', name: 'Writing Practice', icon: Edit3, step: 7, isStub: false },
    { id: 'immersion', name: 'Immersion Logger', icon: Tv, step: 8, isStub: false },
    { id: 'planner', name: 'Study Planner', icon: Calendar, step: 9, isStub: false },
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onActivityLogged={handleActivityLogged} />;
      case 'vocab':
        return <VocabSRS onActivityLogged={handleActivityLogged} />;
      case 'quiz':
        return <Quiz onActivityLogged={handleActivityLogged} />;
      case 'clauses':
        return <Clauses onActivityLogged={handleActivityLogged} />;
      case 'grammar':
        return <Grammar />;
      case 'writing':
        return <Writing onActivityLogged={handleActivityLogged} />;
      case 'immersion':
        return <Immersion onActivityLogged={handleActivityLogged} />;
      case 'planner':
        return <Planner onActivityLogged={handleActivityLogged} />;
      default:
        const currentItem = menuItems.find(item => item.id === activeTab);
        return (
          <PlaceholderModule 
            name={currentItem?.name} 
            stepNumber={currentItem?.step} 
            description={currentItem?.desc} 
          />
        );
    }
  };






  return (
    <div className="min-h-screen flex bg-brand-950 text-slate-100 selection:bg-accent-500 selection:text-white">
      
      {/* Sidebar for Desktop / Tablet */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/80 border-r border-slate-900 backdrop-blur-md transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:block'
      }`}>
        <div className="h-full flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            
            {/* Logo area */}
            <div className="flex items-center gap-2.5 px-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center text-white shadow shadow-accent-950">
                <span className="font-extrabold text-sm tracking-tighter">LV</span>
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white tracking-tight">LingoVault</h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Offline Study Hub</p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false); // Close drawer on mobile click
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-accent-600/10 text-accent-300 border border-accent-950/40 shadow-sm' 
                        : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-accent-400' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                    {item.isStub && (
                      <span className="ml-auto text-[8px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-850">
                        P{item.step}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer info in sidebar */}
          <div className="p-3 bg-slate-950 border border-slate-900/60 rounded-2xl text-[10px] text-slate-500 space-y-1 select-none">
            <div className="flex items-center gap-1 font-semibold text-slate-400">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              <span>Offline Mode Active</span>
            </div>
            <p className="leading-relaxed">This app operates 100% locally. Zero external tracking or networks.</p>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        
        {/* Top Header Panel */}
        <header className="sticky top-0 z-30 h-16 bg-brand-950/80 backdrop-blur-md border-b border-slate-900/50 flex items-center justify-between px-4 sm:px-6">
          
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900/40 transition"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Header text */}
          <div className="hidden sm:block text-left">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              {menuItems.find(item => item.id === activeTab)?.name}
            </h2>
            <p className="text-[10px] text-slate-400">
              {activeTab === 'dashboard' ? 'Overview of your learning statistics' : 'Offline application module'}
            </p>
          </div>

          {/* Status indicators */}
          {progress && (
            <div className="flex items-center gap-3">
              {/* Active Phase Badge */}
              <div 
                onClick={() => setActiveTab('dashboard')}
                className="cursor-pointer bg-slate-900 border border-slate-850 hover:bg-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-slate-300 font-semibold transition"
              >
                <Moon className="h-3.5 w-3.5 text-accent-400" />
                <span>Phase {progress.phase}</span>
              </div>
              
              {/* Streak Badge */}
              <div 
                onClick={() => setActiveTab('dashboard')}
                className="cursor-pointer bg-slate-900 border border-slate-850 hover:bg-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-slate-300 font-semibold transition"
              >
                <Flame className={`h-4.5 w-4.5 ${progress.streak > 0 ? 'text-amber-500 fill-amber-500/20' : 'text-slate-500'}`} />
                <span>{progress.streak} Day{progress.streak === 1 ? '' : 's'}</span>
              </div>
            </div>
          )}

        </header>

        {/* Dynamic Tab Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto pb-16">
          {renderActiveContent()}
        </main>

      </div>

      {/* Mobile Drawer Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-xs lg:hidden"
        />
      )}

    </div>
  );
}
