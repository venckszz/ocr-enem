import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBolt, faBrain, faLock, faPenRuler } from '@fortawesome/free-solid-svg-icons';
import { EvaluationReport } from './components/EvaluationReport';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { OcrEditor } from './components/OcrEditor';
import { UploadZone } from './components/UploadZone';
import { useEssayAnalysis } from './hooks/useEssayAnalysis';

export function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [theme, setTheme] = useState('');
  const [auditMode, setAuditMode] = useState(false);
  const analysis = useEssayAnalysis();

  const reset = () => {
    setFiles([]);
    setTheme('');
    setAuditMode(false);
    analysis.reset();
  };

  return (
    <div className="app-shell">
      <Header />
      <main>
        {analysis.stage === 'upload' && (
          <>
            <section className="hero">
              <span className="hero-kicker"><FontAwesomeIcon icon={faPenRuler} /> Da imagem ao parecer</span>
              <h1>Veja sua redação<br /><em>com mais clareza.</em></h1>
              <p>Transcrição por OCR especializado e correção assistida pela matriz oficial do ENEM.</p>
            </section>
            <section className="workspace-grid">
              <div className="panel upload-panel">
                <div className="section-heading">
                  <div><span className="eyebrow">Etapa 1</span><h2>Envie sua redação</h2></div>
                  <span className="step-badge">01</span>
                </div>
                <label className="field-label" htmlFor="theme">Tema da redação <span>opcional</span></label>
                <input id="theme" className="text-input" value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Ex.: Desafios para a valorização da herança africana..." />
                <UploadZone files={files} onChange={setFiles} />
                <button className="button primary wide" type="button" disabled={files.length === 0} onClick={() => analysis.extract(files)}>
                  Extrair texto <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              <aside className="info-column">
                <article><span><FontAwesomeIcon icon={faBolt} /></span><div><strong>OCR híbrido PT-BR</strong><p>Nemotron e PaddleOCR comparam leituras; Omni resolve divergências sem thinking.</p></div></article>
                <article><span><FontAwesomeIcon icon={faBrain} /></span><div><strong>5 competências, 1 parecer</strong><p>Nemotron Ultra 550B avalia toda a matriz em uma resposta estruturada.</p></div></article>
                <article><span><FontAwesomeIcon icon={faLock} /></span><div><strong>Processamento efêmero</strong><p>Arquivos ficam apenas em memória durante a análise.</p></div></article>
              </aside>
            </section>
          </>
        )}

        {analysis.stage === 'extracting' && <LoadingState kind="ocr" />}

        {(analysis.stage === 'review' || analysis.stage === 'evaluating') && analysis.ocr && (
          <div className="review-stack">
            <OcrEditor ocr={analysis.ocr} text={analysis.text} onChange={analysis.setText} />
            <section className="panel evaluation-options">
              <div><span className="eyebrow">Etapa 3</span><h2>Configure a correção</h2></div>
              <label className="toggle-row">
                <span><strong>Auditoria de confiabilidade</strong><small>3 correções independentes, mediana e faixa de concordância. Consome 3 requisições.</small></span>
                <input type="checkbox" checked={auditMode} onChange={(event) => setAuditMode(event.target.checked)} />
                <i aria-hidden="true" />
              </label>
              <button className="button primary" type="button" disabled={analysis.stage === 'evaluating' || analysis.text.trim().length < 80} onClick={() => analysis.evaluate(theme, auditMode)}>
                Corrigir redação <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </section>
            {analysis.stage === 'evaluating' && <LoadingState kind="evaluation" />}
          </div>
        )}

        {analysis.stage === 'result' && analysis.evaluation && <EvaluationReport result={analysis.evaluation} onReset={reset} />}

        {analysis.error && <div className="error-toast" role="alert">{analysis.error}</div>}
      </main>
      <footer><span>clareia.</span><p>Ferramenta de apoio. A nota oficial é atribuída exclusivamente pelo INEP.</p></footer>
    </div>
  );
}
