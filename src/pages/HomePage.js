import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Countdown from '../components/Countdown';
import ParticipantForm from '../components/ParticipantForm';
import ParticipantsList from '../components/ParticipantsList';
import WinnerBanner from '../components/WinnerBanner';
import './HomePage.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function HomePage() {
  const [drawDate, setDrawDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    axios.get(`${API}/config`)
      .then(res => setDrawDate(res.data.drawDate))
      .catch(() => setDrawDate(new Date(Date.now() + 30 * 86400000).toISOString()));
  }, []);

  const handleSuccess = (data) => {
    setSuccessData(data);
    setShowForm(false);
    setRefreshTrigger(r => r + 1);
    window.scrollTo({ top: document.querySelector('.participants-section')?.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {drawDate && <Countdown targetDate={drawDate} />}

      <main className="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">🏆 SORTEIO VIP EXCLUSIVO</div>
          <h1 className="hero-title">
            <span className="gold-text">iPhone 17</span>
            <br />
            <span className="gold-text">Pro Max</span>
          </h1>
          <p className="hero-subtitle">
            Participe agora e concorra ao smartphone mais avançado do mundo.
            <br />
            <strong>Válido somente com os comprovantes enviados.</strong>
          </p>

          <div className="hero-phone">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="phone-display">
                  <div className="phone-logo">🍎</div>
                  <div className="phone-model">iPhone 17</div>
                  <div className="phone-submodel">Pro Max</div>
                  <div className="phone-camera-island"></div>
                </div>
              </div>
              <div className="phone-side-buttons">
                <div className="btn-action"></div>
                <div className="btn-vol"></div>
                <div className="btn-vol"></div>
              </div>
              <div className="phone-power-btn"></div>
            </div>
            <div className="phone-glow"></div>
          </div>

          <div className="hero-rules">
            <div className="rule-item">
              <span className="rule-icon">📋</span>
              <span>Preencha seus dados</span>
            </div>
            <div className="rule-arrow">→</div>
            <div className="rule-item">
              <span className="rule-icon">📸</span>
              <span>Envie os 2 comprovantes</span>
            </div>
            <div className="rule-arrow">→</div>
            <div className="rule-item">
              <span className="rule-icon">🎯</span>
              <span>Aguarde o sorteio</span>
            </div>
          </div>

          {!successData && !showForm && (
            <button className="hero-cta btn-gold" onClick={() => setShowForm(true)}>
              🎁 Participar Agora
            </button>
          )}
        </section>

        {/* Success message */}
        {successData && (
          <section className="success-section fade-in-up">
            <div className="success-card">
              <div className="success-icon">🎉</div>
              <h2>Inscrição realizada!</h2>
              <p>
                Bem-vindo, <strong>{successData.nomeAbreviado}</strong>!
                Sua participação foi registrada.
              </p>
              <div className="success-number">
                Nº {String(successData.numeroParticipacao).padStart(3, '0')}
              </div>
              <div className="badge badge-aguardando">
                ⏳ Aguardando validação
              </div>
              <p className="success-note">
                Sua participação será validada em até 24h.
                Guarde seu número de participação!
              </p>
            </div>
          </section>
        )}

        {/* Form */}
        {showForm && !successData && (
          <section className="form-section fade-in-up">
            <ParticipantForm onSuccess={handleSuccess} />
            <button
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </section>
        )}

        {/* Winner */}
        <WinnerBanner />

        {/* Info cards */}
        <section className="info-cards">
          {[
            { icon: '🔒', title: 'Seguro', text: 'Seus dados são protegidos. Apenas nome abreviado é exibido publicamente.' },
            { icon: '✅', title: 'Transparente', text: 'Todos os participantes são listados publicamente após inscrição.' },
            { icon: '🎲', title: 'Sorteio justo', text: 'O sorteio é realizado aleatoriamente apenas entre participantes confirmados.' },
          ].map((c, i) => (
            <div key={i} className="info-card card">
              <div className="info-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </section>

        {/* Participants list */}
        <ParticipantsList refreshTrigger={refreshTrigger} />

        {/* Footer CTA */}
        {!showForm && !successData && (
          <div className="footer-cta">
            <button className="btn-gold" style={{ fontSize: '1.1rem', padding: '18px 48px' }} onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              🎯 Quero Participar
            </button>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p className="gold-text">Sorteio VIP iPhone 17 Pro Max</p>
        <p>© {new Date().getFullYear()} — Todos os direitos reservados</p>
        <a href="/admin" className="admin-link">Acesso Admin</a>
      </footer>
    </div>
  );
}
