import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faFileImage, faTrash } from '@fortawesome/free-solid-svg-icons';

type Props = {
  files: File[];
  disabled?: boolean;
  onChange: (files: File[]) => void;
};

const ACCEPTED = ['image/jpeg', 'image/png'];
const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function UploadZone({ files, disabled, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((file) => ACCEPTED.includes(file.type) && file.size <= 12 * 1024 * 1024);
    const unique = [...files, ...valid].filter(
      (file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size) === index,
    ).slice(0, 5);
    onChange(unique);
  };

  return (
    <div>
      <button
        type="button"
        className={`upload-zone ${dragging ? 'is-dragging' : ''}`}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
      >
        <span className="upload-icon"><FontAwesomeIcon icon={faArrowUpFromBracket} /></span>
        <strong>Solte a redação aqui</strong>
        <span>ou clique para selecionar</span>
        <small>PNG ou JPG · até 5 imagens</small>
      </button>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/png,image/jpeg"
        multiple
        onChange={(event) => event.target.files && addFiles(event.target.files)}
      />
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}`}>
              <span className="file-type"><FontAwesomeIcon icon={faFileImage} /></span>
              <span className="file-name"><strong>{file.name}</strong><small>{formatSize(file.size)}</small></span>
              <button type="button" className="icon-button" aria-label={`Remover ${file.name}`} onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
