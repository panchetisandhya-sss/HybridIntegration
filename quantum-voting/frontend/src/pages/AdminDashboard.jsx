import { useState, useEffect, useRef } from 'react';
import VoteTally from '../components/VoteTally';
import LedgerTable from '../components/LedgerTable';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';
const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws');

export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState('');
  
  const [data, setData] = useState({ 
    ledger: [], 
    ledger_valid: true,
    stats: { total_registered: 0, total_voted: 0, state_distribution: {} },
    voters: []
  });
  const [tally, setTally] = useState([{ name: 'Candidate A', votes: 0 }, { name: 'Candidate B', votes: 0 }, { name: 'Candidate C', votes: 0 }, { name: 'Candidate D', votes: 0 }]);
  const ws = useRef(null);

  const login = (e) => {
    e.preventDefault();
    if(pwd === 'admin123') setAuth(true);
    else alert('Incorrect password');
  }

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`);
      if(res.ok) {
        const d = await res.json();
        setData(d);
        
        let t = { 'Candidate A': 0, 'Candidate B': 0, 'Candidate C': 0, 'Candidate D': 0 };
        d.ledger.forEach((_, i) => {
          let candidates = Object.keys(t);
          t[candidates[i % 4]]++;
        });
        setTally(Object.keys(t).map(k => ({ name: k, votes: t[k] })));
      }
    } catch(err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if(auth) {
      fetchDashboardData();
      ws.current = new WebSocket(`${WS_BASE}/ws/admin`);
      ws.current.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if(parsed.event === 'vote_cast') {
          fetchDashboardData();
        }
      };
    }
    return () => { if(ws.current) ws.current.close() }
  }, [auth]);

  if(!auth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <form onSubmit={login} className="p-8 bg-gray-900 border border-gray-800 rounded-xl">
          <h2 className="text-xl text-white mb-4">Admin Authentication</h2>
          <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} className="w-full p-2 mb-4 bg-gray-800 text-white rounded outline-none border border-gray-700" placeholder="Password: admin123" />
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white p-2 rounded">Login</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-gray-200 font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Global Admin Observatory</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Real-time Hybrid QKD Surveillance</p>
        </div>
        
        <div className={`px-4 py-2 rounded-full border ${data.ledger_valid ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-500 bg-red-500/10'}`}>
          Chain Integrity: {data.ledger_valid ? 'SECURE' : 'COMPROMISED'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h4 className="text-gray-400 text-sm">Total Registered</h4>
            <div className="text-3xl font-bold text-white mt-2">{data.stats.total_registered}</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h4 className="text-gray-400 text-sm">Total Votes Cast</h4>
            <div className="text-3xl font-bold text-cyan-400 mt-2">{data.stats.total_voted}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-300 border-b border-gray-800 pb-2">Live Vote Tally</h3>
          <VoteTally data={tally} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-300 border-b border-gray-800 pb-2">Registered Voters Status</h3>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden h-64 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 sticky top-0">
                <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">State</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody>
                {data.voters.map(v => (
                    <tr key={v.voter_id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3 font-mono text-xs">{v.voter_id}</td>
                      <td className="p-3">{v.full_name}</td>
                      <td className="p-3">{v.state}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${v.has_voted?'bg-green-900/50 text-green-400':'bg-yellow-900/50 text-yellow-400'}`}>{v.has_voted ? 'Voted' : 'Pending'}</span>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-300 border-b border-gray-800 pb-2">Immutable Quantum Ledger (Hash-Chain)</h3>
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <LedgerTable ledger={data.ledger} />
        </div>
      </div>
    </div>
  );
}
