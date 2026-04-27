import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './account.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

export default function VoterAccount() {
    const [token, setToken] = useState(sessionStorage.getItem('voterToken') || '');
    const [voterName, setVoterName] = useState(sessionStorage.getItem('voterName') || 'Voter');
    const [voterDetails, setVoterDetails] = useState(null);
    const [history, setHistory] = useState([]);
    const [ongoingElections, setOngoingElections] = useState([]);
    const [upcomingElections, setUpcomingElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/vote');
            return;
        }
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const pRes = await fetch(`${API_BASE}/voter/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pData = await pRes.json();
            if (pRes.ok) setVoterDetails(pData.profile);

            const hRes = await fetch(`${API_BASE}/voter/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const hData = await hRes.json();
            if (hRes.ok) setHistory(hData.history);

            const onRes = await fetch(`${API_BASE}/elections/ongoing`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const onData = await onRes.json();
            if (onRes.ok) setOngoingElections(onData.elections);

            const upRes = await fetch(`${API_BASE}/elections/upcoming`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const upData = await upRes.json();
            if (upRes.ok) setUpcomingElections(upData.elections);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="qv-root flex items-center justify-center">
                <div className="text-[#1aafff] font-mono animate-pulse tracking-[4px] text-xs uppercase">Connecting to Quantum Ledger...</div>
            </div>
        );
    }

    return (
        <div className="qv-root">
            {/* Nav */}
            <nav className="qv-nav">
                <div className="qv-logo cursor-pointer" onClick={() => navigate('/')}>
                    <span>Q-Secure</span> Vote
                </div>
                <div className="qv-nav-links">
                    <a onClick={() => navigate('/vote')}>About</a>
                    <a onClick={() => navigate('/vote')}>Simulation</a>
                    <button className="qv-nav-btn" style={{ borderColor: '#e74c3c', color: '#e74c3c' }} onClick={logout}>LOGOUT</button>
                </div>
            </nav>

            <div className="qv-account">
                <div className="qv-back" onClick={() => navigate('/vote')}>← BACK TO VOTE PAGE</div>

                {/* Section A: History */}
                <div className="qv-section">
                    <div className="qv-section-title">VOTING HISTORY</div>
                    {history.length === 0 ? (
                        <div className="qv-history-card" style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                            <span className="qv-label">No voting history found on the secure ledger.</span>
                        </div>
                    ) : (
                        history.map((h, i) => {
                            const dt = new Date(h.voted_at.replace(' ', 'T'));
                            const date = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
                            const time = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="qv-history-card"
                                >
                                    <div className="qv-field" style={{ gridColumn: '1/-1' }}>
                                        <span className="qv-label">Election Name</span>
                                        <span className="qv-el-name">{h.election_name}</span>
                                    </div>
                                    <div className="qv-field">
                                        <span className="qv-label">Vote Hash</span>
                                        <span className="qv-val qv-hash">{h.vote_receipt_hash.substring(0, 10)}...{h.vote_receipt_hash.substring(h.vote_receipt_hash.length - 4)}</span>
                                    </div>
                                    <div className="qv-field">
                                        <span className="qv-label">Election Type</span>
                                        <span className="qv-val">{h.election_type}</span>
                                    </div>
                                    <div className="qv-field">
                                        <span className="qv-label">Date</span>
                                        <span className="qv-val">{date}</span>
                                    </div>
                                    <div className="qv-field">
                                        <span className="qv-label">Timestamp</span>
                                        <span className="qv-val">{time} IST</span>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Section B: Ongoing */}
                <div className="qv-section">
                    <div className="qv-section-title">ONGOING ELECTIONS</div>
                    {ongoingElections.map((el, i) => (
                        <div className="qv-election-card" key={i}>
                            <div className="qv-el-header">
                                <div className="qv-el-title">{el.name}</div>
                                <span className={`qv-el-type badge-${el.type?.toLowerCase()}`}>{el.type?.toUpperCase()}</span>
                            </div>
                            <div className="qv-el-meta">
                                <span>START: {el.start_date}</span>
                                <span>END: {el.end_date}</span>
                            </div>
                            <div style={{ fontSize:'12px', color:'#566575', marginBottom:'12px', fontFamily:'"Share Tech Mono",monospace' }}>
                                Candidates: {Array.isArray(el.candidates) ? el.candidates.join(' | ') : el.candidates}
                            </div>
                            <div className="qv-el-footer">
                                {el.has_voted ? (
                                    <>
                                        <span className="qv-voted-badge">✓ VOTE CAST</span>
                                        <button className="qv-vote-now" disabled>ALREADY VOTED</button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontSize:'11px', color:'#f4a023', fontFamily:'"Share Tech Mono",monospace', letterSpacing:'1px' }}>ELIGIBLE</span>
                                        <button className="qv-vote-now" onClick={() => navigate('/vote')}>VOTE NOW</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section C: Upcoming */}
                <div className="qv-section">
                    <div className="qv-section-title">UPCOMING ELECTIONS</div>
                    {upcomingElections.map((el, i) => (
                        <div className="qv-election-card" key={i}>
                            <div className="qv-el-header">
                                <div className="qv-el-title">{el.name}</div>
                                <span className={`qv-el-type badge-${el.type?.toLowerCase()}`}>{el.type?.toUpperCase()}</span>
                            </div>
                            <div className="qv-el-meta">
                                <span>SCHEDULED: {el.scheduled_date}</span>
                            </div>
                            <div className="qv-el-footer">
                                <span className="qv-el-type badge-upcoming">UPCOMING</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
