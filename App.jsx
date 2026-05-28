import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

const QUOTES = [
  "O primeiro passo não precisa ser grande. Precisa ser dado.",
  "Os primeiros 15 minutos são o ensaio. O que vem depois é a dança.",
  "Você não precisa controlar o dia todo. Só precisa começá-lo bem.",
  "Fazer 1% é infinitamente melhor que fazer 0%.",
  "Inspiração é consequência, não requisito.",
  "O passado não cancela o presente. Recomece agora.",
  "Aparecer é o que constrói o hábito.",
  "Cada sessão de 15 minutos é uma vitória. Reconheça isso.",
  "Você não constrói hábitos por esforço. Você os constrói por identidade.",
  "15 minutos de 'não estava com vontade' valem mais que 2 horas planejadas que nunca aconteceram."
]

// ─── Helpers ────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0] }
function fmtDate(str) { return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }
function randomQuote() { return QUOTES[Math.floor(Math.random() * QUOTES.length)] }

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null
  return <div className="toast">{msg}</div>
}

// ─── Rating buttons ─────────────────────────────────────────────────────────
function Rating({ max = 5, value, onChange, color = '#3B82F6' }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: 34, height: 34, padding: 0, justifyContent: 'center',
            fontWeight: value === n ? 500 : 400,
            background: value === n ? color : 'var(--surface)',
            color: value === n ? '#fff' : 'var(--text-muted)',
            borderColor: value === n ? color : 'var(--border)',
            borderRadius: 8,
          }}
        >{n}</button>
      ))}
    </div>
  )
}

