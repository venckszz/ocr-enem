import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { OcrResult } from '../../shared/contracts';

type Props = { ocr: OcrResult; text: string; onChange: (text: string) => void };

export function OcrEditor({ ocr, text, onChange }: Props) {
  const confidence = Math.round(ocr.estimatedConfidence * 100);
  return (
    <section className="panel editor-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Etapa 2</span>
          <h2>Revise a transcrição</h2>
        </div>
        <span className={`confidence-pill ${confidence < 75 ? 'warning' : ''}`}>
          <FontAwesomeIcon icon={confidence < 75 ? faTriangleExclamation : faCircleCheck} /> {confidence}% de confiança
        </span>
      </div>
      {ocr.qualityWarnings.length > 0 && (
        <div className="warning-box">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>{ocr.qualityWarnings.join(' · ')}</span>
        </div>
      )}
      <label className="field-label" htmlFor="essay-text">Texto extraído</label>
      <textarea id="essay-text" className="essay-editor" value={text} onChange={(event) => onChange(event.target.value)} />
      <div className="editor-meta"><span>{text.trim().split(/\s+/).filter(Boolean).length} palavras</span><span>{ocr.method === 'hybrid' ? 'Releitura manuscrita aplicada' : ocr.method === 'ensemble' ? 'OCR duplo validado' : 'OCR direto'} · {ocr.model}</span></div>
    </section>
  );
}
