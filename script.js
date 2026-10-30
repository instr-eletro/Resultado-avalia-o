// Funções matemáticas e de formatação complexa

function formatComplexRect(real, imag, unit = '') {
  const sign = imag >= 0 ? '+' : '-';
  return `${real.toFixed(4)} ${sign} j${Math.abs(imag).toFixed(4)} ${unit}`.trim();
}

function formatComplexPolar(mag, deg, unit = '') {
  return `${mag.toFixed(4)} ∠ ${deg.toFixed(2)}° ${unit}`.trim();
}

// Realiza todos os cálculos físicos e elétricos para o aluno selecionado
function calcularRespostas(aluno) {
  const V = aluno.Tensão; // V
  const f = aluno.Frequencia; // Hz
  const w = 2 * Math.PI * f; // rad/s
  
  // ==========================================
  // QUESTÃO 1: Circuito RL Série
  // L1 em mH -> H, R1 em Ohms
  // ==========================================
  const L1_mH = aluno['Q1 ind'];
  const L1 = L1_mH * 1e-3;
  const R1 = aluno['Q1 res'];
  
  const XL1 = w * L1; // Ohms
  const Z1_mag = Math.sqrt(R1 * R1 + XL1 * XL1);
  const Z1_ang_rad = Math.atan2(XL1, R1);
  const Z1_ang_deg = Z1_ang_rad * (180 / Math.PI);
  
  // Corrente I1 = V / Z1 (com V na referência 0°)
  const I1_mag = V / Z1_mag;
  const I1_ang_deg = -Z1_ang_deg;
  const I1_ang_rad = -Z1_ang_rad;
  const I1_real = I1_mag * Math.cos(I1_ang_rad);
  const I1_imag = I1_mag * Math.sin(I1_ang_rad);
  
  // Tensões nos componentes:
  // VR1 = I1 * R1
  const VR1_mag = I1_mag * R1;
  const VR1_ang_deg = I1_ang_deg;
  
  // VL1 = I1 * jXL1
  const VL1_mag = I1_mag * XL1;
  const VL1_ang_deg = I1_ang_deg + 90;
  
  // ==========================================
  // QUESTÃO 2: Correção do Fator de Potência Motor
  // Potência nominal em CV, FP1 = 0.85, Rendimento n = aluno['Q2 rend']
  // Cálculo realizado sem considerar sobrecarga de Fator de Serviço (FS)
  // Elevação para FP2 = 0.95
  // ==========================================
  const P_nom_cv = aluno['Q2 pot'];
  const rend = aluno['Q2 rend'];
  const FP1 = 0.85;
  const FP2 = 0.95;
  
  // 1. Potência mecânica nominal em Watts (1 CV = 735.5 W)
  const P_mec_W = P_nom_cv * 735.5;
  // 1. Potência ativa elétrica de entrada (P = P_mec / rendimento)
  const P_in_W = P_mec_W / rend;
  
  // 2. Potência aparente (Situação 1): S1 = P / FP1
  const S1 = P_in_W / FP1;
  
  // 3. Potência reativa (Situação 1): Q1 = S1 · sen(cos⁻¹(FP1))
  const theta1 = Math.acos(FP1);
  const sin_theta1 = Math.sin(theta1);
  const Q1 = S1 * sin_theta1;
  
  // 4. Potência aparente (Situação 2): S2 = P / FP2
  const S2 = P_in_W / FP2;
  
  // 5. Potência reativa (Situação 2): Q2 = S2 · sen(cos⁻¹(FP2))
  const theta2 = Math.acos(FP2);
  const sin_theta2 = Math.sin(theta2);
  const Q2_reat = S2 * sin_theta2;
  
  // 6. Potência capacitor Qc = Q1 - Q2
  const Qc_nom = Q1 - Q2_reat;
  
  // 7. Reatância capacitiva: Xc = V² / Qc
  const Xc = Math.pow(V, 2) / Qc_nom;
  
  // 8. Capacitância do banco de capacitores: C = 1 / (2 · π · f · Xc)
  const C_nom_F = 1 / (w * Xc);
  const C_nom_uF = C_nom_F * 1e6;

  // ==========================================
  // QUESTÃO 3: Circuito RLC Paralelo
  // R3 em Ohms, C3 em uF, L3 em H
  // ==========================================
  const R3 = aluno['Q3R'];
  const C3_uF = aluno['Q3C'];
  const C3 = C3_uF * 1e-6;
  const L3 = aluno['Q3I'];
  
  const XC3 = 1 / (w * C3);
  const XL3 = w * L3;
  
  // Em paralelo, todos os ramos estão sob a mesma tensão V: V = V ∠ 0°
  const IR3_mag = V / R3; // Corrente no resistor (fase 0°)
  const IC3_mag = V / XC3; // Corrente no capacitor (fase +90°)
  const IL3_mag = V / XL3; // Corrente no indutor (fase -90°)
  
  // Corrente total I_total = IR + j(IC - IL)
  const Itotal_real = IR3_mag;
  const Itotal_imag = IC3_mag - IL3_mag;
  const Itotal_mag = Math.sqrt(Itotal_real * Itotal_real + Itotal_imag * Itotal_imag);
  const Itotal_ang_rad = Math.atan2(Itotal_imag, Itotal_real);
  const Itotal_ang_deg = Itotal_ang_rad * (180 / Math.PI);
  
  // Fator de Potência do circuito
  const FP3 = Math.cos(Itotal_ang_rad);
  const caracCircuito = Itotal_imag > 0 ? 'Capacitivo (Corrente adiantada)' : (Itotal_imag < 0 ? 'Indutivo (Corrente atrasada)' : 'Puramente Resistivo');

  // ==========================================
  // QUESTÃO EXTRA: Correção de FP da Q3 para 1.0 (Unitário)
  // Para FP = 1, a corrente reativa total deve ser nula
  // ==========================================
  // Reativo resultante na Q3: Q3_reat = V * (IL - IC) ou similar
  // Se IC > IL (capacitivo), precisa de indutor. Se IL > IC (indutivo), precisa de capacitor.
  const diff_I_reat = IC3_mag - IL3_mag;
  let extra_desc = '';
  let extra_calc = '';
  if (diff_I_reat > 0) {
    // Circuito predominantemente capacitivo
    extra_desc = `Como a reatância capacitiva atual faz fluir Ic = ${IC3_mag.toFixed(3)} A e IL = ${IL3_mag.toFixed(3)} A, o circuito é adiantado (capacitivo). Para FP unitário, a parte reativa adicional necessária seria um reator indutivo em paralelo que consuma a diferença líquida capacitiva de ${(diff_I_reat).toFixed(3)} A (ou redução da capacitância instalada para ${((IL3_mag / (w * V)) * 1e6).toFixed(2)} µF). Caso seja solicitada a anulação pela via do banco de capacitores, a capacitância equivalente total requerida para ressonância é C_ressonancia = 1 / (ω² · L).`;
    const C_ressonante = (1 / (w * w * L3)) * 1e6;
    extra_calc = `C_ressonante = 1 / (${w.toFixed(2)}² · ${L3}) = ${C_ressonante.toFixed(4)} µF. (Excesso capacitivo atual: ${(C3_uF - C_ressonante).toFixed(2)} µF a ser retirado ou compensado por reator indutivo de ${(V / (w * diff_I_reat)).toFixed(4)} H).`;
  } else {
    // Circuito predominantemente indutivo
    const I_cap_req = IL3_mag - IC3_mag;
    const Qc_req = V * I_cap_req;
    const C_req_extra = (Qc_req / (w * Math.pow(V, 2))) * 1e6;
    extra_desc = `O circuito é indutivo. É necessário acrescentar um banco de capacitores em paralelo para anular a corrente indutiva residual de ${I_cap_req.toFixed(3)} A.`;
    extra_calc = `Qc = V · (IL - IC) = ${V} · ${I_cap_req.toFixed(4)} = ${Qc_req.toFixed(2)} VAr. Capacitância adicional C = ${C_req_extra.toFixed(2)} µF.`;
  }

  // ==========================================
  // QUESTÃO 4: Teórica e Onda Senoidal
  // Tensão de pico = 311 V, freq = 50 Hz
  // ==========================================
  const V_pico = 311;
  const f4 = 50;
  const V_pp = 2 * V_pico;
  const V_rms = V_pico / Math.SQRT2;
  const T_s = 1 / f4;
  const T_ms = T_s * 1000;

  return {
    aluno,
    V,
    f,
    w,
    q1: {
      L1_mH,
      L1,
      R1,
      XL1,
      Z1_mag,
      Z1_ang_deg,
      I1_mag,
      I1_ang_deg,
      I1_real,
      I1_imag,
      VR1_mag,
      VR1_ang_deg,
      VL1_mag,
      VL1_ang_deg
    },
    q2: {
      P_nom_cv,
      rend,
      P_mec_W,
      P_in_W,
      S1,
      theta1_deg: theta1 * (180 / Math.PI),
      sin_theta1,
      Q1,
      S2,
      theta2_deg: theta2 * (180 / Math.PI),
      sin_theta2,
      Q2_reat,
      Qc_nom,
      Xc,
      C_nom_uF
    },
    q3: {
      R3,
      C3_uF,
      L3,
      XC3,
      XL3,
      IR3_mag,
      IC3_mag,
      IL3_mag,
      Itotal_real,
      Itotal_imag,
      Itotal_mag,
      Itotal_ang_deg,
      FP3,
      caracCircuito
    },
    q_extra: {
      extra_desc,
      extra_calc
    },
    q4: {
      V_pico,
      f4,
      V_pp,
      V_rms,
      T_s,
      T_ms
    }
  };
}

