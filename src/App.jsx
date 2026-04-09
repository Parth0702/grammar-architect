import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import GardenScreen from './screens/GardenScreen.jsx';
import CleaningScreen from './screens/CleaningScreen.jsx';
import BinaryBloomScreen from './screens/BinaryBloomScreen.jsx';
import FlowerFirstScreen from './screens/FlowerFirstScreen.jsx';
import SandboxScreen from './screens/SandboxScreen.jsx';
import { parseGrammar } from './engine/grammar.js';
import { runFullConversion } from './engine/engine.js';

const TABS = [
  { id: 'garden', label: 'Input', icon: 'edit_note' },
  { id: 'cleaning', label: 'Cleaning', icon: 'mop' },
  { id: 'binary', label: 'CNF', icon: 'code' },
  { id: 'flower', label: 'GNF', icon: 'terminal' },
  { id: 'sandbox', label: 'Tester', icon: 'check_circle' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('garden');
  const [grammar, setGrammar] = useState(null);
  const [conversionSteps, setConversionSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetForm, setTargetForm] = useState('CNF');
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState('');

  const handleConvert = useCallback((text, target = 'CNF') => {
    try {
      setError(null);
      const g = parseGrammar(text);
      setGrammar(g);
      setTargetForm(target);
      setInputText(text);
      const steps = runFullConversion(g, target);
      setConversionSteps(steps);
      setCurrentStep(0);
      setActiveTab('cleaning');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(0, Math.min(step, conversionSteps.length - 1)));
  }, [conversionSteps.length]);

  const getPhaseSteps = useCallback((phases) => {
    return conversionSteps.filter(s => phases.includes(s.phase));
  }, [conversionSteps]);

  const cleaningSteps = getPhaseSteps(['input', 'epsilon', 'unit', 'useless']);
  const cnfSteps = getPhaseSteps(['cnf_term', 'cnf_bin']);
  const gnfSteps = getPhaseSteps(['gnf_rank', 'gnf_substitute', 'gnf_left_recursion', 'gnf_backsubstitute']);

  const cleanedGrammar = cleaningSteps.length > 0 ? cleaningSteps[cleaningSteps.length - 1]?.grammar : grammar;
  const cnfGrammar = cnfSteps.length > 0 ? cnfSteps[cnfSteps.length - 1]?.grammar : cleanedGrammar;
  const finalGrammar = conversionSteps.length > 0 ? conversionSteps[conversionSteps.length - 1]?.grammar : grammar;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      <Header tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} hasGrammar={!!grammar} />

      <main className="pt-20 pb-28 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
        {activeTab === 'garden' && (
          <GardenScreen onConvert={handleConvert} error={error} inputText={inputText}
            setInputText={setInputText} grammar={grammar} targetForm={targetForm} setTargetForm={setTargetForm} />
        )}
        {activeTab === 'cleaning' && (
          <CleaningScreen steps={cleaningSteps} allSteps={conversionSteps}
            currentStep={currentStep} goToStep={goToStep} grammar={grammar} />
        )}
        {activeTab === 'binary' && (
          <BinaryBloomScreen steps={cnfSteps} allSteps={conversionSteps}
            currentStep={currentStep} goToStep={goToStep} baseGrammar={cleanedGrammar} />
        )}
        {activeTab === 'flower' && (
          <FlowerFirstScreen steps={gnfSteps} allSteps={conversionSteps}
            currentStep={currentStep} goToStep={goToStep} baseGrammar={cnfGrammar} targetForm={targetForm} />
        )}
        {activeTab === 'sandbox' && (
          <SandboxScreen cnfGrammar={cnfGrammar} finalGrammar={finalGrammar} grammar={grammar} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-low/70 backdrop-blur-lg shadow-[0_-10px_40px_rgba(6,14,32,0.8)] md:hidden">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary-container rounded-full px-5 py-2 shadow-[0_0_15px_rgba(195,255,156,0.5)]'
                : 'text-slate-500 opacity-70 hover:opacity-100 hover:text-primary'
            }`}>
            <span className="material-symbols-outlined text-xl"
              style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
