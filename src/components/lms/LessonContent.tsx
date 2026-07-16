import React, { useState } from 'react';

// ── Utilities ──────────────────────────────────────────────────────────────

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node)) {
    return getTextContent((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

function startsWithEmoji(text: string): boolean {
  const cp = text.codePointAt(0) ?? 0;
  return cp > 255;
}

/**
 * The markdown tag a node came from ('h2', 'ul', 'li'…), or null if it isn't an element.
 *
 * A plain element's type is the tag string, but any tag remapped through ReactMarkdown's
 * `components` (LessonViewer remaps h2/h3 and ul/ol) has a function as its type instead.
 * ReactMarkdown passes the original hast node alongside, so read the tag from there.
 */
function nodeTagName(child: React.ReactNode): string | null {
  if (!React.isValidElement(child)) return null;
  if (typeof child.type === 'string') return child.type;
  const node = (child.props as { node?: { tagName?: unknown } }).node;
  return typeof node?.tagName === 'string' ? node.tagName : null;
}

function isHeadingNode(child: React.ReactNode): boolean {
  return /^h[1-6]$/.test(nodeTagName(child) ?? '');
}

/** The <li> children of a list node, or null if this isn't a list. */
function getListItems(node: React.ReactNode): React.ReactNode[] | null {
  const tag = nodeTagName(node);
  if (tag !== 'ul' && tag !== 'ol') return null;
  if (!React.isValidElement(node)) return null;
  const kids = React.Children.toArray((node.props as { children?: React.ReactNode }).children)
    .filter(k => getTextContent(k).trim() !== '');
  if (!kids.length) return null;
  return kids.every(k => nodeTagName(k) === 'li') ? kids : null;
}

function splitByHeadings(arr: React.ReactNode[]): { heading: React.ReactNode; content: React.ReactNode[] }[] {
  const sections: { heading: React.ReactNode; content: React.ReactNode[] }[] = [];
  let current: { heading: React.ReactNode; content: React.ReactNode[] } | null = null;
  for (const child of arr) {
    if (isHeadingNode(child)) {
      current = { heading: child, content: [] };
      sections.push(current);
    } else if (current) {
      current.content.push(child);
    }
  }
  return sections;
}

// ── 1. Callout Box ─────────────────────────────────────────────────────────

type CalloutConfig = {
  label: string;
  icon: string;
  bg: string;
  border: string;
  labelColor: string;
};

const CALLOUTS: [string, CalloutConfig][] = [
  ['key point', { label: 'Key Point', icon: '🔑', bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-400',  labelColor: 'text-amber-600 dark:text-amber-400'  }],
  ['tip',       { label: 'Tip',       icon: '💡', bg: 'bg-sky-50 dark:bg-sky-950/30',      border: 'border-sky-400',    labelColor: 'text-sky-600 dark:text-sky-400'      }],
  ['warning',   { label: 'Warning',   icon: '⚠️', bg: 'bg-orange-50 dark:bg-orange-950/30',border: 'border-orange-400', labelColor: 'text-orange-600 dark:text-orange-400'}],
  ['example',   { label: 'Example',   icon: '📌', bg: 'bg-violet-50 dark:bg-violet-950/30',border: 'border-violet-400', labelColor: 'text-violet-600 dark:text-violet-400'}],
  ['definition',{ label: 'Definition',icon: '📖', bg: 'bg-teal-50 dark:bg-teal-950/30',   border: 'border-teal-400',   labelColor: 'text-teal-600 dark:text-teal-400'    }],
  ['note',      { label: 'Note',      icon: '📝', bg: 'bg-secondary',                      border: 'border-border',     labelColor: 'text-muted-foreground'               }],
];

// ── Blockquote Router: Callout | Compare | Tabs ────────────────────────────
export const BlockquoteRenderer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lower = getTextContent(children).trim().toLowerCase();

  if (lower.startsWith('[tabs]'))    return <TabsBlock>{children}</TabsBlock>;
  if (lower.startsWith('[compare]')) return <CompareBlock>{children}</CompareBlock>;
  if (lower.startsWith('[cards]'))   return <CardsBlock>{children}</CardsBlock>;

  const cfg = CALLOUTS.find(([k]) => lower.startsWith(k))?.[1] ?? CALLOUTS[5][1]; // default: Note

  return (
    <div className={`my-6 rounded-xl border-l-4 ${cfg.border} ${cfg.bg} px-4 py-3`}>
      <p className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wide mb-2 not-italic ${cfg.labelColor}`}>
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </p>
      <div className="min-w-0 break-words [&>p:last-child]:mb-0 [&>p]:text-sm [&_pre]:overflow-x-auto [&_code]:break-all">
        {children}
      </div>
    </div>
  );
};

// ── 2. Feature Card Grid ───────────────────────────────────────────────────

export const ListRenderer: React.FC<{ children: React.ReactNode; ordered?: boolean }> = ({ children, ordered }) => {
  // Markdown puts whitespace text nodes between <li>s; they carry no text and would
  // otherwise be rendered as empty cards below.
  const items = React.Children.toArray(children).filter(item => getTextContent(item).trim() !== '');
  const hasEmoji = items.some(item => startsWithEmoji(getTextContent(item).trim()));

  if (!hasEmoji) {
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-1.5 my-3 text-foreground/80 text-sm break-words`}>
        {children}
      </Tag>
    );
  }

  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => {
        const text = getTextContent(item).trim();
        const emoji = [...text][0];
        const rest  = text.slice(emoji.length).trim();
        return (
          <div
            key={i}
            className="flex min-w-0 items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-shadow"
          >
            <span className="text-2xl shrink-0">{emoji}</span>
            <p className="min-w-0 flex-1 text-sm text-foreground/80 leading-relaxed break-words m-0">{rest}</p>
          </div>
        );
      })}
    </div>
  );
};