// Renderiza a visualização detalhada na interface
function renderizarRespostas(resultado) {
  const container = document.getElementById('resultado-container');
  if (!container) return;
  
  const { aluno, V, f, w, q1, q2, q3, q_extra, q4 } = resultado;

  container.innerHTML = `
    <!-- Cartão com Dados do Aluno -->
    <div class="student-card glass-panel">
      <div class="student-top">
        <div class="student-info">
          <span class="student-badge-num">Aluno Nº ${aluno.nº} • Avaliação Técnica</span>
          <h2>${aluno.Aluno}</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Unidade Curricular: <strong>Fundamentos de Sistemas Elétricos</strong> • Turma: 1055016
          </p>
        </div>
        <button class="btn btn-secondary no-print" onclick="window.print()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          Imprimir Solução
        </button>
      </div>

      <div class="student-parameters-grid">
        <div class="param-box">
          <div class="param-label">Tensão do Aluno</div>
          <div class="param-value">${V} <span class="param-unit">V</span></div>
        </div>
        <div class="param-box">
          <div class="param-label">Frequência</div>
          <div class="param-value">${f} <span class="param-unit">Hz</span></div>
        </div>
        <div class="param-box">
          <div class="param-label">Q1 Indutor / Resistor</div>
          <div class="param-value">${q1.L1_mH} <span class="param-unit">mH</span> / ${q1.R1} <span class="param-unit">Ω</span></div>
        </div>
        <div class="param-box">
          <div class="param-label">Q2 Potência / Rendimento</div>
          <div class="param-value">${q2.P_nom_cv} <span class="param-unit">CV</span> / ${(q2.rend * 100).toFixed(0)}<span class="param-unit">%</span></div>
        </div>
        <div class="param-box">
          <div class="param-label">Q3 Resistor / Cap / Ind</div>
          <div class="param-value">${q3.R3} <span class="param-unit">Ω</span> | ${q3.C3_uF} <span class="param-unit">µF</span> | ${q3.L3} <span class="param-unit">H</span></div>
        </div>
      </div>
    </div>

    <!-- PAINEL DE GABARITO RÁPIDO PARA CORREÇÃO -->
    <div class="quick-summary-card glass-panel">
      <div class="summary-header">
        <div class="summary-title">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          Resumo Rápido para Correção — Gabarito Nº ${aluno.nº}
        </div>
        <span class="summary-badge">Gabarito Oficial</span>
      </div>

      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr>
              <th style="width: 130px;">Item / Questão</th>
              <th>Principais Respostas Esperadas</th>
              <th>Grandezas & Valores Numéricos Principais</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="summary-q-tag">Questão 1</span></td>
              <td>Corrente Eficaz Complexa (I) e Tensões Complexas (V_R, V_L)</td>
              <td>
                <span class="summary-val-highlight">I = ${q1.I1_mag.toFixed(4)} ∠ ${q1.I1_ang_deg.toFixed(2)}° A</span>
                <span class="summary-val-sub">|Z| = ${q1.Z1_mag.toFixed(2)} Ω • X_L = ${q1.XL1.toFixed(2)} Ω • V_R = ${q1.VR1_mag.toFixed(2)} V • V_L = ${q1.VL1_mag.toFixed(2)} V</span>
              </td>
            </tr>
            <tr>
              <td><span class="summary-q-tag">Questão 2</span></td>
              <td>Capacitância do Banco para FP = 0,95</td>
              <td>
                <span class="summary-val-highlight">C = ${q2.C_nom_uF.toFixed(2)} µF</span>
                <span class="summary-val-sub">P_ativa = ${(q2.P_in_W / 1000).toFixed(2)} kW • Q_c = ${(q2.Qc_nom / 1000).toFixed(2)} kVAr (sem fator de serviço)</span>
              </td>
            </tr>
            <tr>
              <td><span class="summary-q-tag">Questão 3</span></td>
              <td>Tensões, Correntes Complexas e Fator de Potência (FP)</td>
              <td>
                <span class="summary-val-highlight">FP = ${q3.FP3.toFixed(4)} (${q3.caracCircuito})</span>
                <span class="summary-val-sub">I_total = ${q3.Itotal_mag.toFixed(2)} ∠ ${q3.Itotal_ang_deg.toFixed(2)}° A • I_R = ${q3.IR3_mag.toFixed(2)} A • I_C = ${q3.IC3_mag.toFixed(2)} A • I_L = ${q3.IL3_mag.toFixed(4)} A</span>
              </td>
            </tr>
            <tr>
              <td><span class="summary-q-tag" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">Questão Extra</span></td>
              <td>Correção do FP da Q3 para 1,0 (Unitário)</td>
              <td>
                <span class="summary-val-highlight">I_reativa = ${Math.abs(q3.IC3_mag - q3.IL3_mag).toFixed(3)} A</span>
                <span class="summary-val-sub">Compensação: ${q3.IC3_mag > q3.IL3_mag ? `Circuito capacitivo; necessita reator indutivo ou C_ressonância = ${( (1/(w*w*q3.L3))*1e6 ).toFixed(2)} µF` : `Necessita banco capacitivo adicional`}</span>
              </td>
            </tr>
            <tr>
              <td><span class="summary-q-tag">Questão 4</span></td>
              <td>Onda Senoidal (V_pico = 311 V, 50 Hz) & Teoria</td>
              <td>
                <span class="summary-val-highlight">V_pp = ${q4.V_pp} V • V_rms = ${q4.V_rms.toFixed(2)} V • T = ${q4.T_ms.toFixed(0)} ms</span>
                <span class="summary-val-sub">Teoria: Polos magnéticos inseparáveis (∇·B=0) • Materiais Ferro/Para/Diamagnéticos • X_L=2πfL • Definições</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lista com as Questões e Respostas Detalhadas -->
    <div class="questions-container">
      
      <!-- QUESTÃO 1 -->
      <div class="question-card glass-panel">
        <div class="question-header">
          <div class="question-title-wrap">
            <span class="question-pill">Questão 1</span>
            <h3 class="question-title">Circuito RL Série — Corrente e Tensões Complexas</h3>
          </div>
          <span class="question-points">25 Pontos</span>
        </div>
        <div class="question-statement">
          Durante a manutenção preventiva de uma máquina utilizada no processamento de alimentos, um técnico identificou um circuito auxiliar composto por uma fonte de tensão alternada e um indutor utilizado em um sistema de filtragem elétrica. Considerando as características da alimentação (<strong>${V} V, ${f} Hz</strong>), considere um indutor de <strong>${q1.L1_mH} mH</strong> e um resistor de <strong>${q1.R1} Ω</strong> em série e calcule o valor eficaz da corrente complexa e das tensões complexas do circuito.
        </div>
        <div class="solution-box">
          <div class="solution-box-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Resolução Detalhada Passo a Passo:
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">1</span> Cálculo da Reatância Indutiva (X_L)</div>
            <div class="formula-line">X_L = 2 · π · f · L = ω · L</div>
            <div class="calculation-line">X_L = 2 · π · ${f} · (${q1.L1_mH} × 10⁻³) = ${w.toFixed(4)} · ${q1.L1} = ${q1.XL1.toFixed(4)} Ω</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">2</span> Cálculo da Impedância Equivalente (Z)</div>
            <div class="formula-line">Z = R + jX_L = |Z| ∠ θ</div>
            <div class="calculation-line">Z = ${q1.R1} + j${q1.XL1.toFixed(4)} Ω</div>
            <div class="calculation-line">|Z| = √(${q1.R1}² + ${q1.XL1.toFixed(4)}²) = √(${(q1.R1*q1.R1).toFixed(2)} + ${(q1.XL1*q1.XL1).toFixed(2)}) = ${q1.Z1_mag.toFixed(4)} Ω</div>
            <div class="calculation-line">θ = arctg(X_L / R) = arctg(${q1.XL1.toFixed(4)} / ${q1.R1}) = ${q1.Z1_ang_deg.toFixed(2)}°</div>
            <div class="result-badge">
              <span class="result-name">Impedância do Circuito:</span>
              <span class="result-val">Z = ${q1.Z1_mag.toFixed(4)} ∠ ${q1.Z1_ang_deg.toFixed(2)}° Ω (${formatComplexRect(q1.R1, q1.XL1, 'Ω')})</span>
            </div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">3</span> Cálculo da Corrente Elétrica Complexa (I)</div>
            <div class="formula-line">I = V_fonte / Z = (${V} ∠ 0°) / (${q1.Z1_mag.toFixed(4)} ∠ ${q1.Z1_ang_deg.toFixed(2)}°)</div>
            <div class="calculation-line">|I| = ${V} / ${q1.Z1_mag.toFixed(4)} = ${q1.I1_mag.toFixed(4)} A</div>
            <div class="calculation-line">Fase de I = 0° - (${q1.Z1_ang_deg.toFixed(2)}°) = ${q1.I1_ang_deg.toFixed(2)}° (corrente atrasada em relação à tensão)</div>
            <div class="result-badge">
              <span class="result-name">Corrente Complexa Eficaz:</span>
              <span class="result-val">I = ${q1.I1_mag.toFixed(4)} ∠ ${q1.I1_ang_deg.toFixed(2)}° A (${formatComplexRect(q1.I1_real, q1.I1_imag, 'A')})</span>
            </div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">4</span> Cálculo das Tensões Complexas no Resistor e no Indutor</div>
            <div class="formula-line">V_R = I · R = (${q1.I1_mag.toFixed(4)} ∠ ${q1.I1_ang_deg.toFixed(2)}°) · (${q1.R1} ∠ 0°)</div>
            <div class="calculation-line">V_R = ${(q1.VR1_mag).toFixed(4)} ∠ ${q1.VR1_ang_deg.toFixed(2)}° V</div>
            <div class="formula-line">V_L = I · (jX_L) = (${q1.I1_mag.toFixed(4)} ∠ ${q1.I1_ang_deg.toFixed(2)}°) · (${q1.XL1.toFixed(4)} ∠ 90°)</div>
            <div class="calculation-line">V_L = ${(q1.VL1_mag).toFixed(4)} ∠ ${q1.VL1_ang_deg.toFixed(2)}° V</div>
            <div class="result-badge">
              <span class="result-name">Tensões Complexas:</span>
              <span class="result-val">V_R = ${q1.VR1_mag.toFixed(4)} ∠ ${q1.VR1_ang_deg.toFixed(2)}° V | V_L = ${q1.VL1_mag.toFixed(4)} ∠ ${q1.VL1_ang_deg.toFixed(2)}° V</span>
            </div>
          </div>
        </div>
      </div>

      <!-- QUESTÃO 2 -->
      <div class="question-card glass-panel">
        <div class="question-header">
          <div class="question-title-wrap">
            <span class="question-pill">Questão 2</span>
            <h3 class="question-title">Correção do Fator de Potência em Motor de Indução</h3>
          </div>
          <span class="question-points">25 Pontos</span>
        </div>
        <div class="question-statement">
          Um motor de potência nominal de <strong>${q2.P_nom_cv} CV</strong>, apresenta fator de potência de <strong>0,85</strong>, fator de serviço de <strong>1,2</strong> e rendimento de <strong>${q2.rend}</strong>. A equipe técnica estabeleceu como meta elevar o fator de potência para <strong>0,95</strong>. Determine a capacitância adequada para o banco de capacitores necessário à correção do fator de potência desse sistema (Tensão da instalação: <strong>${V} V</strong>, Frequência: <strong>${f} Hz</strong>).
        </div>
        <div class="solution-box">
          <div class="solution-box-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Resolução Detalhada Passo a Passo:
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">1</span> Calcular Potência Ativa Elétrica (P)</div>
            <div class="formula-line">P_mec = Potência (CV) · 735,5 W/CV</div>
            <div class="calculation-line">P_mec = ${q2.P_nom_cv} · 735,5 = ${q2.P_mec_W.toFixed(2)} W</div>
            <div class="formula-line">P = P_mec / Rendimento (η)</div>
            <div class="calculation-line">P = ${q2.P_mec_W.toFixed(2)} / ${q2.rend} = ${q2.P_in_W.toFixed(2)} W (${(q2.P_in_W / 1000).toFixed(3)} kW)</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">2</span> Calcula Potência Aparente (Situação 1 - S₁)</div>
            <div class="formula-line">S₁ = P / FP₁</div>
            <div class="calculation-line">S₁ = ${q2.P_in_W.toFixed(2)} / 0,85 = ${q2.S1.toFixed(2)} VA (${(q2.S1 / 1000).toFixed(3)} kVA)</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">3</span> Calcula Potência Reativa (Situação 1 - Q₁)</div>
            <div class="formula-line">Q₁ = S₁ · sen(cos⁻¹(FP₁))</div>
            <div class="calculation-line">θ₁ = cos⁻¹(0,85) = ${q2.theta1_deg.toFixed(2)}° → sen(${q2.theta1_deg.toFixed(2)}°) = ${q2.sin_theta1.toFixed(4)}</div>
            <div class="calculation-line">Q₁ = ${q2.S1.toFixed(2)} · sen(cos⁻¹(0,85)) = ${q2.S1.toFixed(2)} · ${q2.sin_theta1.toFixed(4)} = ${q2.Q1.toFixed(2)} VAr (${(q2.Q1 / 1000).toFixed(3)} kVAr)</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">4</span> Calcula Potência Aparente (Situação 2 - S₂)</div>
            <div class="formula-line">S₂ = P / FP₂</div>
            <div class="calculation-line">S₂ = ${q2.P_in_W.toFixed(2)} / 0,95 = ${q2.S2.toFixed(2)} VA (${(q2.S2 / 1000).toFixed(3)} kVA)</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">5</span> Calcula Potência Reativa (Situação 2 - Q₂)</div>
            <div class="formula-line">Q₂ = S₂ · sen(cos⁻¹(FP₂))</div>
            <div class="calculation-line">θ₂ = cos⁻¹(0,95) = ${q2.theta2_deg.toFixed(2)}° → sen(${q2.theta2_deg.toFixed(2)}°) = ${q2.sin_theta2.toFixed(4)}</div>
            <div class="calculation-line">Q₂ = ${q2.S2.toFixed(2)} · sen(cos⁻¹(0,95)) = ${q2.S2.toFixed(2)} · ${q2.sin_theta2.toFixed(4)} = ${q2.Q2_reat.toFixed(2)} VAr (${(q2.Q2_reat / 1000).toFixed(3)} kVAr)</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">6</span> Calcula Potência Capacitor (Q_c)</div>
            <div class="formula-line">Q_c = Q₁ - Q₂</div>
            <div class="calculation-line">Q_c = ${q2.Q1.toFixed(2)} - ${q2.Q2_reat.toFixed(2)} = ${q2.Qc_nom.toFixed(2)} VAr (${(q2.Qc_nom / 1000).toFixed(3)} kVAr)</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">7</span> Calcula Reatância Capacitiva (X_c)</div>
            <div class="formula-line">X_c = V² / Q_c</div>
            <div class="calculation-line">X_c = (${V})² / ${q2.Qc_nom.toFixed(2)} = ${(V*V)} / ${q2.Qc_nom.toFixed(2)} = ${q2.Xc.toFixed(4)} Ω</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">8</span> Calcula Capacitância do Banco de Capacitores (C)</div>
            <div class="formula-line">C = 1 / (2 · π · f · X_c) = 1 / (ω · X_c)</div>
            <div class="calculation-line">C = 1 / [2 · π · ${f} · ${q2.Xc.toFixed(4)}] = 1 / [${w.toFixed(4)} · ${q2.Xc.toFixed(4)}] = ${(q2.C_nom_uF * 1e-6).toExponential(4)} F</div>
            <div class="result-badge">
              <span class="result-name">Capacitância do Banco (C):</span>
              <span class="result-val">C = ${q2.C_nom_uF.toFixed(2)} µF</span>
            </div>
          </div>
        </div>
      </div>

      <!-- QUESTÃO 3 -->
      <div class="question-card glass-panel">
        <div class="question-header">
          <div class="question-title-wrap">
            <span class="question-pill">Questão 3</span>
            <h3 class="question-title">Circuito RLC Paralelo — Tensões, Correntes Complexas e Fator de Potência</h3>
          </div>
          <span class="question-points">25 Pontos</span>
        </div>
        <div class="question-statement">
          Durante a manutenção de um equipamento industrial, foi analisado um circuito composto por um resistor de <strong>${q3.R3} Ω</strong>, um capacitor de <strong>${q3.C3_uF} µF</strong> e um indutor de <strong>${q3.L3} H</strong> conectados em paralelo sob tensão de <strong>${V} V, ${f} Hz</strong>. Calcule o FP, todas as tensões e as correntes complexas do circuito.
        </div>
        <div class="solution-box">
          <div class="solution-box-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Resolução Detalhada Passo a Passo:
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">1</span> Tensão nos Ramos em Paralelo</div>
            <div class="theory-ans">
              Como todos os componentes estão em paralelo, a tensão sobre cada um deles é idêntica à tensão da fonte tomada como referência fasorial de 0°:
            </div>
            <div class="result-badge">
              <span class="result-name">Tensões Complexas:</span>
              <span class="result-val">V_R = V_C = V_L = V = ${V} ∠ 0° V</span>
            </div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">2</span> Cálculo das Reatâncias (X_C e X_L)</div>
            <div class="formula-line">X_C = 1 / (2 · π · f · C) = 1 / (ω · C)</div>
            <div class="calculation-line">X_C = 1 / [2 · π · ${f} · (${q3.C3_uF} × 10⁻⁶)] = 1 / [${w.toFixed(4)} · ${(q3.C3_uF * 1e-6)}] = ${q3.XC3.toFixed(4)} Ω</div>
            <div class="formula-line">X_L = 2 · π · f · L = ω · L</div>
            <div class="calculation-line">X_L = 2 · π · ${f} · ${q3.L3} = ${w.toFixed(4)} · ${q3.L3} = ${q3.XL3.toFixed(4)} Ω</div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">3</span> Correntes nos Ramos Individuais (I_R, I_C, I_L)</div>
            <div class="formula-line">I_R = V / R = (${V} ∠ 0°) / ${q3.R3} = ${q3.IR3_mag.toFixed(4)} ∠ 0° A</div>
            <div class="formula-line">I_C = V / (-jX_C) = j · (V / X_C) = (${V} / ${q3.XC3.toFixed(4)}) ∠ 90° = ${q3.IC3_mag.toFixed(4)} ∠ 90° A = +j${q3.IC3_mag.toFixed(4)} A</div>
            <div class="formula-line">I_L = V / (jX_L) = -j · (V / X_L) = (${V} / ${q3.XL3.toFixed(4)}) ∠ -90° = ${q3.IL3_mag.toFixed(4)} ∠ -90° A = -j${q3.IL3_mag.toFixed(4)} A</div>
            <div class="result-badge">
              <span class="result-name">Correntes de Ramo:</span>
              <span class="result-val">I_R = ${q3.IR3_mag.toFixed(2)} A | I_C = ${q3.IC3_mag.toFixed(2)} ∠ 90° A | I_L = ${q3.IL3_mag.toFixed(4)} ∠ -90° A</span>
            </div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">4</span> Corrente Total Complexa (I_total)</div>
            <div class="formula-line">I_total = I_R + I_C + I_L = I_R + j(I_C_mag - I_L_mag)</div>
            <div class="calculation-line">I_total = ${q3.IR3_mag.toFixed(4)} + j(${q3.IC3_mag.toFixed(4)} - ${q3.IL3_mag.toFixed(4)}) = ${formatComplexRect(q3.Itotal_real, q3.Itotal_imag, 'A')}</div>
            <div class="calculation-line">|I_total| = √[(${q3.Itotal_real.toFixed(4)})² + (${q3.Itotal_imag.toFixed(4)})²] = ${q3.Itotal_mag.toFixed(4)} A</div>
            <div class="calculation-line">θ_total = arctg(${q3.Itotal_imag.toFixed(4)} / ${q3.Itotal_real.toFixed(4)}) = ${q3.Itotal_ang_deg.toFixed(2)}°</div>
            <div class="result-badge">
              <span class="result-name">Corrente Total:</span>
              <span class="result-val">I_total = ${formatComplexPolar(q3.Itotal_mag, q3.Itotal_ang_deg, 'A')}</span>
            </div>
          </div>

          <div class="step-card">
            <div class="step-header"><span class="step-num">5</span> Fator de Potência do Circuito (FP)</div>
            <div class="formula-line">FP = cos(θ_total) = I_R / |I_total|</div>
            <div class="calculation-line">FP = cos(${q3.Itotal_ang_deg.toFixed(2)}°) = ${q3.IR3_mag.toFixed(4)} / ${q3.Itotal_mag.toFixed(4)} = ${q3.FP3.toFixed(4)}</div>
            <div class="result-badge">
              <span class="result-name">Fator de Potência:</span>
              <span class="result-val">FP = ${q3.FP3.toFixed(4)} (${q3.caracCircuito})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- QUESTÃO EXTRA -->
      <div class="question-card glass-panel">
        <div class="question-header">
          <div class="question-title-wrap">
            <span class="question-pill pill-extra">Questão Extra</span>
            <h3 class="question-title">Correção do FP do Circuito Paralelo para Unitário (1,0)</h3>
          </div>
          <span class="question-points">25 Pontos Extras</span>
        </div>
        <div class="question-statement">
          Determine o banco de capacitores necessário para corrigir o fator de potência do circuito da questão 3 para 1 (unitário).
        </div>
        <div class="solution-box">
          <div class="solution-box-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Análise e Solução Técnica:
          </div>
          <div class="step-card">
            <div class="theory-ans" style="margin-bottom: 0.8rem;">
              ${q_extra.extra_desc}
            </div>
            <div class="calculation-line">
              ${q_extra.extra_calc}
            </div>
          </div>
        </div>
      </div>

      <!-- QUESTÃO 4 -->
      <div class="question-card glass-panel">
        <div class="question-header">
          <div class="question-title-wrap">
            <span class="question-pill">Questão 4</span>
            <h3 class="question-title">Fenômenos Eletromagnéticos e Análise Senoidal CA</h3>
          </div>
          <span class="question-points">25 Pontos</span>
        </div>
        <div class="solution-box">
          <div class="theory-grid">
            <div class="theory-item">
              <div class="theory-q">a) O que é inseparabilidade dos polos magnéticos?</div>
              <div class="theory-ans">
                É a propriedade fundamental do magnetismo segundo a qual nunca é possível isolar um polo magnético (norte ou sul) individualmente. Qualquer ímã fracionado em pedaços menores sempre originará novos ímãs bipolares completos com polo Norte e polo Sul em cada extremidade. No eletromagnetismo clássico, este princípio é formalizado pela Lei de Gauss do Magnetismo (∇ · B = 0), a qual comprova que não existem monopolos magnéticos na natureza.
              </div>
            </div>

            <div class="theory-item">
              <div class="theory-q">b) Quais são os tipos de materiais magnéticos existentes? Explique suas características.</div>
              <div class="theory-ans">
                Os materiais magnéticos classificam-se de acordo com sua permeabilidade magnética relativa e a interação de seus dipolos magnéticos atômicos:
                <ul>
                  <li><strong>Ferromagnéticos:</strong> Materiais como ferro, cobalto e níquel (e suas ligas elétricas). Possuem domínios magnéticos internos que se alinham fortemente na presença de um campo magnético externo, exibindo alta permeabilidade magnética (µ_r >> 1), histerese magnética e elevada magnetização. São essenciais para construir núcleos de motores e transformadores.</li>
                  <li><strong>Paramagnéticos:</strong> Materiais como alumínio, platina e oxigênio. Apresentam permeabilidade ligeiramente superior à do vácuo (µ_r > 1). São fracamente atraídos por campos magnéticos intensos e não retêm magnetização após a remoção do campo externo.</li>
                  <li><strong>Diamagnéticos:</strong> Materiais como cobre, prata, ouro e água. Possuem permeabilidade ligeiramente inferior à do vácuo (µ_r < 1). Criam uma oposição interna que repele suavemente o campo magnético externo e perdem qualquer efeito ao se afastar do campo.</li>
                </ul>
              </div>
            </div>

            <div class="theory-item">
              <div class="theory-q">c) Quais fatores influenciam no valor da reatância indutiva?</div>
              <div class="theory-ans">
                Pela equação <strong>X_L = 2 · π · f · L = ω · L</strong>, a reatância indutiva depende diretamente de:
                <ul>
                  <li><strong>Frequência do sinal elétrico (f):</strong> Quanto maior a frequência da corrente alternada, mais rápida é a variação no fluxo magnético gerado, aumentando a f.e.m. induzida de oposição e elevando linearmente a reatância.</li>
                  <li><strong>Indutância própria do componente (L):</strong> Definida pelas características construtivas físicas do indutor: o número de espiras (N²), a permeabilidade magnética do material do núcleo (µ), a área da seção transversal da bobina (A) e o comprimento físico do caminho magnético (l).</li>
                </ul>
              </div>
            </div>

            <div class="theory-item">
              <div class="theory-q">d) Defina: tensão de pico, tensão de pico a pico, tensão eficaz (RMS), período e frequência.</div>
              <div class="theory-ans">
                <ul>
                  <li><strong>Tensão de Pico (V_pico):</strong> É o valor de amplitude máxima instantânea alcançado pela forma de onda senoidal medido a partir da linha de referência zero até o topo positivo (+V_p) ou inferior (-V_p).</li>
                  <li><strong>Tensão de Pico a Pico (V_pp):</strong> É a diferença absoluta de potencial entre a crista máxima positiva e o vale mínimo negativo da onda senoidal: V_pp = 2 · V_pico.</li>
                  <li><strong>Tensão Eficaz / RMS (Root Mean Square - V_rms):</strong> É o valor equivalente da tensão alternada que produz o mesmo trabalho térmico e dissipação de potência resistiva que uma tensão contínua correspondente. Para sinais senoidais puros: V_rms = V_pico / √2 ≈ 0,7071 · V_pico.</li>
                  <li><strong>Período (T):</strong> É o intervalo de tempo necessário para que a forma de onda complete exatamente um ciclo periódico inteiro de oscilação (medido em segundos).</li>
                  <li><strong>Frequência (f):</strong> É a quantidade de ciclos completos executados pela onda periódica em cada segundo de tempo. Corresponde ao inverso do período: f = 1 / T (medido em Hertz, Hz).</li>
                </ul>
              </div>
            </div>

            <div class="theory-item">
              <div class="theory-q">e) Cálculos para onda senoidal com valor de pico de 311 V e frequência de 50 Hz:</div>
              <div class="theory-ans">
                <div class="calculation-line">
                  • <strong>Tensão de pico a pico (V_pp):</strong><br>
                  V_pp = 2 · V_pico = 2 · 311 V = <strong>${q4.V_pp} V</strong>
                </div>
                <div class="calculation-line">
                  • <strong>Tensão eficaz (RMS):</strong><br>
                  V_rms = V_pico / √2 = 311 / 1,414214 = <strong>${q4.V_rms.toFixed(2)} V</strong> (tensão nominal de aproximadamente 220 V eficaz)
                </div>
                <div class="calculation-line">
                  • <strong>Período (T):</strong><br>
                  T = 1 / f = 1 / 50 Hz = <strong>${q4.T_s} s</strong> (ou <strong>${q4.T_ms.toFixed(1)} ms</strong>)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// Inicialização e vinculação de eventos
document.addEventListener('DOMContentLoaded', () => {
  const inputNumero = document.getElementById('input-numero');
  const btnBuscar = document.getElementById('btn-buscar');
  const selectAluno = document.getElementById('select-aluno');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProximo = document.getElementById('btn-proximo');

  // Popula o select dropdown com todos os alunos
  if (typeof DADOS_ALUNOS !== 'undefined' && Array.isArray(DADOS_ALUNOS)) {
    DADOS_ALUNOS.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.nº;
      opt.textContent = `Nº ${String(item.nº).padStart(2, '0')} — ${item.Aluno}`;
      selectAluno.appendChild(opt);
    });
  }

  function carregarAlunoPorNumero(num) {
    const numInt = parseInt(num, 10);
    if (isNaN(numInt)) return;

    const aluno = DADOS_ALUNOS.find(a => a.nº === numInt);
    if (aluno) {
      inputNumero.value = aluno.nº;
      selectAluno.value = aluno.nº;
      const res = calcularRespostas(aluno);
      renderizarRespostas(res);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } else {
      const container = document.getElementById('resultado-container');
      container.innerHTML = `
        <div class="not-found-state glass-panel">
          <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          <h3 style="margin-top: 1rem; color: #fff;">Avaliação Nº ${numInt} não encontrada</h3>
          <p style="margin-top: 0.5rem; color: var(--text-muted);">Por favor, informe um número de 1 a ${DADOS_ALUNOS.length}.</p>
        </div>
      `;
    }
  }

  btnBuscar.addEventListener('click', () => {
    carregarAlunoPorNumero(inputNumero.value);
  });

  inputNumero.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      carregarAlunoPorNumero(inputNumero.value);
    }
  });

  selectAluno.addEventListener('change', (e) => {
    carregarAlunoPorNumero(e.target.value);
  });

  btnAnterior.addEventListener('click', () => {
    let atual = parseInt(inputNumero.value, 10) || 1;
    if (atual > 1) {
      carregarAlunoPorNumero(atual - 1);
    }
  });

  btnProximo.addEventListener('click', () => {
    let atual = parseInt(inputNumero.value, 10) || 1;
    if (atual < DADOS_ALUNOS.length) {
      carregarAlunoPorNumero(atual + 1);
    }
  });

  // Carrega por padrão o estudante Nº 15 (exemplo citado no arquivo docx)
  carregarAlunoPorNumero(15);
});
