import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';

type Kind = 'ocr' | 'evaluation';

const phaseFor = (kind: Kind, seconds: number) => {
  if (kind === 'ocr') {
    if (seconds < 2) return 'Enviando e preparando as imagens';
    if (seconds < 7) return 'Comparando Nemotron OCR e PaddleOCR';
    if (seconds < 35) return 'Relendo o manuscrito em português';
    return 'Validando a transcrição final';
  }
  if (seconds < 4) return 'Preparando a matriz de correção';
  if (seconds < 45) return 'Analisando as cinco competências';
  if (seconds < 120) return 'Consolidando notas e justificativas';
  return 'Validando o parecer estruturado';
};

export function LoadingState({ kind }: { kind: Kind }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => window.clearInterval(timer);
  }, [kind]);

  const seconds = Math.floor(elapsedMs / 1_000);
  const progress = useMemo(() => {
    const pace = kind === 'ocr' ? 18 : 55;
    return Math.min(94, Math.round(6 + 88 * (1 - Math.exp(-seconds / pace))));
  }, [kind, seconds]);

  return (
    <section className="panel loading-state" aria-live="polite" aria-busy="true">
      <span className="spinner"><FontAwesomeIcon icon={faWandMagicSparkles} /></span>
      <span className="eyebrow">{kind === 'ocr' ? 'OCR sem thinking' : 'Correção com reasoning'}</span>
      <h2>{kind === 'ocr' ? 'Lendo sua redação' : 'Aplicando a matriz do ENEM'}</h2>
      <p>{phaseFor(kind, seconds)}…</p>
      <div className="progress-copy"><strong>{progress}%</strong><span>{seconds}s decorridos</span></div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <small>O percentual é uma estimativa visual; a etapa termina assim que o modelo responde.</small>
    </section>
  );
}
