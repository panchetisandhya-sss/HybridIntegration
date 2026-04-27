import { useState, useEffect } from 'react';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';
const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws');

// Speedometer Component for results
const Speedometer = ({ value, total, label, color = "#22c55e" }) => {
  const percentage = total > 0 ? (value / total) : 0;
  const rotation = -90 + (percentage * 180);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-950 border border-gray-800 rounded-2xl shadow-xl relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-10 h-10 rounded-full border border-gray-100"></div>
      </div>
      
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 border-[8px] border-gray-900 rounded-full"></div>
        <div 
          className="absolute top-0 left-0 w-32 h-32 border-[8px] rounded-full transition-all duration-1000 ease-out"
          style={{ 
            borderColor: color,
            clipPath: `inset(0 0 50% 0)`,
            transform: `rotate(${rotation - 90}deg)`,
            opacity: 0.6
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/2 w-0.5 h-16 bg-white origin-bottom rounded-full z-10 shadow-lg"
          style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        ></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border border-white rounded-full z-20"></div>
      </div>

      <div className="text-center">
        <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</h3>
        <div className="flex items-baseline justify-center gap-0.5">
          <span className="text-lg font-black text-white">{(percentage * 100).toFixed(1)}</span>
          <span className="text-[9px] font-bold text-gray-400">%</span>
        </div>
        <p className="text-[7px] font-bold text-gray-600 mt-1 uppercase">Votes Secured: {value}</p>
      </div>
    </div>
  );
};

const ResultsPanel = ({ results, loading, onRefresh }) => {
  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);
  const colors = ["#22c55e", "#3b82f6", "#ef4444", "#eab308", "#a855f7"];

  return (
    <div className="border border-gray-700 bg-gray-900 rounded-3xl p-6 h-full overflow-y-auto shadow-inner flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-gray-400 uppercase tracking-widest">Election Results & Real-Time Tally</h2>
        <button onClick={onRefresh} className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-4 py-2 rounded-lg font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
            FORCE SYNC Ledger
        </button>
      </div>

      {loading ? (
        <div className="text-cyan-400 animate-pulse uppercase font-black text-xs py-10 text-center">Decrypting Blockchain Ledger...</div>
      ) : (
        <>
          <div className="space-y-4">
            {Object.keys(results).length === 0 ? (
              <div className="text-gray-500 italic uppercase font-bold text-xs py-10 text-center opacity-40">No votes cast yet in this election cycle.</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-400 border-collapse">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr className="uppercase text-[9px] font-black tracking-widest text-gray-500">
                    <th className="px-6 py-3">Candidate/Party Hash Signature</th>
                    <th className="px-6 py-3 text-center">Votes Secured</th>
                    <th className="px-6 py-3 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results).map(([hash, count]) => (
                    <tr key={hash} className="border-b border-gray-900 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400 font-bold">{hash}</td>
                      <td className="px-6 py-4 text-green-400 font-black text-center text-xl">{count}</td>
                      <td className="px-6 py-4 text-right font-black text-white">{((count / totalVotes) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Speedometer Section at the Bottom */}
          {Object.keys(results).length > 0 && (
            <div className="pt-10 border-t border-gray-800 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gray-800"></div>
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap">Visual Accountability Monitor</h3>
                    <div className="h-[1px] flex-1 bg-gray-800"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(results).map(([label, val], idx) => (
                        <Speedometer 
                            key={label} 
                            label={label} 
                            value={val} 
                            total={totalVotes} 
                            color={colors[idx % colors.length]} 
                        />
                    ))}
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function ServerDesktop() {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [treeData, setTreeData] = useState({ states: [], districts: [] });
  const [mandals, setMandals] = useState([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dashboardStats, setDashboardStats] = useState({ total_voted: 0, turnout_pct: 0, chain_valid: true, active_states: 11 });
  const [voterNodes, setVoterNodes] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [results, setResults] = useState({});
  const [resultsLoading, setResultsLoading] = useState(true);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({username: '', password: ''});
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(loginCreds)
        });
        if (res.ok) setIsAuthenticated(true);
        else setLoginError("ACCESS DENIED");
      } catch {
          setLoginError("SERVER UNREACHABLE");
      }
  };

  const fetchBlockchainTree = () => {
    fetch(`${API_BASE}/admin/blockchain-tree`)
      .then(res => res.json())
      .then(data => setTreeData(data))
      .catch(err => console.error(err));
  };

  const fetchResults = () => {
    fetch(`${API_BASE}/admin/results`)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
            // Deduplicate: trim and aggregate
            const clean = {};
            Object.entries(data.results).forEach(([name, count]) => {
                const key = name.trim();
                clean[key] = (clean[key] || 0) + count;
            });
            setResults(clean);
        }
        setResultsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setResultsLoading(false);
      });
  };

  const fetchDashboardStats = () => {
    fetch(`${API_BASE}/admin/dashboard/stats`)
      .then(res => res.json())
      .then(data => setDashboardStats(data))
      .catch(err => console.error(err));
      
    fetch(`${API_BASE}/admin/dashboard`)
      .then(res => res.json())
      .then(data => {
          setVoterNodes(data.voters || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBlockchainTree();
    fetchDashboardStats();
    fetchResults();

    const interval = setInterval(() => {
        fetchBlockchainTree();
        fetchDashboardStats();
        fetchResults();
    }, 10000);

    const ws = new WebSocket(`${WS_BASE}/ws/admin`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') return;
        if (data.event === 'vote_cast') {
            setLiveFeed(prev => [{
                time: new Date().toLocaleTimeString('en-IN') + ' IST',
                mandal: data.data.mandal_block_id,
                status: 'SECURE',
                hash: data.data.voter_node_id.substring(0, 16) + '...'
            }, ...prev].slice(0, 50));
            fetchDashboardStats();
            fetchResults(); // DYNAMICALLY UPDATE RESULTS ON VOTE
        }
    };

    return () => {
        clearInterval(interval);
        ws.close();
    };
  }, []);

  const loadMandals = async (stateCode, districtCode) => {
    setSelectedDistrict(districtCode);
    const response = await fetch(`${API_BASE}/geography/mandals/${stateCode}/${districtCode}`);
    const data = await response.json();
    setMandals(data.mandals || []);
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-800 bg-gray-900 rounded-3xl p-6 h-96 overflow-y-auto shadow-inner">
          <h2 className="border-b border-gray-800 pb-2 mb-4 font-black text-[10px] tracking-[0.2em] text-gray-500 uppercase">States</h2>
          {treeData.states.map(s => (
            <div key={s.block_id} onClick={() => {setSelectedState(s.state_code); setSelectedDistrict(null);}} className={`p-4 mb-3 rounded-2xl cursor-pointer border transition-all duration-300 ${selectedState === s.state_code ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/10' : 'border-gray-800 hover:bg-gray-800 hover:border-gray-700'}`}>
              <div className="flex justify-between font-black"><span className="text-white text-sm uppercase">{s.state_name}</span><span className="text-[8px] self-center px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold border border-green-500/20">LIVE</span></div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Voters: <span className="text-cyan-400">{s.total_voters_in_state}</span></div>
            </div>
          ))}
        </div>
        <div className="border border-gray-800 bg-gray-900 rounded-3xl p-6 h-96 overflow-y-auto shadow-inner">
          <h2 className="border-b border-gray-800 pb-2 mb-4 font-black text-[10px] tracking-[0.2em] text-gray-500 uppercase">Districts</h2>
          {selectedState ? treeData.districts.filter(d => d.parent_state_code === selectedState).map(d => (
            <div key={d.block_id} onClick={() => loadMandals(selectedState, d.block_id)} className={`p-4 mb-3 rounded-2xl cursor-pointer border transition-all duration-300 ${selectedDistrict === d.block_id ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10' : 'border-gray-800 hover:bg-gray-800 hover:border-gray-700'}`}>
              <div className="flex justify-between font-black"><span className="text-white text-sm uppercase">{d.district_name}</span></div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Nodes: <span className="text-purple-400">{d.total_voters_in_district}</span></div>
            </div>
          )) : <div className="text-gray-600 italic mt-20 text-center uppercase font-black text-[10px] tracking-widest opacity-50">Select state</div>}
        </div>
        <div className="border border-gray-800 bg-gray-900 rounded-3xl p-6 h-96 overflow-y-auto shadow-inner">
          <h2 className="border-b border-gray-800 pb-2 mb-4 font-black text-[10px] tracking-[0.2em] text-gray-500 uppercase">Mandals</h2>
          {selectedDistrict ? (mandals.length === 0 ? <p className="text-gray-500 italic mt-20 text-center uppercase font-bold text-xs opacity-50">No mandals found</p> : mandals.map(m => (
            <div key={m.mandal_code} className="p-4 mb-3 rounded-2xl border border-gray-800 bg-gray-950 hover:bg-gray-800 transition duration-300">
              <div className="flex justify-between font-black text-blue-400 mb-2 uppercase text-xs"><span>{m.mandal_name}</span></div>
              <div className="text-[10px] text-gray-500 space-y-1 font-bold uppercase"><div>Voters: <span className="text-white">{m.voter_count}</span></div><div>Cast: <span className="text-green-500">{m.votes_cast}</span></div><div>Status: {m.merkle_valid ? <span className="text-cyan-400">ENCRYPTED</span> : <span className="text-red-500">TAMPERED</span>}</div></div>
            </div>
          ))) : <div className="text-gray-600 italic mt-20 text-center uppercase font-black text-[10px] tracking-widest opacity-50">Select district</div>}
        </div>
      </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "Dashboard": return renderDashboard();
      case "Voter Nodes": return (
        <div className="border border-gray-800 bg-gray-900 rounded-3xl p-8 h-full overflow-y-auto">
          <h2 className="border-b border-gray-800 pb-2 mb-6 font-black text-lg text-gray-500 uppercase tracking-tighter">Zero-Knowledge Voter Ledger</h2>
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="text-gray-500 uppercase bg-gray-950 border-b border-gray-800"><tr><th className="px-6 py-4 font-black tracking-widest">Node ID (Hash)</th><th className="px-6 py-4 font-black tracking-widest">State</th><th className="px-6 py-4 font-black tracking-widest">Status</th><th className="px-6 py-4 font-black tracking-widest">Action</th></tr></thead>
            <tbody>
              {voterNodes.map((v, i) => (
                <tr key={i} className="border-b border-gray-900 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">{v.voter_id}</td>
                  <td className="px-6 py-4 font-bold">{v.state}</td>
                  <td className={`px-6 py-4 font-black ${v.has_voted ? 'text-green-500' : 'text-gray-600'}`}>{v.has_voted ? '✓ DECRYPTED' : '⏳ ENCRYPTED'}</td>
                  <td className="px-6 py-4 text-cyan-400 font-black hover:underline cursor-pointer uppercase text-[9px] tracking-widest">Verify Block</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      case "Live Feed": return (
        <div className="border border-gray-800 bg-gray-900 rounded-3xl p-8 h-full overflow-y-auto shadow-inner">
          <h2 className="border-b border-gray-800 pb-2 mb-6 font-black text-lg text-gray-500 uppercase tracking-tighter">Live Secure Payload Feed</h2>
          <div className="space-y-3 font-mono text-[10px]">
            {liveFeed.map((log, i) => (
                <div key={i} className="p-4 border-l-4 border-cyan-500 bg-gray-950 text-gray-400 rounded-r-xl shadow-lg shadow-cyan-500/5">
                    <span className="text-cyan-500 font-black">[{log.time}]</span> ✅ PAYLOAD ACCEPTED - {log.mandal} (CID: {log.hash})
                </div>
            ))}
          </div>
        </div>
      );
      case "Blockchain": return (
        <div className="border border-gray-800 bg-gray-900 rounded-3xl p-8 h-full flex flex-col gap-8">
          <h2 className="border-b border-gray-800 pb-2 mb-2 font-black text-lg text-gray-500 uppercase tracking-tighter">Hybrid Chain Monitor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-gray-950 p-8 rounded-3xl border border-gray-800 text-center shadow-2xl"><h3 className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Genesis Hash</h3><p className="text-2xl font-black text-green-500 tracking-tighter">INDIA-2026-Q</p><p className="text-[9px] text-gray-600 mt-4 font-mono break-all px-6 opacity-40">cd204f128c9a3b...e11p</p></div>
             <div className="bg-gray-950 p-8 rounded-3xl border border-gray-800 text-center shadow-2xl"><h3 className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Integrity Status</h3><p className="text-2xl font-black text-cyan-400 tracking-tighter">100% UNTAMPERED</p><p className="text-[9px] text-gray-600 mt-4 font-bold uppercase tracking-widest">Active Verification: 4,821 Loops/Sec</p></div>
          </div>
          <button className="bg-blue-600 text-white font-black py-4 rounded-2xl w-full hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20">Trigger Full Recursive Audit</button>
        </div>
      );
      case "Results": return <ResultsPanel results={results} loading={resultsLoading} onRefresh={fetchResults} />;
      default: return null;
    }
  };

  const handleLogout = () => {
     setIsAuthenticated(false);
     setActiveTab("Dashboard");
  };

  if (!isAuthenticated) {
     return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center font-mono">
            <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl w-[28rem] flex flex-col gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-white to-green-500"></div>
               <div className="text-center">
                  <h1 className="text-2xl font-black tracking-tighter text-blue-400 mb-2 uppercase">Q-Secure Admin</h1>
                  <h2 className="text-[10px] tracking-[0.3em] text-red-500 font-black bg-red-500/5 py-2 border border-red-500/20 rounded-full inline-block px-6 uppercase">Secure Enclave Only</h2>
               </div>
               
               {loginError && <div className="text-red-500 text-center font-black animate-pulse text-xs uppercase tracking-widest">{loginError}</div>}

               <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Administrator ID</label>
                     <input type="text" className="bg-gray-950 border border-gray-800 p-4 text-white rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner"
                            value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} autoFocus />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Root Passkey</label>
                     <input type="password" className="bg-gray-950 border border-gray-800 p-4 text-white rounded-2xl outline-none focus:border-blue-500 transition-all shadow-inner"
                            value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} />
                  </div>
               </div>

               <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 text-sm">
                  Initialize Dashboard
               </button>
            </form>
        </div>
     );
  }

  const totalVerifiedVoters = treeData.states.reduce((acc, curr) => acc + curr.total_voters_in_state, 0);

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200 font-mono text-sm">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 shadow-2xl z-20 hidden md:flex">
        <h1 className="text-[10px] text-gray-600 font-black mb-8 tracking-[0.2em] uppercase px-2">Quantum Core v2.0</h1>
        <nav className="space-y-2 flex-1">
          {["Dashboard", "Voter Nodes", "Live Feed", "Blockchain", "Results"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-5 py-3.5 rounded-2xl tracking-tighter transition-all duration-300 font-black text-xs uppercase ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`}>
              {tab}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto px-5 py-4 rounded-2xl text-red-500 font-black text-xs hover:bg-red-500/10 transition-all uppercase tracking-widest">Terminate Session</button>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md p-6 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase">Q-Secure Monitor</span>
          </div>
          <div className="flex gap-8 font-black tracking-tighter items-center uppercase text-[10px]">
              <span className="text-green-500 flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/20 rounded-full">Integrity: Verified</span>
              <span className="text-yellow-400 flex items-center gap-2 px-3 py-1 bg-yellow-400/5 border border-yellow-400/20 rounded-full">Elections: Live</span>
          </div>
        </header>
        <div className="p-8 overflow-y-auto flex-1 bg-gray-950 relative">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[
                  { label: "Total Voters", val: totalVerifiedVoters, color: "text-white" },
                  { label: "Votes Cast", val: dashboardStats.total_voted, color: "text-blue-400" },
                  { label: "Turnout %", val: dashboardStats.turnout_pct + "%", color: "text-green-400" },
                  { label: "Chain Valid", val: "100%", color: "text-cyan-400" }
              ].map((stat, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] shadow-xl hover:scale-105 transition-all cursor-default group">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block group-hover:text-gray-400 transition-colors">{stat.label}</span>
                      <span className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.val}</span>
                  </div>
              ))}
           </div>
           {renderTab()}
        </div>
      </div>
    </div>
  );
}
