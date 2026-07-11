import { useState, useCallback } from 'react';
import type { ReferenceType, ReferenceMetadata, ThesisType } from '../engine/types';

interface ManualFormProps {
  onSubmit: (metadata: ReferenceMetadata) => void;
}

const TYPE_LABELS: Record<ReferenceType, string> = {
  article: 'Artigo',
  book: 'Livro',
  chapter: 'Capítulo',
  website: 'Site',
  thesis: 'Trabalho acadêmico',
};

export function ManualForm({ onSubmit }: ManualFormProps) {
  const [refType, setRefType] = useState<ReferenceType>('article');
  const [fields, setFields] = useState<Record<string, string>>({});

  const set = useCallback((key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const f = (key: string) => fields[key] || '';

  const parseAuthorList = (str: string) =>
    str.split(';').map(s => s.trim()).filter(Boolean).map(name => ({ fullName: name }));

  const handleSubmit = useCallback(() => {
    const authors = parseAuthorList(f('authors'));
    const base = { authors, title: f('title'), subtitle: f('subtitle') || undefined, year: f('year'), url: f('url') || undefined, accessDate: f('accessDate') || undefined };

    let metadata: ReferenceMetadata;

    switch (refType) {
      case 'article':
        metadata = { ...base, type: 'article', journal: f('journal'), volume: f('volume') || undefined, issue: f('issue') || undefined, pages: f('pages') || undefined };
        break;
      case 'book':
        metadata = { ...base, type: 'book', edition: f('edition') || undefined, location: f('location') || undefined, publisher: f('publisher') || undefined, totalPages: f('totalPages') || undefined };
        break;
      case 'chapter':
        metadata = { ...base, type: 'chapter', bookTitle: f('bookTitle'), bookAuthors: parseAuthorList(f('bookAuthors')), bookAuthorRole: f('bookAuthorRole') || 'org.', edition: f('edition') || undefined, location: f('location') || undefined, publisher: f('publisher') || undefined, pages: f('pages') || undefined };
        break;
      case 'website':
        metadata = { ...base, type: 'website', siteName: f('siteName') || undefined, publishDate: f('publishDate') || undefined };
        break;
      case 'thesis':
        metadata = { ...base, type: 'thesis', thesisType: (f('thesisType') || 'dissertacao') as ThesisType, program: f('program'), institution: f('institution'), city: f('city'), totalPages: f('totalPages') || undefined };
        break;
      default:
        return;
    }

    onSubmit(metadata);
  }, [refType, fields, f, onSubmit]);

  const Field = ({ label, name, placeholder, full }: { label: string; name: string; placeholder?: string; full?: boolean }) => (
    <div className={`form-group${full ? ' full' : ''}`}>
      <label className="form-label">{label}</label>
      <input className="form-input" placeholder={placeholder} value={f(name)} onChange={e => set(name, e.target.value)} />
    </div>
  );

  return (
    <div className="manual-form">
      <div className="type-selector">
        {(Object.entries(TYPE_LABELS) as [ReferenceType, string][]).map(([key, label]) => (
          <button key={key} className={`type-btn${refType === key ? ' active' : ''}`} onClick={() => { setRefType(key); setFields({}); }}>
            {label}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <Field label="Autor(es)" name="authors" placeholder="Nome; Nome; Nome" full />
        <Field label="Título" name="title" placeholder="Título da obra" full />
        <Field label="Subtítulo" name="subtitle" placeholder="Opcional" full />
        <Field label="Ano" name="year" placeholder="2024" />

        {refType === 'article' && (
          <>
            <Field label="Periódico" name="journal" placeholder="Nome do periódico" />
            <Field label="Volume" name="volume" placeholder="v. 10" />
            <Field label="Número" name="issue" placeholder="n. 2" />
            <Field label="Páginas" name="pages" placeholder="15-28" />
          </>
        )}

        {refType === 'book' && (
          <>
            <Field label="Edição" name="edition" placeholder="2" />
            <Field label="Local" name="location" placeholder="São Paulo" />
            <Field label="Editora" name="publisher" placeholder="Nome da editora" />
            <Field label="Total de páginas" name="totalPages" placeholder="320" />
          </>
        )}

        {refType === 'chapter' && (
          <>
            <Field label="Título do livro" name="bookTitle" placeholder="Título da obra completa" full />
            <Field label="Organizador(es)" name="bookAuthors" placeholder="Nome; Nome" full />
            <Field label="Local" name="location" placeholder="São Paulo" />
            <Field label="Editora" name="publisher" placeholder="Nome da editora" />
            <Field label="Páginas" name="pages" placeholder="45-67" />
            <Field label="Edição" name="edition" placeholder="2" />
          </>
        )}

        {refType === 'website' && (
          <>
            <Field label="Nome do site" name="siteName" placeholder="G1, Wikipedia..." />
            <Field label="Data de publicação" name="publishDate" placeholder="10 jan. 2024" />
          </>
        )}

        {refType === 'thesis' && (
          <>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={f('thesisType') || 'dissertacao'} onChange={e => set('thesisType', e.target.value)}>
                <option value="tcc">TCC</option>
                <option value="dissertacao">Dissertação</option>
                <option value="tese">Tese</option>
              </select>
            </div>
            <Field label="Programa" name="program" placeholder="Ciência da Computação" />
            <Field label="Instituição" name="institution" placeholder="Universidade Federal..." />
            <Field label="Cidade" name="city" placeholder="Recife" />
            <Field label="Total de folhas" name="totalPages" placeholder="120" />
          </>
        )}

        <Field label="URL" name="url" placeholder="https://..." />
        <Field label="Acesso em" name="accessDate" placeholder="11 jul. 2026" />
      </div>

      <button className="btn-format" onClick={handleSubmit} style={{ width: '100%', marginTop: 16, marginBottom: 0 }}>
        Formatar
      </button>
    </div>
  );
}
