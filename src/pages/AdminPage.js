import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPage.css';

const API = process.env.REACT_APP_API_URL || '/api';

const STATUS_MAP = {
  aguardando: { label: 'Aguardando', cls: 'badge-aguardando', icon: '⏳' },
  confirmado: { label: 'Confirmado', cls: 'badge-confirmado', icon: '✅' },
  reprovado: { label: 'Reprovado', cls: 'badge-reprovado', icon: '❌' },
};

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawResult, setDrawResult] = useState(null);
  const [config, setConfig] = useState({ drawDate: '', showReprovados: false });
  const [configSaving, setConfigSaving] = useState(false);
  const [tab, setTab] = useState('participants');
  const [winners, setWinners] = useState([]);
  const [toast, setToast] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, sRes, cRes, wRes] = await Promise.all([
        axios.get(`${API}/admin/participants`, authHeader),
        axios.get(`${API}/admin/stats`, authHeader),
        axios.get(`${API}/admin/config`, authHeader),
        axios.get(`${API}/admin/winners`, authHeader),
      ]);
      setParticipants(pRes.data);
      setStats(sRes.data);
      setConfig(cRes.data);
      setWinners(wRes.data);
    } catch (e) {
      if (e.response?.status === 401) {
        setToken('');
        localStorage.removeItem('adminToken');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const login = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { password });
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
    } catch {
      setLoginError('Senha incorreta. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/admin/participants/${id}/status`, { status }, authHeader);
      setParticipants(ps => ps.map(p => p.id === id ? { ...p, status } : p));
      if (selected?.id === id) setSelected(s => ({ ...s, status }));
      showToast(`Status atualizado: ${STATUS_MAP[status].label}`);
    } catch {
      showToast('Erro ao atualizar status');
    }
  };

  const deleteParticipant = async (id) => {
    if (!window.confirm('Excluir este participante?')) return;
    try {
      await axios.delete(`${API}/admin/participants/${id}`, authHeader);
      setParticipants(ps => ps.filter(p => p.id !== id));
      if (selected?.id === id) setSelected(null);
      showToast('Participante excluído');
    } catch {
      showToast('Erro ao excluir');
    }
  };

  const performDraw = async () => {
    if (!window.confirm('Realizar o sorteio agora? Apenas participantes CONFIRMADOS serão considerados.')) return;
    setDrawLoading(true);
    try {
      const res = await axios.post(`${API}/admin/draw`, {}, authHeader);
      setDrawResult(res.data.winner);
      showToast('🏆 Sorteio realizado com sucesso!');
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Erro ao realizar sorteio');
    } finally {
      setDrawLoading(false);
    }
  };

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      await axios.put(`${API}/admin/config`, config, authHeader);
      showToast('Configurações salvas');
    } catch {
      showToast('Erro ao salvar configurações');
    } finally {
      setConfigSaving(false);
    }
  };

  const exportCSV = () => {
    const link = document.createElement('a');
    link.href = `${API}/admin/export`;
    link.setAttribute('download', 'participantes.csv');

    // Need to add auth - workaround via fetch
    fetch(`${API}/admin/export`, authHeader)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
  };

  const filtered = participants.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.whatsapp.includes(search) ||
      String(p.numeroParticipacao).includes(search);
    return matchFilter && matchSearch;
  });

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="admin-login">
        <div className="login-box card-gold">
          <div className="login-logo">🔐</div>
          <h1>Painel Admin</h1>
          <p>Sorteio VIP iPhone 17 Pro Max</p>

          <div className="field-group">
            <label>Senha de acesso</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a senha"
              onKeyDown={e => e.key === 'Enter' && login()}
              autoFocus
            />
          </div>

          {loginError && <div className="form-error">{loginError}</div>}

          <button
            className="btn-gold"
            onClick={login}
            disabled={loginLoading || !password}
            style={{ width: '100%', padding: '14px' }}
          >
            {loginLoading ? <><span className="spinner"></span> Entrando...</> : 'Entrar'}
          </button>

          <a href="/" className="back-link">← Voltar ao site</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-icon">⚙️</span>
          <div>
            <h1>Painel Admin</h1>
            <p>Sorteio VIP iPhone 17 Pro Max</p>
          </div>
        </div>
        <div className="admin-actions">
          <button className="btn-outline" onClick={exportCSV}>📥 Exportar CSV</button>
          <button className="btn-outline" onClick={logout} style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
            Sair
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-bar">
        {[
          { label: 'Total', value: stats.total || 0, icon: '👥' },
          { label: 'Aguardando', value: stats.aguardando || 0, icon: '⏳', cls: 'gold' },
          { label: 'Confirmados', value: stats.confirmados || 0, icon: '✅', cls: 'green' },
          { label: 'Reprovados', value: stats.reprovados || 0, icon: '❌', cls: 'red' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls || ''}`}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { key: 'participants', label: '👥 Participantes' },
          { key: 'draw', label: '🎲 Sorteio' },
          { key: 'config', label: '⚙️ Configurações' },
        ].map(t => (
          <button
            key={t.key}
            className={`admin-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">

        {/* PARTICIPANTS TAB */}
        {tab === 'participants' && (
          <div className="participants-tab">
            <div className="table-controls">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Buscar por nome, e-mail, WhatsApp ou nº..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="filter-tabs">
                {['all', 'aguardando', 'confirmado', 'reprovado'].map(f => (
                  <button
                    key={f}
                    className={`filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'Todos' : STATUS_MAP[f].icon + ' ' + STATUS_MAP[f].label}
                    <span className="tab-count">
                      {f === 'all' ? participants.length : participants.filter(p => p.status === f).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-3)' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                Carregando...
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>WhatsApp</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const st = STATUS_MAP[p.status] || STATUS_MAP.aguardando;
                      return (
                        <tr key={p.id} className={selected?.id === p.id ? 'row-selected' : ''}>
                          <td className="td-num">
                            <span className="num-badge">{String(p.numeroParticipacao).padStart(3,'0')}</span>
                          </td>
                          <td>
                            <button className="name-btn" onClick={() => setSelected(p)}>
                              {p.nome}
                            </button>
                          </td>
                          <td className="td-email">{p.email}</td>
                          <td>{p.whatsapp}</td>
                          <td>
                            <span className={`badge ${st.cls}`}>{st.icon} {st.label}</span>
                          </td>
                          <td className="td-date">
                            {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            <div className="action-btns">
                              {p.status !== 'confirmado' && (
                                <button className="action-btn confirm" onClick={() => updateStatus(p.id, 'confirmado')} title="Confirmar">✅</button>
                              )}
                              {p.status !== 'aguardando' && (
                                <button className="action-btn wait" onClick={() => updateStatus(p.id, 'aguardando')} title="Aguardando">⏳</button>
                              )}
                              {p.status !== 'reprovado' && (
                                <button className="action-btn reprove" onClick={() => updateStatus(p.id, 'reprovado')} title="Reprovar">❌</button>
                              )}
                              <button className="action-btn view" onClick={() => setSelected(p)} title="Ver detalhes">👁</button>
                              <button className="action-btn delete" onClick={() => deleteParticipant(p.id)} title="Excluir">🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-3)' }}>
                    Nenhum participante encontrado.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DRAW TAB */}
        {tab === 'draw' && (
          <div className="draw-tab">
            <div className="draw-card card-gold">
              <h2>🎲 Realizar Sorteio</h2>
              <p>
                O sorteio considera apenas participantes com status <strong className="green-text">Confirmado</strong>.
                Há <strong className="green-text">{stats.confirmados || 0}</strong> participante(s) confirmado(s).
              </p>
              <button
                className="btn-gold"
                style={{ fontSize: '1.1rem', padding: '18px 40px', marginTop: '16px' }}
                onClick={performDraw}
                disabled={drawLoading || !stats.confirmados}
              >
                {drawLoading ? <><span className="spinner"></span> Sorteando...</> : '🎯 Realizar Sorteio Agora'}
              </button>
            </div>

            {drawResult && (
              <div className="draw-result card-gold fade-in-up">
                <div style={{ fontSize: '3rem', textAlign: 'center' }}>🏆</div>
                <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', color: 'var(--gold-light)' }}>
                  VENCEDOR
                </h2>
                <div style={{ textAlign: 'center', fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                  {drawResult.nome}
                </div>
                <div style={{ textAlign: 'center', color: 'var(--gray-2)' }}>
                  Nº {String(drawResult.numeroParticipacao).padStart(3,'0')} · {drawResult.email} · {drawResult.whatsapp}
                </div>
              </div>
            )}

            {winners.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '16px' }}>
                  Histórico de Sorteios
                </h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vencedor</th>
                        <th>Nº</th>
                        <th>E-mail</th>
                        <th>Data do Sorteio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...winners].reverse().map((w, i) => (
                        <tr key={i}>
                          <td><strong>{w.nome}</strong></td>
                          <td><span className="num-badge">{String(w.numeroParticipacao).padStart(3,'0')}</span></td>
                          <td className="td-email">{w.email}</td>
                          <td className="td-date">{new Date(w.realizadoEm).toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONFIG TAB */}
        {tab === 'config' && (
          <div className="config-tab">
            <div className="card-gold" style={{ maxWidth: '520px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: '24px' }}>
                ⚙️ Configurações
              </h2>
              <div className="field-group" style={{ marginBottom: '18px' }}>
                <label>Data do sorteio</label>
                <input
                  type="datetime-local"
                  value={config.drawDate ? config.drawDate.slice(0, 16) : ''}
                  onChange={e => setConfig(c => ({ ...c, drawDate: new Date(e.target.value).toISOString() }))}
                  style={{ background: 'var(--black-3)', border: '1px solid var(--black-4)', borderRadius: 'var(--radius-sm)', color: 'white', padding: '12px 16px', width: '100%' }}
                />
              </div>
              <div className="field-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.showReprovados || false}
                    onChange={e => setConfig(c => ({ ...c, showReprovados: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }}
                  />
                  Mostrar participantes reprovados na lista pública
                </label>
              </div>
              <button className="btn-gold" onClick={saveConfig} disabled={configSaving} style={{ width: '100%', padding: '14px' }}>
                {configSaving ? <><span className="spinner"></span> Salvando...</> : '💾 Salvar Configurações'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Participant detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box card-gold" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-num">Nº {String(selected.numeroParticipacao).padStart(3,'0')}</div>
            <h2 className="modal-name">{selected.nome}</h2>

            <div className="modal-info">
              <div><span>E-mail:</span> {selected.email}</div>
              <div><span>WhatsApp:</span> {selected.whatsapp}</div>
              <div><span>Cadastro:</span> {new Date(selected.criadoEm).toLocaleString('pt-BR')}</div>
              <div>
                <span>Status:</span>
                <span className={`badge ${STATUS_MAP[selected.status]?.cls}`} style={{ marginLeft: '8px' }}>
                  {STATUS_MAP[selected.status]?.icon} {STATUS_MAP[selected.status]?.label}
                </span>
              </div>
            </div>

            <div className="modal-images">
              <div className="img-block">
                <p>Comprovante de depósito</p>
                <a href={`/uploads/${selected.comprovante1}`} target="_blank" rel="noreferrer">
                  <img src={`/uploads/${selected.comprovante1}`} alt="Comprovante 1" />
                </a>
              </div>
              <div className="img-block">
                <p>Comprovante movimentado</p>
                <a href={`/uploads/${selected.comprovante2}`} target="_blank" rel="noreferrer">
                  <img src={`/uploads/${selected.comprovante2}`} alt="Comprovante 2" />
                </a>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-green" onClick={() => updateStatus(selected.id, 'confirmado')} disabled={selected.status === 'confirmado'}>
                ✅ Confirmar
              </button>
              <button className="btn-outline" onClick={() => updateStatus(selected.id, 'aguardando')} disabled={selected.status === 'aguardando'}>
                ⏳ Aguardando
              </button>
              <button className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => updateStatus(selected.id, 'reprovado')} disabled={selected.status === 'reprovado'}>
                ❌ Reprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
