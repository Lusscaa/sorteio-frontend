import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ParticipantForm.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function ParticipantForm({ onSuccess }) {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '' });
  const [files, setFiles] = useState({ comprovante1: null, comprovante2: null });
  const [previews, setPreviews] = useState({ comprovante1: null, comprovante2: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const ref1 = useRef();
  const ref2 = useRef();

  const canSubmit =
    form.nome.trim().length >= 3 &&
    form.email.trim().length > 5 &&
    form.whatsapp.replace(/\D/g, '').length >= 10 &&
    files.comprovante1 &&
    files.comprovante2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setFieldErrors(fe => ({ ...fe, [name]: '' }));
  };

  const handleFile = (name, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFieldErrors(fe => ({ ...fe, [name]: 'Use JPG, PNG ou WEBP.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(fe => ({ ...fe, [name]: 'Máximo 5MB por imagem.' }));
      return;
    }

    setFiles(f => ({ ...f, [name]: file }));
    setFieldErrors(fe => ({ ...fe, [name]: '' }));

    const reader = new FileReader();
    reader.onload = (ev) => setPreviews(p => ({ ...p, [name]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const removeFile = (name, ref) => {
    setFiles(f => ({ ...f, [name]: null }));
    setPreviews(p => ({ ...p, [name]: null }));
    if (ref.current) ref.current.value = '';
  };

  const formatWhatsApp = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  };

  const handleWhatsApp = (e) => {
    const formatted = formatWhatsApp(e.target.value);
    setForm(f => ({ ...f, whatsapp: formatted }));
    setFieldErrors(fe => ({ ...fe, whatsapp: '' }));
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('nome', form.nome.trim());
    fd.append('email', form.email.trim().toLowerCase());
    fd.append('whatsapp', form.whatsapp.replace(/\D/g, ''));
    fd.append('comprovante1', files.comprovante1);
    fd.append('comprovante2', files.comprovante2);

    try {
      const res = await axios.post(`${API}/participants`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao enviar. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container card-gold">
      <div className="form-header">
        <div className="form-icon">📋</div>
        <h2>Preencha seus dados</h2>
        <p>Todos os campos são obrigatórios para participar</p>
      </div>

      <div className="form-fields">
        <div className={`field-group ${fieldErrors.nome ? 'field-error' : ''}`}>
          <label>Nome completo</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Digite seu nome completo"
            autoComplete="name"
          />
          {fieldErrors.nome && <span className="field-err-msg">{fieldErrors.nome}</span>}
        </div>

        <div className={`field-group ${fieldErrors.email ? 'field-error' : ''}`}>
          <label>E-mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            autoComplete="email"
          />
          {fieldErrors.email && <span className="field-err-msg">{fieldErrors.email}</span>}
        </div>

        <div className={`field-group ${fieldErrors.whatsapp ? 'field-error' : ''}`}>
          <label>WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleWhatsApp}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
          />
          {fieldErrors.whatsapp && <span className="field-err-msg">{fieldErrors.whatsapp}</span>}
        </div>

        {/* Upload fields */}
        {[
          { key: 'comprovante1', ref: ref1, label: 'Comprovante de depósito', icon: '💳' },
          { key: 'comprovante2', ref: ref2, label: 'Comprovante de valor movimentado/girado', icon: '📊' },
        ].map(({ key, ref, label, icon }) => (
          <div key={key} className={`field-group ${fieldErrors[key] ? 'field-error' : ''}`}>
            <label>{icon} {label}</label>
            {!previews[key] ? (
              <div className="upload-zone" onClick={() => ref.current?.click()}>
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  <strong>Clique para anexar</strong>
                  <span>JPG, PNG ou WEBP • Máx. 5MB</span>
                </div>
                <input
                  ref={ref}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(key, e)}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="upload-preview">
                <img src={previews[key]} alt="Preview" />
                <div className="preview-overlay">
                  <span className="preview-check">✅ Anexado</span>
                  <button className="preview-remove" onClick={() => removeFile(key, ref)}>
                    ✕ Remover
                  </button>
                </div>
              </div>
            )}
            {fieldErrors[key] && <span className="field-err-msg">{fieldErrors[key]}</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="form-error">
          ⚠️ {error}
        </div>
      )}

      <div className="form-progress">
        <div className="progress-steps">
          {[
            { done: form.nome.trim().length >= 3, label: 'Nome' },
            { done: form.email.includes('@'), label: 'E-mail' },
            { done: form.whatsapp.replace(/\D/g,'').length >= 10, label: 'WhatsApp' },
            { done: !!files.comprovante1, label: 'Print 1' },
            { done: !!files.comprovante2, label: 'Print 2' },
          ].map((step, i) => (
            <div key={i} className={`progress-step ${step.done ? 'done' : ''}`}>
              <span className="step-dot">{step.done ? '✓' : i + 1}</span>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`submit-btn ${canSubmit ? 'active' : ''}`}
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <><span className="spinner"></span> Enviando...</>
        ) : canSubmit ? (
          '🎯 Participar do Sorteio'
        ) : (
          '🔒 Preencha todos os campos'
        )}
      </button>

      <p className="form-disclaimer">
        🔒 Seus dados são protegidos e não serão compartilhados publicamente.
      </p>
    </div>
  );
}
