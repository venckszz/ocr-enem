import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFeatherPointed } from '@fortawesome/free-solid-svg-icons';

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Clareia — início">
        <span className="brand-mark"><FontAwesomeIcon icon={faFeatherPointed} /></span>
        <span>clareia<span className="brand-dot">.</span></span>
      </a>
      <span className="header-label">Correção assistida · ENEM</span>
    </header>
  );
}
