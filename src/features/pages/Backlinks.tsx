import { useHistory } from 'react-router-dom';
import { useBacklinks } from './backlinksApi';
import { displayTitle } from './pageTree';
import { FormattedText } from '../blocks/FormattedText';
import './Backlinks.css';

/** "Linked references": the pages whose blocks mention this one, with a snippet
 * of each linking block. Hidden entirely when there are none. */
export function Backlinks({ pageId }: { pageId: string }) {
  const history = useHistory();
  const { data } = useBacklinks(pageId);
  if (!data || data.length === 0) return null;

  return (
    <section className="pv-backlinks" aria-label="Linked references">
      <h2 className="pv-backlinks-head pv-muted">Linked references</h2>
      {data.map((bl) => (
        <button
          key={bl.page.id}
          className="pv-backlink"
          onClick={() => history.push(`/page/${bl.page.id}`)}
        >
          <span className="pv-backlink-title">
            <span aria-hidden="true">{bl.page.icon || '📄'}</span> {displayTitle(bl.page)}
          </span>
          <span className="pv-backlink-snippet">
            <FormattedText text={bl.snippets[0]} />
          </span>
        </button>
      ))}
    </section>
  );
}
