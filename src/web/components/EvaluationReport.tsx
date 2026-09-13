import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faCheck, faClipboard, faGaugeHigh, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import type { EvaluationResponse } from '../../shared/contracts';

const LABELS = [
  'Norma culta',
  'Tema e repertório',
  'Argumentação',
  'Coesão',
  'Intervenção',
];

type Props = { result: EvaluationResponse; onReset: () => void };

export function EvaluationReport({ result, onReset }: Props) {
  const { evaluation, reliability } = result;
  const copy = () => navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  return (
    <section className="result-stack">
      <div className="score-hero panel">
        <div>
          <span className="eyebrow">Resultado consolidado</span>
          <h2>Sua redação foi avaliada</h2>
          <p>{evaluation.summary}</p>
        </div>
        <div className="total-score" aria-label={`Nota total ${evaluation.totalScore} de 1000`}>
          <strong>{evaluation.totalScore}</strong><span>/1000</span>
        </div>
      </div>

      <div className="competency-grid">
        {evaluation.competencies.map((item) => {
          const issues = Object.entries(item.deductions).filter(([, detail]) => detail.ok === false || (detail.falhas ?? 0) > 0);
          return (
            <article className="competency-card panel" key={item.competency}>
              <header>
                <span className="competency-number">C{item.competency}</span>
                <div><h3>{LABELS[item.competency - 1]}</h3><span>Competência {item.competency}</span></div>
                <strong className="competency-score">{item.score}</strong>
              </header>
              <div className="score-bar"><span style={{ width: `${item.score / 2}%` }} /></div>
              <div className="feedback-line positive"><FontAwesomeIcon icon={faCheck} /><p>{item.positive}</p></div>
              <div className="feedback-line"><FontAwesomeIcon icon={faArrowTrendUp} /><p>{item.improvement}</p></div>
              {issues.length > 0 && (
                <details>
                  <summary>Ver pontos observados ({issues.length})</summary>
                  <ul className="issue-list">
                    {issues.map(([name, detail]) => (
                      <li key={name}><strong>{name.replaceAll('_', ' ')}</strong><span>{detail.obs || detail.exemplos?.join(', ') || `${detail.falhas} ocorrência(s)`}</span></li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          );
        })}
      </div>

      <div className="report-bottom">
        <article className="panel next-steps">
          <span className="eyebrow">Plano de melhoria</span>
          <h3>Próximos passos</h3>
          <ol>{evaluation.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        </article>
        <article className="panel reliability-card">
          <span className="eyebrow"><FontAwesomeIcon icon={faGaugeHigh} /> Confiabilidade</span>
          <h3>{reliability.label}</h3>
          {reliability.agreement !== null && <p><strong>{Math.round(reliability.agreement * 100)}%</strong> de concordância · faixa total {reliability.totalRange?.[0]}–{reliability.totalRange?.[1]}</p>}
          <small>{reliability.note}</small>
          <span className="model-name">{result.model}</span>
        </article>
      </div>

      <div className="result-actions">
        <button type="button" className="button secondary" onClick={copy}><FontAwesomeIcon icon={faClipboard} /> Copiar JSON</button>
        <button type="button" className="button primary" onClick={onReset}><FontAwesomeIcon icon={faRotateRight} /> Nova redação</button>
      </div>
    </section>
  );
}
