import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QuantumMeter from '../components/QuantumMeter';
import IBMQuantumCircuit from '../components/IBMQuantumCircuit';
import IBMQuantumHistogram from '../components/IBMQuantumHistogram';
import SimulationView from '../components/SimulationView';
import AboutPage from './AboutPage';
import './account.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

// Modal for Quantum Information
const QInfoModal = ({ isOpen, onClose, metrics }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-gray-800 rounded-[1rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white text-2xl font-bold">×</button>
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-cyan-400 uppercase tracking-tighter">Quantum Physics Audit</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Real-Time BB84 & E91 Session Metrics</p>
                    </div>

                    <QuantumMeter qber={metrics.qber} sValue={metrics.sValue} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Circuit</h3>
                            <IBMQuantumCircuit circuit={metrics.circuit} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Histogram Analysis</h3>
                            <IBMQuantumHistogram histogram={metrics.histogram} isCompromised={!metrics.secure} />
                        </div>
                    </div>

                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                        <p className="text-[10px] font-mono text-gray-500 break-all uppercase tracking-widest leading-relaxed">
                            <span className="text-cyan-500">SESSION_IDENTIFIER:</span> {metrics.sessionId} <br/>
                            <span className="text-cyan-500">CHANNEL_STATUS:</span> {metrics.secure ? "CRYPTO_STABLE" : "COMPROMISED_INTERFERENCE"}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function VoterInterface() {
  const [activeTab, setActiveTab] = useState('about'); 
  const [step, setStep] = useState(1); 
  const [form, setForm] = useState({ voter_id: '', password: '' });
  const [metrics, setMetrics] = useState({ qber: 0, sValue: 0, secure: null, sessionId: null });
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  const [simulateEavesdropper, setSimulateEavesdropper] = useState(false);
  const [token, setToken] = useState('');
  const [voterName, setVoterName] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [voterDetails, setVoterDetails] = useState(null);
  const [isQInfoOpen, setIsQInfoOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const navigate = useNavigate();

  // Load token from session if exists
  useEffect(() => {
    const savedToken = sessionStorage.getItem('voterToken');
    if (savedToken) {
        setToken(savedToken);
        setVoterName(sessionStorage.getItem('voterName') || 'Voter');
        fetchVoterProfile(savedToken).then(details => {
            if (details) {
                if (!details.has_voted) {
                    setActiveTab('login');
                    setStep(2);
                    fetchCandidates(savedToken);
                } else {
                    setActiveTab('login');
                    fetchAccountData(savedToken);
                }
            }
        });
    }
  }, []);

  const fetchAccountData = async (tk) => {
    try {
        const hRes = await fetch(`${API_BASE}/voter/history`, { headers: { 'Authorization': `Bearer ${tk}` } });
        const hData = await hRes.json();
        if (hRes.ok) setHistory(hData.history);

        const oRes = await fetch(`${API_BASE}/elections/ongoing`, { headers: { 'Authorization': `Bearer ${tk}` } });
        const oData = await oRes.json();
        if (oRes.ok) setOngoing(oData.elections);

        const uRes = await fetch(`${API_BASE}/elections/upcoming`, { headers: { 'Authorization': `Bearer ${tk}` } });
        const uData = await uRes.json();
        if (uRes.ok) setUpcoming(uData.elections);
    } catch (err) {
        console.error(err);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMSG('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.access_token);
        setVoterName(data.voter_name);
        sessionStorage.setItem('voterToken', data.access_token);
        sessionStorage.setItem('voterName', data.voter_name);
        
        const details = await fetchVoterProfile(data.access_token);
        if (details) {
            sessionStorage.setItem('hasVoted', details.has_voted);
        }

        setActiveTab('login');
        if (!details?.has_voted) {
            await fetchCandidates(data.access_token);
            setStep(2);
        } else {
            fetchAccountData(data.access_token);
        }
      } else {
        setErrorMSG(data.detail || 'Login failed');
      }
    } catch (err) {
      setErrorMSG(`Server error: Unable to reach ${API_BASE}. Check your VITE_API_URL setting.`);
    }
  };

  const fetchVoterProfile = async (tk) => {
    try {
        const res = await fetch(`${API_BASE}/voter/profile`, {
            headers: { 'Authorization': `Bearer ${tk}` }
        });
        const data = await res.json();
        if (res.ok) {
            setVoterDetails(data.profile);
            return data.profile;
        }
    } catch (err) {
        console.error("Profile error:", err);
    }
    return null;
  };

  const fetchCandidates = async (tk) => {
    try {
        const cRes = await fetch(`${API_BASE}/voter/candidates`, {
            headers: { 'Authorization': `Bearer ${tk}` }
        });
        const cData = await cRes.json();
        if (cRes.ok) setCandidates(cData.candidates);
    } catch (err) {
        console.error(err);
    }
  };

  const castVote = async (candidate) => {
    setLoading(true);
    try {
      const qRes = await fetch(`${API_BASE}/quantum/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ simulate_eavesdropper: simulateEavesdropper })
      });
      const qData = await qRes.json();
      
      if (!qRes.ok) {
        setErrorMSG(qData.detail || 'Error initiating quantum channel');
        setLoading(false);
        return;
      }
      
      setMetrics({ 
        qber: qData.qber, 
        sValue: qData.s_value, 
        secure: qData.channel_status === "SECURE", 
        sessionId: qData.session_id,
        circuit: qData.circuit,
        histogram: qData.histogram
      });
      
      if (qData.channel_status !== "SECURE") {
        setLoading(false);
        setStep(3);
        return;
      }

      const vRes = await fetch(`${API_BASE}/vote/cast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ vote: candidate, session_id: qData.session_id })
      });
      
      if (vRes.ok) {
        setLoading(false);
        setStep(3);
        fetchVoterProfile(token).then(p => {
            if (p) fetchAccountData(token);
        });
      } else {
        const vData = await vRes.json();
        setErrorMSG(vData.detail);
        setLoading(false);
      }
    } catch (err) {
      setErrorMSG('Network error during voting process');
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setToken('');
    setStep(1);
    setActiveTab('about');
    window.location.reload();
  };

  return (
    <div className="qv-root flex flex-col font-mono overflow-x-hidden">
      <QInfoModal isOpen={isQInfoOpen} onClose={() => setIsQInfoOpen(false)} metrics={metrics} />
      
      {/* Premium Navbar */}
      <nav className="qv-nav">
        <div className="qv-logo cursor-pointer" onClick={() => navigate('/')}>
          <span>Q-Secure</span> Vote
        </div>
        
        <div className="qv-nav-links">
            <a onClick={() => setActiveTab('about')}>About</a>
            <a onClick={() => setActiveTab('simulation')}>Simulation</a>
            {token ? (
                <>
                    <a onClick={() => navigate('/account')} className="font-bold text-[#1aafff]">ACCOUNT</a>
                    <button onClick={logout} className="qv-nav-btn" style={{ borderColor: '#e74c3c', color: '#e74c3c' }}>LOGOUT</button>
                </>
            ) : (
                <button onClick={() => setActiveTab('login')} className="qv-nav-btn">VOTER LOGIN</button>
            )}
        </div>
      </nav>

      <div className={`flex-1 flex items-center justify-center p-4 ${activeTab === 'simulation' || activeTab === 'about' ? 'max-w-7xl mx-auto w-full' : ''}`}>
        <AnimatePresence mode="wait">
            {activeTab === 'about' && (
                <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                    <AboutPage />
                </motion.div>
            )}

            {activeTab === 'simulation' && (
                <motion.div key="simulation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                    <SimulationView />
                </motion.div>
            )}

            {activeTab === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
                    {voterDetails?.has_voted ? (
                        <div className="max-w-4xl mx-auto w-full space-y-8">
                            <div className="qv-voted-panel">
                                <div className="qv-voted-title uppercase">Secure Voting Terminal</div>
                                <div className="qv-alert">You have already cast your vote</div>
                                
                                <div style={{ background: '#111822', border: '1px solid #1e2a3a', borderRadius: '4px', padding: '16px 18px', marginBottom: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                                        <div className="qv-field">
                                            <span className="qv-label">Digital Voter ID</span>
                                            <span className="qv-val">{voterDetails.voter_id}</span>
                                        </div>
                                        <div className="qv-field">
                                            <span className="qv-label">Status</span>
                                            <span className="qv-val" style={{ color: '#2ecc71' }}>VOTE RECORDED</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="qv-btn-row">
                                    <button className="qv-btn-home" onClick={() => navigate('/')}>← BACK TO HOME</button>
                                    <button className="qv-btn-account" onClick={() => navigate('/account')}>FULL ACCOUNT DASHBOARD →</button>
                                </div>
                            </div>

                            {/* Mini Dashboard Preview */}
                            <div className="qv-account" style={{ maxWidth: '100%', margin: 0 }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="qv-section">
                                        <div className="qv-section-title">RECENT LEDGER ENTRIES</div>
                                        {history.slice(0, 2).map((h, i) => (
                                            <div className="qv-history-card" key={i} style={{ gridTemplateColumns: '1fr' }}>
                                                <div className="qv-field">
                                                    <span className="qv-label">Election</span>
                                                    <span className="qv-el-name">{h.election_name || "State Election 2026"}</span>
                                                </div>
                                                <div className="qv-field">
                                                    <span className="qv-label">Receipt Hash</span>
                                                    <span className="qv-val qv-hash">{h.vote_receipt_hash.substring(0, 24)}...</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="qv-section">
                                        <div className="qv-section-title">ELECTION ROADMAP</div>
                                        {upcoming.slice(0, 2).map((u, i) => (
                                            <div className="qv-election-card" key={i}>
                                                <div className="qv-el-header">
                                                    <div className="qv-el-title">{u.name}</div>
                                                    <span className="qv-el-type badge-upcoming">UPCOMING</span>
                                                </div>
                                                <div className="qv-el-meta">
                                                    <span>SCHEDULED: {u.scheduled_date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto w-full">
                            <div className="bg-[#111822] border border-[#1e2a3a] p-10 rounded-lg shadow-2xl relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f4a023] via-[#1aafff] to-[#2ecc71]"></div>
                                <h2 className="text-xl font-bold mb-8 text-[#1aafff] uppercase tracking-[2px] font-mono">Terminal Login</h2>
                                
                                {errorMSG && <div className="qv-alert">{errorMSG}</div>}

                                {step === 1 && (
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="qv-field">
                                            <label className="qv-label">Voter Identification</label>
                                            <input required className="w-full bg-[#0d1117] border border-[#1e2a3a] rounded p-4 text-white font-mono focus:outline-none focus:border-[#1aafff] transition-all" placeholder="AP2026000001" value={form.voter_id} onChange={e => setForm({...form, voter_id: e.target.value.toUpperCase()})} />
                                        </div>
                                        <div className="qv-field">
                                            <label className="qv-label">Quantum Passkey</label>
                                            <input required type="password" className="w-full bg-[#0d1117] border border-[#1e2a3a] rounded p-4 text-white focus:outline-none focus:border-[#1aafff] transition-all" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                                        </div>
                                        <button type="submit" className="qv-btn-account w-full mt-4">VERIFY IDENTITY</button>
                                    </form>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="bg-[#0d1117] p-4 border border-[#1e2a3a] rounded">
                                            <p className="qv-label">Current Election</p>
                                            <p className="text-sm font-bold text-white mt-1">State Assembly 2026</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" id="eve_v" checked={simulateEavesdropper} onChange={e => setSimulateEavesdropper(e.target.checked)} className="w-4 h-4 accent-[#1aafff]" />
                                            <label htmlFor="eve_v" className="qv-label cursor-pointer">Simulate Interference</label>
                                        </div>

                                        {loading ? (
                                            <div className="text-center py-10">
                                                <div className="w-12 h-12 border-4 border-[#1aafff]/20 border-t-[#1aafff] rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="qv-label animate-pulse">Initializing QKD Channel...</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                                {candidates.map(c => (
                                                    <button key={c} onClick={() => castVote(c)} className="w-full text-left p-4 bg-[#0d1117] border border-[#1e2a3a] hover:border-[#1aafff] transition-all rounded text-xs font-bold uppercase tracking-widest text-[#8899aa] hover:text-white group flex justify-between items-center">
                                                        {c}
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1aafff]">SELECT →</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6 text-center">
                                        <div className={`p-6 border rounded ${metrics.secure ? 'border-[#2ecc71]/30 bg-[#2ecc71]/5' : 'border-[#e74c3c]/30 bg-[#e74c3c]/5'}`}>
                                            <h3 className={`text-lg font-black uppercase tracking-widest mb-2 ${metrics.secure ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>
                                                {metrics.secure ? 'Ballot Sealed' : 'Security Breach'}
                                            </h3>
                                            <p className="qv-label leading-relaxed">
                                                {metrics.secure ? 'Your identity has been anonymized and your vote anchored on the quantum ledger.' : 'Quantum interference detected. The session has been terminated for your safety.'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => setIsQInfoOpen(true)} className="qv-btn-account w-full">VIEW QINFO AUDIT</button>
                                            <button onClick={() => navigate('/account')} className="qv-btn-home w-full">GO TO ACCOUNT →</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
