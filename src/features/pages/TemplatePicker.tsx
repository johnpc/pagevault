import { useHistory } from 'react-router-dom';
import { usePages, useCreateFromTemplate } from './pagesApi';
import { TEMPLATES } from './templates';
import './TemplatePicker.css';

/** The "start a new page" row on Home: one button per template. Creating a page
 * from a template seeds its preset blocks, then opens it. */
export function TemplatePicker() {
  const history = useHistory();
  const { data: pages } = usePages();
  const create = useCreateFromTemplate();

  const start = async (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)!;
    const id = await create.mutateAsync({ template, siblings: pages ?? [] });
    history.push(`/page/${id}`);
  };

  return (
    <div className="pv-templates" role="group" aria-label="New page from template">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          className="pv-template"
          disabled={create.isPending}
          onClick={() => start(t.id)}
        >
          <span className="pv-template-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