// ─── Timer ──────────────────────────────────────────────────────────────────
function Timer() {
  const [secs, setSecs] = useState(900)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(id); setRunning(false); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  const pct = Math.round((900 - secs) / 900 * 100)
  const done = secs === 0

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{
        fontSize: 48, fontFamily: 'var(--font-display)', fontWeight: 400,
        color: done ? 'var(--green)' : running ? 'var(--blue)' : 'var(--text)',
        letterSpacing: 2, marginBottom: 8,
        transition: 'color 0.3s'
      }}>
        {done ? '✓ Feito!' : `${mm}:${ss}`}
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: done ? 'var(--green-mid)' : 'var(--blue-mid)',
          borderRadius: 4, transition: 'width 0.5s, background 0.3s'
        }} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => { if (done) { setSecs(900); setRunning(false) } else setRunning(r => !r) }}
          className={done ? 'btn-success' : 'btn-primary'}
          style={{ minWidth: 100 }}
        >
          {done ? 'Reiniciar' : running ? '⏸ Pausar' : secs < 900 ? '▶ Continuar' : '▶ Iniciar'}
        </button>
        {!done && <button onClick={() => { setSecs(900); setRunning(false) }}>Reset</button>}
      </div>
    </div>
  )
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!name.trim() || !email.trim()) { setError('Preencha nome e e-mail.'); return }
    if (!email.includes('@')) { setError('E-mail inválido.'); return }
    setLoading(true); setError('')
    try {
      const { data: existing } = await supabase
        .from('usuarios').select('*').eq('email', email.toLowerCase()).single()
      if (existing) { onLogin(existing); return }
      const { data: novo, error: err } = await supabase
        .from('usuarios').insert({ nome: name.trim(), email: email.toLowerCase() }).select().single()
      if (err) throw err
      onLogin(novo)
    } catch (e) {
      setError('Erro ao entrar. Tente novamente.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px 16px',
      background: 'linear-gradient(160deg, #FAFAF8 0%, #F0EDE6 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, lineHeight: 1, marginBottom: 4 }}>
            <span style={{ color: 'var(--blue)' }}>15</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            minutos
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 8 }}>
            é só o que você precisa
          </div>
        </div>

        <div className="card" style={{ padding: '28px 28px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Bem-vindo</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Entre com seu nome e e-mail para acessar seu progresso.</div>
          </div>

          <label>Seu nome</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Como você se chama?" />

          <label>Seu e-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />

          {error && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</div>}

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', marginTop: 16, padding: '11px 16px', justifyContent: 'center', fontSize: 14 }}
          >
            {loading ? 'Entrando...' : 'Entrar no programa →'}
          </button>
        </div>

        <div style={{
          marginTop: 20, padding: '14px 18px',
          borderLeft: '3px solid var(--blue-mid)',
          fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)'
        }}>
          "{randomQuote()}"
        </div>
      </div>
    </div>
  )
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function Nav({ active, setActive, diaAtual }) {
  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: '⊞' },
    { id: 'sessao', label: 'Sessão', icon: '▶' },
    { id: 'dia', label: 'Meu dia', icon: '☀' },
    { id: 'semana', label: 'Semana', icon: '◎' },
    { id: 'historico', label: 'Histórico', icon: '◷' },
  ]
  return (
    <nav style={{
      display: 'flex', gap: 4, padding: '12px 0 14px', borderBottom: '1px solid var(--border)',
      marginBottom: 20, overflowX: 'auto',
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{
            padding: '7px 14px', fontSize: 13, borderRadius: 20, whiteSpace: 'nowrap',
            background: active === t.id ? 'var(--text)' : 'transparent',
            color: active === t.id ? 'var(--surface)' : 'var(--text-muted)',
            borderColor: active === t.id ? 'var(--text)' : 'var(--border)',
            fontWeight: active === t.id ? 500 : 400,
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </nav>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ usuario, dias, sessoes, setActive }) {
  const doneCount = dias.filter(d => d.feito).length
  const pct = Math.round(doneCount / 21 * 100)
  const streak = (() => {
    let s = 0
    const sorted = [...dias].filter(d => d.feito).sort((a, b) => b.numero - a.numero)
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 || sorted[i].numero === sorted[i - 1].numero - 1) s++
      else break
    }
    return s
  })()
  const diaAtual = Math.min(doneCount + 1, 21)
  const diasMap = {}
  dias.forEach(d => { diasMap[d.numero] = d })

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 2 }}>
          Olá, {usuario.nome.split(' ')[0]}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <span className="badge badge-blue">Dia {diaAtual} de 21</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { val: doneCount, lbl: 'dias feitos', color: 'var(--blue)' },
          { val: streak, lbl: 'sequência', color: 'var(--amber-mid)' },
          { val: sessoes.length, lbl: 'sessões', color: 'var(--purple-mid)' },
          { val: pct + '%', lbl: 'progresso', color: 'var(--green-mid)' },
        ].map((m, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '14px 10px', textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Jornada 21 dias</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 10
        }}>
          {Array.from({ length: 21 }, (_, i) => {
            const n = i + 1
            const d = diasMap[n]
            const isDone = d?.feito
            const isToday = n === diaAtual
            const isFuture = n > diaAtual
            return (
              <div key={n} style={{
                aspectRatio: '1', borderRadius: 8, border: '1px solid',
                borderColor: isToday ? 'var(--blue-mid)' : isDone ? 'var(--green-mid)' : 'var(--border)',
                background: isDone ? 'var(--green-light)' : isToday ? 'var(--blue-light)' : 'var(--surface)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500,
                color: isDone ? 'var(--green)' : isToday ? 'var(--blue)' : 'var(--text-faint)',
                opacity: isFuture ? 0.4 : 1,
                cursor: !isFuture ? 'default' : 'default',
              }}>
                <span>{n}</span>
                {isDone && <span style={{ fontSize: 8 }}>✓</span>}
              </div>
            )
          })}
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--blue-mid), var(--green-mid))',
            borderRadius: 6, transition: 'width 0.5s'
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'right', marginTop: 4 }}>
          {doneCount} de 21 dias
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Acesso rápido</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setActive('sessao')} style={{ fontSize: 13 }}>
            ▶ Iniciar sessão 15 min
          </button>
          <button onClick={() => setActive('dia')} style={{ fontSize: 13 }}>
            ☀ Preencher meu dia
          </button>
          <button onClick={() => setActive('semana')} style={{ fontSize: 13 }}>
            ◎ Revisão semanal
          </button>
        </div>
      </div>

      <div style={{
        padding: '14px 18px', borderLeft: '3px solid var(--blue-mid)',
        fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)',
        background: 'var(--surface)', borderRadius: '0 var(--radius) var(--radius) 0',
        boxShadow: 'var(--shadow)'
      }}>
        "{randomQuote()}"
      </div>
    </div>
  )
}