// ── 3. Cards Block (no-emoji card grid) ───────────────────────────────────

const CardsBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const arr = React.Children.toArray(children).filter(child => {
    const t = getTextContent(child).trim().toLowerCase();
    // Empty nodes are the whitespace between block elements; they would render as blank cards.
    return t !== '' && !t.startsWith('[cards]');
  });

  // Collect li items from any list inside the blockquote — one card per item.
  const items: React.ReactNode[] = [];
  arr.forEach(child => {
    const listItems = getListItems(child);
    if (listItems) items.push(...listItems);
    else items.push(child);
  });

  if (!items.length) return null;

  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex min-w-0 items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-shadow"
        >
          <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
          <div className="min-w-0 flex-1 text-sm text-foreground/80 leading-relaxed break-words [&>p]:m-0 [&>strong]:text-foreground [&>strong]:font-semibold">
            {item}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── 4. Compare Block ───────────────────────────────────────────────────────

const CompareBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const arr = React.Children.toArray(children).filter(child => {
    const t = getTextContent(child).trim().toLowerCase();
    return !t.startsWith('[compare]');
  });

  const sections = splitByHeadings(arr).slice(0, 2);

  if (sections.length < 2) {
    return <div>{children}</div>;
  }

  const styles = [
    { head: 'bg-secondary text-foreground',   card: 'border-border' },
    { head: 'bg-primary/10 text-primary',      card: 'border-primary/30' },
  ] as const;

  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sections.map((section, i) => (
        <div key={i} className={`min-w-0 rounded-xl border overflow-hidden shadow-soft ${styles[i].card}`}>
          <div className={`px-4 py-3 font-bold text-sm border-b border-border break-words ${styles[i].head}`}>
            {getTextContent(section.heading)}
          </div>
          <div className="min-w-0 p-4 bg-card text-sm text-foreground/80 leading-relaxed break-words space-y-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>p]:mb-0 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto">
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── 4. Tabs Block ──────────────────────────────────────────────────────────

const TabsBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [active, setActive] = useState(0);

  const arr = React.Children.toArray(children).filter(child => {
    const t = getTextContent(child).trim().toLowerCase();
    return !t.startsWith('[tabs]');
  });

  const sections = splitByHeadings(arr);

  if (!sections.length) return null;

  return (
    <div className="my-6 rounded-xl border border-border overflow-hidden shadow-soft">
      {/* Tab bar */}
      <div className="flex border-b border-border bg-secondary overflow-x-auto">
        {sections.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px shrink-0 ${
              active === i
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            {getTextContent(s.heading)}
          </button>
        ))}
      </div>
      {/* Active panel */}
      <div className="min-w-0 p-5 bg-card text-sm text-foreground/80 leading-relaxed break-words space-y-3 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>p]:mb-0 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto">
        {sections[active].content}
      </div>
    </div>
  );
};
