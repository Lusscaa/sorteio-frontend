import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ParticipantsList.css';

const API = process.env.REACT_APP_API_URL || '/api';

const STATUS_MAP = {
  aguardando: { label: 'Aguardando validação', cls: 'badge-aguardando', icon: '⏳' },
  confirmado: { label: 'Confirmado', cls: 'badge-confirmado', icon: '✅' },
  reprovado: { label: 'Reprovado', cls: 'badge-reprovado', icon: '❌' },
};

export default function ParticipantsList({ refreshTrigger }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const res = await axios.get(`${API}/participants`);
      setParticipants(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshTrigger]);
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = participants.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = !search || p.nomeAbreviado.toLowerCase().includes(search.toLowerCase()) ||
      String(p.numeroParticipacao).includes(search);
    return matchFilter && matchSearch;
  });

  const counts = {
    all: participants.length,
    aguardando: participants.filter(p => p.status === 'aguardando').length,
    confirmado: participants.filter(p => p.status === 'confirmado').length,
    reprovado: participants.filter(p => p.status === 'reprovado').length,
  };

  return (
    <div className="participants-section">
      <div className="participants-header">
        <div className="participants-title">
          <h2>👥 Participantes</h2>
          <span className="total-badge">{participants.length} inscritos</span>
        </div>
        <div className="participants-controls">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar nome ou nº..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'confirmado', label: '✅ Confirmados' },
              { key: 'aguardando', label: '⏳ Aguardando' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className="tab-count">{counts[tab.key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="list-loading">
          <div className="spinner"></div>
          <span>Carregando participantes...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="list-empty">
          {participants.length === 0 ? (
            <>
              <span className="empty-icon">🎯</span>
              <h3>Seja o primeiro!</h3>
              <p>Nenhum participante ainda. Faça sua inscrição agora.</p>
            </>
          ) : (
            <>
              <span className="empty-icon">🔍</span>
              <p>Nenhum participante encontrado com este filtro.</p>
            </>
          )}
        </div>
      ) : (
        <div className="participants-grid">
          {filtered.map((p, i) => {
            const st = STATUS_MAP[p.status] || STATUS_MAP.aguardando;
            return (
              <div
                key={p.id}
                className={`participant-card ${p.status}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="participant-number">
                  Nº {String(p.numeroParticipacao).padStart(3, '0')}
                </div>
                <div className="participant-name">{p.nomeAbreviado}</div>
                <div className={`badge ${st.cls}`}>
                  {st.icon} {st.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="list-note">
        🔄 Lista atualizada automaticamente a cada 15 segundos
      </p>
    </div>
  );
}
