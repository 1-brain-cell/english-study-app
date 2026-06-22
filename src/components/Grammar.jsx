import React, { useState, useEffect } from 'react';
import { getStaticGrammar } from '../data/db';
import { 
  BookOpen, 
  Layers, 
  ChevronRight, 
  Search,
  Sparkles,
  Info,
  Laptop,
  Briefcase,
  Gamepad2
} from 'lucide-react';

export default function Grammar() {
  const grammarData = getStaticGrammar();
  const [activeTopicId, setActiveTopicId] = useState(grammarData[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const activeTopic = grammarData.find(g => g.id === activeTopicId) || grammarData[0];

  const filteredTopics = searchTerm.trim() === ''
    ? grammarData
    : grammarData.filter(g => 
        g.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.points.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  // Cross domain matrix details
  const crossDomainWords = [
    {
      word: "deploy",
      game: "To cast, send, or place an active ability, asset, or hero into the game arena (e.g. 'Deploying a sage wall' or 'Deploying a cipher camera').",
      tech: "To move software changes from a developer environment to a live hosting environment (e.g. 'Deploy the machine learning model to production').",
      biz: "To allocate people, capital, or operational assets to achieve specific strategic goals (e.g. 'Deploy financial advisors to key accounts')."
    },
    {
      word: "scale",
      game: "How an ability's numerical strength grows relative to player stats, character level, or items (e.g. 'This hero scales well into the late game').",
      tech: "The ability of a system to handle increasing volume by expanding CPU, database storage, or servers (e.g. 'Build a scalable cloud vector database').",
      biz: "To grow business operations and revenues exponentially while keeping marginal costs flat or minimal (e.g. 'Scale operations in APAC market')."
    },
    {
      word: "meta",
      game: "Most Effective Tactics Available — the dominant strategy, choices, or items preferred by high-tier players (e.g. 'Double-duelist is the current meta').",
      tech: "Metadata — data that describes other data. Abstract definitions of models (e.g. 'Store the metadata schema in the database').",
      biz: "Meta-strategy — analyzing trends, standard practices, or strategies of competitors to formulate a counter-strategy (e.g. 'The meta for modern SaaS is PLG')."
    },
    {
      word: "grind / farm",
      game: "Repetitively performing routine tasks (killing mobs, clearing domains) to accumulate materials or gold (e.g. 'Grinding for character ascension').",
      tech: "Data grinding / server farming — executing intensive data processing routines or hosting large-scale calculations on server farms.",
      biz: "Workplace culture term for relentless, repetitive daily effort to meet deadlines or climb the career ladder (e.g. 'The corporate grind')."
    },
    {
      word: "performance",
      game: "How smoothly a game runs (frame rate, ping, latency) or a player's accuracy metrics (e.g. 'Muse Dash full combo accuracy/performance').",
      tech: "System speed metrics: response time, CPU utilization, training speed, inference latency (e.g. 'Measure the inference performance of LLMs').",
      biz: "Evaluation of employees or units against predetermined business goals and KPIs (e.g. 'Quarterly performance review meeting')."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="glass rounded-2xl p-4 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 mr-auto">
          <div className="p-3 bg-accent-950/50 border border-accent-900 rounded-xl text-accent-400">
            <Layers className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white leading-tight">Grammar & Structure Reference</h3>
            <p className="text-slate-400 text-xs mt-1">Review key sentence structures and domain context mappings</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search grammar rules..."
            className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-accent-500 font-semibold"
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Topics List */}
        <div className="lg:col-span-1 space-y-4 text-left">
          <div className="glass rounded-2xl p-4 border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Reference Topics</h4>
            
            {filteredTopics.length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-xs italic">
                No matching topics found.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`w-full p-3 text-left rounded-xl text-xs font-bold transition duration-200 border cursor-pointer block ${
                      activeTopic?.id === topic.id
                        ? 'bg-accent-950/20 border-accent-700/60 text-white'
                        : 'bg-slate-900/20 border-slate-900 hover:bg-slate-900/40 hover:border-slate-850 text-slate-350'
                    }`}
                  >
                    <div className="font-bold capitalize">{topic.topic.replace('-', ' ')}</div>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-normal font-sans">{topic.summary}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-950 border border-slate-900/60 rounded-2xl text-[11px] text-slate-500 space-y-1 leading-normal">
            <div className="flex items-center gap-1 font-bold text-slate-400 mb-1">
              <Info className="h-3.5 w-3.5 text-accent-400" />
              <span>Offline Study Tip</span>
            </div>
            <p>
              Modals and conditionals are the absolute core of business correspondence and contract negotiations. Review their structures regularly.
            </p>
          </div>
        </div>

        {/* Right Details display */}
        <div className="lg:col-span-2 text-left space-y-6">
          
          {/* Active Topic Details */}
          {activeTopic ? (
            <div className="glass rounded-2xl p-6 border-slate-800 space-y-5 animate-fade-in">
              {/* Topic Header */}
              <div className="border-b border-slate-900 pb-3">
                <span className="text-[10px] text-accent-400 font-extrabold uppercase tracking-widest">
                  Grammar Rule Sheet
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1 capitalize">
                  {activeTopic.topic.replace('-', ' ')}
                </h3>
              </div>

              {/* Summary */}
              <div>
                <p className="text-slate-300 text-sm leading-relaxed font-sans">{activeTopic.summary}</p>
              </div>

              {/* Point Lists */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Key Structural Rules</h4>
                <ul className="space-y-2">
                  {activeTopic.points.map((point, index) => (
                    <li key={index} className="text-xs text-slate-350 flex items-start gap-2 leading-relaxed">
                      <ChevronRight className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div className="space-y-3 pt-3 border-t border-slate-900">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Interactive Examples</h4>
                
                <div className="space-y-2.5">
                  {activeTopic.examples.map((ex, index) => (
                    <div key={index} className="p-3 bg-slate-950 border border-slate-900/60 rounded-xl space-y-1">
                      <p className="text-xs font-semibold text-slate-200 select-all font-mono">
                        {ex.en}
                      </p>
                      <p className="text-[10.5px] text-slate-500 italic">
                        Context: {ex.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center text-slate-500 text-sm">
              Select a grammar topic to read structural rules.
            </div>
          )}

          {/* Interactive Cross-Domain Words Section (Rendered below topic sheet) */}
          <div className="glass rounded-2xl p-6 border-slate-800 space-y-4">
            
            <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-accent-400 font-extrabold uppercase tracking-widest">
                  Specialized Vocabulary Bridge
                </span>
                <h3 className="text-base font-bold text-white mt-1">Cross-Domain Word Matrix</h3>
              </div>
              <Sparkles className="h-5 w-5 text-accent-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              These words have distinct meanings across our focus tracks: casual gaming/immersion, technical systems/AI, and general business. Comparing them side-by-side accelerates contextual fluency.
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {crossDomainWords.map((cd, index) => (
                <div key={index} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3 text-xs leading-normal">
                  <h4 className="font-extrabold text-sm text-accent-300 uppercase tracking-wide border-b border-slate-900 pb-1 inline-block">
                    {cd.word}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* Game */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1.5 uppercase">
                        <Gamepad2 className="h-3 w-3" /> Gamer / Casual Sense
                      </span>
                      <p className="text-slate-350">{cd.game}</p>
                    </div>
                    {/* Tech */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-sky-400 flex items-center gap-1.5 uppercase">
                        <Laptop className="h-3 w-3" /> Tech / AI Sense
                      </span>
                      <p className="text-slate-350">{cd.tech}</p>
                    </div>
                    {/* Biz */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                        <Briefcase className="h-3 w-3" /> Business Sense
                      </span>
                      <p className="text-slate-350">{cd.biz}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