// ─── Sessão Screen ────────────────────────────────────────────────────────────
function SessaoScreen({ usuario, sessoes, onSave, toast }) {
  const [atividade, setAtividade] = useState('')
  const [estado, setEstado] = useState('')
  const [intencao, setIntencao] = useState('')
  const [minimo, setMinimo] = useState('')
  const [resultado, setResultado] = useState('')
  const [tempo, setTempo] = useState('')
  const [sentimento, setSentimento] = useState('')
  const [humor, setHumor] = useState(null)
  const [vitoria, setVitoria] = useState('')
  const [saving, setSaving] = useState(false)

  const hoje = sessoes.filter(s => s.data === todayStr())

  async function salvar() {
    if (!atividade.trim()) { toast('Preencha a atividade!'); return }
    setSaving(true)
    const { error } = await supabase.from('sessoes').insert({
      usuario_id: usuario.id,
      data: todayStr(),
      atividade: atividade.trim(),
      estado, intencao, minimo, resultado,
      tempo_real: tempo ? parseInt(tempo) : null,
      sentimento, humor, vitoria,
    })
    if (!error) {
      onSave()
      toast('Sessão registrada! Missão cumprida. ✓')
      setAtividade(''); setEstado(''); setIntencao(''); setMinimo('')
      setResultado(''); setTempo(''); setSentimento(''); setHumor(null); setVitoria('')
    } else { toast('Erro ao salvar. Tente novamente.') }
    setSaving(false)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 2 }}>Sessão 15 min</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <span className="badge badge-blue">Sessão #{sessoes.length + 1}</span>
            <span style={{ marginLeft: 8 }}>{hoje.length > 0 ? `${hoje.length} sessão(ões) hoje` : 'primeira sessão hoje'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ borderTop: '3px solid var(--blue-mid)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            ☀ ANTES
          </div>
          <label>Atividade de hoje</label>
          <input value={atividade} onChange={e => setAtividade(e.target.value)} placeholder="O que vou fazer?" />
          <label>Estado atual</label>
          <select value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="animado">😀 Animado</option>
            <option value="neutro">😐 Neutro</option>
            <option value="resistente">😤 Resistente</option>
          </select>
          <label>Minha intenção</label>
          <textarea value={intencao} onChange={e => setIntencao(e.target.value)} placeholder="O que quero alcançar?" style={{ minHeight: 60 }} />
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--purple-mid)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple)', marginBottom: 12 }}>
            ⚡ DURANTE
          </div>
          <Timer />
          <div className="divider" style={{ margin: '12px 0' }} />
          <label>Mínimo viável (se travar)</label>
          <input value={minimo} onChange={e => setMinimo(e.target.value)} placeholder="1 coisa, só 1..." />
          <div style={{ marginTop: 10 }}>
            {['Celular silencioso', 'Notificações desligadas', 'Ambiente preparado'].map((item, i) => (
              <label key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                fontSize: 12, textTransform: 'none', letterSpacing: 0, cursor: 'pointer',
                color: 'var(--text-muted)', fontWeight: 400
              }}>
                <input type="checkbox" style={{ width: 'auto', cursor: 'pointer' }} />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid var(--green-mid)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)', marginBottom: 12 }}>
            🌙 DEPOIS
          </div>
          <label>Resultado</label>
          <select value={resultado} onChange={e => setResultado(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="completo">✓ Completei os 15 min</option>
            <option value="parcial">◑ Fiz parcialmente</option>
            <option value="minimo">▲ Fiz o mínimo viável</option>
          </select>
          <label>Tempo real (min)</label>
          <input type="number" value={tempo} onChange={e => setTempo(e.target.value)} placeholder="Ex: 20" min="1" max="180" />
          <label>Como me senti</label>
          <textarea value={sentimento} onChange={e => setSentimento(e.target.value)} placeholder="Descreva..." style={{ minHeight: 52 }} />
          <label>Humor (1–5)</label>
          <Rating value={humor} onChange={setHumor} color="var(--green-mid)" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14, padding: '14px 18px', borderLeft: '3px solid var(--amber-mid)', borderRadius: '0 var(--radius) var(--radius) 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--amber)', marginBottom: 6 }}>★ VITÓRIA DO DIA</div>
        <input value={vitoria} onChange={e => setVitoria(e.target.value)} placeholder="Escreva algo positivo sobre esta sessão..." style={{ border: 'none', padding: '4px 0', background: 'transparent', fontSize: 14 }} />
      </div>

      <button className="btn-primary" onClick={salvar} disabled={saving} style={{ fontSize: 14, padding: '11px 20px' }}>
        {saving ? 'Salvando...' : '✓ Registrar sessão'}
      </button>

      {hoje.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Sessões de hoje</div>
          {hoje.map((s, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < hoje.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.atividade}</span>
                <span className={`badge badge-${s.resultado === 'completo' ? 'green' : s.resultado === 'parcial' ? 'amber' : 'blue'}`}>
                  {s.resultado || 'registrada'}
                </span>
              </div>
              {s.vitoria && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>★ {s.vitoria}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Dia Screen ───────────────────────────────────────────────────────────────
function DiaScreen({ usuario, dias, onSave, toast }) {
  const today = todayStr()
  const diaHoje = dias.find(d => d.data === today)
  const diaNum = dias.filter(d => d.feito).length + 1

  const [t1, setT1] = useState(diaHoje?.tarefa1 || '')
  const [t2, setT2] = useState(diaHoje?.tarefa2 || '')
  const [t3, setT3] = useState(diaHoje?.tarefa3 || '')
  const [i1, setI1] = useState(diaHoje?.intencao1 || '')
  const [i2, setI2] = useState(diaHoje?.intencao2 || '')
  const [g1, setG1] = useState(diaHoje?.gratidao || '')
  const [n1, setN1] = useState(diaHoje?.noite_funcionou || '')
  const [n2, setN2] = useState(diaHoje?.noite_melhorar || '')
  const [n3, setN3] = useState(diaHoje?.noite_amanha || '')
  const [humor, setHumor] = useState(diaHoje?.humor || null)
  const [feito, setFeito] = useState(diaHoje?.feito || false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (diaHoje) {
      setT1(diaHoje.tarefa1 || ''); setT2(diaHoje.tarefa2 || ''); setT3(diaHoje.tarefa3 || '')
      setI1(diaHoje.intencao1 || ''); setI2(diaHoje.intencao2 || ''); setG1(diaHoje.gratidao || '')
      setN1(diaHoje.noite_funcionou || ''); setN2(diaHoje.noite_melhorar || ''); setN3(diaHoje.noite_amanha || '')
      setHumor(diaHoje.humor || null); setFeito(diaHoje.feito || false)
    }
  }, [diaHoje])

  async function salvar() {
    setSaving(true)
    const payload = {
      usuario_id: usuario.id, data: today, numero: diaNum,
      tarefa1: t1, tarefa2: t2, tarefa3: t3,
      intencao1: i1, intencao2: i2, gratidao: g1,
      noite_funcionou: n1, noite_melhorar: n2, noite_amanha: n3,
      humor, feito,
    }
    if (diaHoje) {
      const { error } = await supabase.from('dias').update(payload).eq('id', diaHoje.id)
      if (!error) { onSave(); toast('Dia atualizado!') }
      else toast('Erro ao salvar.')
    } else {
      const { error } = await supabase.from('dias').insert(payload)
      if (!error) { onSave(); toast('Dia salvo!') }
      else toast('Erro ao salvar.')
    }
    setSaving(false)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>
          {diaHoje ? `Dia ${diaHoje.numero}` : `Dia ${diaNum}`} — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="card" style={{ borderTop: '3px solid var(--blue-mid)', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--blue)', marginBottom: 14 }}>☀ Manhã — Regra 3-2-1</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
              Preencha ao acordar, antes de abrir o celular.
            </div>
            <label>3 Tarefas do dia</label>
            <input value={t1} onChange={e => setT1(e.target.value)} placeholder="Tarefa 1 — a mais importante" />
            <input value={t2} onChange={e => setT2(e.target.value)} placeholder="Tarefa 2" style={{ marginTop: 6 }} />
            <input value={t3} onChange={e => setT3(e.target.value)} placeholder="Tarefa 3" style={{ marginTop: 6 }} />
            <label>2 Intenções</label>
            <input value={i1} onChange={e => setI1(e.target.value)} placeholder="Como quero agir/sentir hoje..." />
            <input value={i2} onChange={e => setI2(e.target.value)} placeholder="Intenção 2..." style={{ marginTop: 6 }} />
            <label>1 Gratidão</label>
            <input value={g1} onChange={e => setG1(e.target.value)} placeholder="Sou grato por..." />
          </div>
        </div>

        <div>
          <div className="card" style={{ borderTop: '3px solid var(--green-mid)', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)', marginBottom: 14 }}>🌙 Noite — Check-in (5 min)</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
              Preencha antes de dormir.
            </div>
            <label>O que funcionou hoje?</label>
            <textarea value={n1} onChange={e => setN1(e.target.value)} placeholder="Escreva livremente..." />
            <label>O que posso melhorar amanhã?</label>
            <textarea value={n2} onChange={e => setN2(e.target.value)} placeholder="Escreva livremente..." />
            <label>O que fica para amanhã?</label>
            <textarea value={n3} onChange={e => setN3(e.target.value)} placeholder="Tarefas não concluídas..." />
            <label>Humor do dia</label>
            <Rating value={humor} onChange={setHumor} color="var(--green-mid)" />
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="feito-check" checked={feito} onChange={e => setFeito(e.target.checked)} style={{ width: 'auto', cursor: 'pointer' }} />
              <label htmlFor="feito-check" style={{ marginTop: 0, textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 400, cursor: 'pointer', color: 'var(--text)' }}>
                Marcar este dia como concluído ✓
              </label>
            </div>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={salvar} disabled={saving} style={{ fontSize: 14, padding: '11px 20px' }}>
        {saving ? 'Salvando...' : '✓ Salvar dia'}
      </button>
    </div>
  )
}

// ─── Semana Screen ────────────────────────────────────────────────────────────
function SemanaScreen({ usuario, dias, semanas, onSave, toast }) {
  const doneCount = dias.filter(d => d.feito).length
  const weekNum = Math.max(1, Math.ceil(doneCount / 7))
  const semanaHoje = semanas.find(s => s.numero === weekNum)

  const [diasFeitos, setDiasFeitos] = useState(semanaHoje?.dias_feitos || null)
  const [obstaculo, setObstaculo] = useState(semanaHoje?.obstaculo || '')
  const [vitoria, setVitoria] = useState(semanaHoje?.vitoria || '')
  const [manter, setManter] = useState(semanaHoje?.manter || '')
  const [mudar, setMudar] = useState(semanaHoje?.mudar || '')
  const [foco, setFoco] = useState(semanaHoje?.foco_proxima || '')
  const [nota, setNota] = useState(semanaHoje?.nota || null)
  const [mensagem, setMensagem] = useState(semanaHoje?.mensagem || '')
  const [saving, setSaving] = useState(false)

  async function salvar() {
    setSaving(true)
    const payload = {
      usuario_id: usuario.id, numero: weekNum,
      dias_feitos: diasFeitos, obstaculo, vitoria, manter, mudar,
      foco_proxima: foco, nota, mensagem,
    }
    if (semanaHoje) {
      const { error } = await supabase.from('semanas').update(payload).eq('id', semanaHoje.id)
      if (!error) { onSave(); toast('Revisão semanal salva!') }
      else toast('Erro ao salvar.')
    } else {
      const { error } = await supabase.from('semanas').insert(payload)
      if (!error) { onSave(); toast('Revisão semanal salva!') }
      else toast('Erro ao salvar.')
    }
    setSaving(false)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>
          Revisão semanal
        </div>
        <span className="badge badge-purple">Semana {weekNum}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: 'var(--text-muted)' }}>📊 Balanço da semana</div>
          <label>Dias feitos esta semana</label>
          <Rating max={7} value={diasFeitos} onChange={setDiasFeitos} color="var(--blue-mid)" />
          <label>Maior obstáculo</label>
          <textarea value={obstaculo} onChange={e => setObstaculo(e.target.value)} placeholder="O que dificultou?" />
          <label>Maior vitória</label>
          <textarea value={vitoria} onChange={e => setVitoria(e.target.value)} placeholder="O que deu certo?" />
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: 'var(--text-muted)' }}>🎯 Próxima semana</div>
          <label>Vou manter</label>
          <textarea value={manter} onChange={e => setManter(e.target.value)} placeholder="O que funcionou bem?" />
          <label>Vou mudar</label>
          <textarea value={mudar} onChange={e => setMudar(e.target.value)} placeholder="O que precisa ajuste?" />
          <label>Foco da próxima semana</label>
          <input value={foco} onChange={e => setFoco(e.target.value)} placeholder="Uma palavra ou frase..." />
          <label>Nota geral (1–10)</label>
          <Rating max={10} value={nota} onChange={setNota} color="var(--purple-mid)" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <label style={{ marginTop: 0 }}>Mensagem para si mesmo desta semana</label>
        <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Escreva livremente..." style={{ minHeight: 90 }} />
      </div>

      <button className="btn-primary" onClick={salvar} disabled={saving} style={{ fontSize: 14, padding: '11px 20px' }}>
        {saving ? 'Salvando...' : '✓ Salvar revisão'}
      </button>

      {semanas.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Revisões anteriores</div>
          {semanas.sort((a, b) => b.numero - a.numero).map((s, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < semanas.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 13 }}>Semana {s.numero}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {s.dias_feitos && <span className="badge badge-blue">{s.dias_feitos}/7 dias</span>}
                  {s.nota && <span className="badge badge-purple">nota {s.nota}</span>}
                </div>
              </div>
              {s.vitoria && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>✓ {s.vitoria}</div>}
              {s.mensagem && <div style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 2 }}>{s.mensagem.slice(0, 80)}{s.mensagem.length > 80 ? '...' : ''}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Histórico Screen ─────────────────────────────────────────────────────────
function HistoricoScreen({ sessoes, dias }) {
  const [tab, setTab] = useState('sessoes')

  return (
    <div className="fade-in">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>Histórico</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['sessoes', 'dias'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '5px 14px', fontSize: 12, borderRadius: 20,
            background: tab === t ? 'var(--text)' : 'transparent',
            color: tab === t ? 'var(--surface)' : 'var(--text-muted)',
            borderColor: tab === t ? 'var(--text)' : 'var(--border)',
          }}>
            {t === 'sessoes' ? `Sessões (${sessoes.length})` : `Dias (${dias.length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'sessoes' && (
          sessoes.length === 0
            ? <div style={{ color: 'var(--text-faint)', fontSize: 13, padding: '12px 0' }}>Nenhuma sessão ainda.</div>
            : [...sessoes].reverse().map((s, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < sessoes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{s.atividade}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{fmtDate(s.data)}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {s.resultado && <span className={`badge badge-${s.resultado === 'completo' ? 'green' : 'amber'}`}>{s.resultado}</span>}
                  {s.tempo_real && <span className="badge badge-blue">{s.tempo_real} min</span>}
                  {s.humor && <span className="badge badge-purple">humor {s.humor}</span>}
                </div>
                {s.vitoria && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>★ {s.vitoria}</div>}
              </div>
            ))
        )}

        {tab === 'dias' && (
          dias.length === 0
            ? <div style={{ color: 'var(--text-faint)', fontSize: 13, padding: '12px 0' }}>Nenhum dia ainda.</div>
            : [...dias].sort((a, b) => b.numero - a.numero).map((d, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < dias.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>Dia {d.numero}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span className={`badge badge-${d.feito ? 'green' : 'amber'}`}>{d.feito ? 'concluído' : 'em andamento'}</span>
                    {d.humor && <span className="badge badge-blue">humor {d.humor}</span>}
                  </div>
                </div>
                {d.tarefa1 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>1. {d.tarefa1}</div>}
                {d.gratidao && <div style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 2 }}>♡ {d.gratidao}</div>}
              </div>
            ))
        )}
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sessoes, setSessoes] = useState([])
  const [dias, setDias] = useState([])
  const [semanas, setSemanas] = useState([])
  const [toastMsg, setToastMsg] = useState('')
  const [loading, setLoading] = useState(true)

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2800)
  }

  const loadUserData = useCallback(async (uid) => {
    const [{ data: s }, { data: d }, { data: sem }] = await Promise.all([
      supabase.from('sessoes').select('*').eq('usuario_id', uid).order('created_at', { ascending: true }),
      supabase.from('dias').select('*').eq('usuario_id', uid).order('numero', { ascending: true }),
      supabase.from('semanas').select('*').eq('usuario_id', uid).order('numero', { ascending: true }),
    ])
    setSessoes(s || [])
    setDias(d || [])
    setSemanas(sem || [])
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('15min_usuario')
    if (saved) {
      const u = JSON.parse(saved)
      setUsuario(u)
      loadUserData(u.id).then(() => setLoading(false))
    } else { setLoading(false) }
  }, [loadUserData])

  function handleLogin(u) {
    localStorage.setItem('15min_usuario', JSON.stringify(u))
    setUsuario(u)
    loadUserData(u.id)
  }

  function handleLogout() {
    localStorage.removeItem('15min_usuario')
    setUsuario(null)
    setSessoes([]); setDias([]); setSemanas([])
    setActiveTab('dashboard')
  }

  function refresh() { if (usuario) loadUserData(usuario.id) }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--blue)' }}>15</div>
      </div>
    )
  }

  if (!usuario) return <LoginScreen onLogin={handleLogin} />

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 0 0', marginBottom: 0,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
          <span style={{ color: 'var(--blue)' }}>15</span>
          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 16 }}> minutos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{usuario.nome}</span>
          <button className="btn-ghost" onClick={handleLogout} style={{ fontSize: 12, padding: '4px 10px' }}>Sair</button>
        </div>
      </header>

      <Nav active={activeTab} setActive={setActiveTab} />

      {activeTab === 'dashboard' && <Dashboard usuario={usuario} dias={dias} sessoes={sessoes} setActive={setActiveTab} />}
      {activeTab === 'sessao' && <SessaoScreen usuario={usuario} sessoes={sessoes} onSave={refresh} toast={showToast} />}
      {activeTab === 'dia' && <DiaScreen usuario={usuario} dias={dias} onSave={refresh} toast={showToast} />}
      {activeTab === 'semana' && <SemanaScreen usuario={usuario} dias={dias} semanas={semanas} onSave={refresh} toast={showToast} />}
      {activeTab === 'historico' && <HistoricoScreen sessoes={sessoes} dias={dias} />}

      <Toast msg={toastMsg} />
    </div>
  )
}
