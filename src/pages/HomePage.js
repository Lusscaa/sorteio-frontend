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

          <a
            className="whatsapp-btn"
            href="https://chat.whatsapp.com/FRx68GXUJdwA1yNGZv7rtW"
            target="_blank"
            rel="noreferrer"
          >
            <svg className="wpp-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            ENTRAR AGR NO GRUPO OFICIAL PARA PARTICIPAR
            <span className="wpp-arrow">↓</span>
          </a>

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