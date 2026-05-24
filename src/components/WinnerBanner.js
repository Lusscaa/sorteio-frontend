import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WinnerBanner.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function WinnerBanner() {
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    axios.get(`${API}/participants/winner`)
      .then(res => setWinner(res.data))
      .catch(() => {});
  }, []);

  if (!winner) return null;

  return (
    <div className="winner-banner">
      <div className="winner-confetti">🎉🏆🎉</div>
      <h2 className="winner-title">VENCEDOR DO SORTEIO</h2>
      <div className="winner-number">Nº {String(winner.numeroParticipacao).padStart(3, '0')}</div>
      <div className="winner-name">{winner.nomeAbreviado}</div>
      <div className="winner-date">
        Sorteado em {new Date(winner.realizadoEm).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}
