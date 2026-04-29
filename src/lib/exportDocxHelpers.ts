import { Paragraph, TextRun, TableCell, WidthType } from 'docx';

// ── Colour palette (visible on white paper) ──────────────────────────────────
export const RED  = '8B2635';
export const BLUE = '1A237E';
export const GREY = '757575';

// ── Low-level helpers ─────────────────────────────────────────────────────────

export function run(
  text: string,
  opts: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {},
): TextRun {
  return new TextRun({
    text,
    bold:    opts.bold,
    color:   opts.color,
    size:    opts.size ?? 20,
    italics: opts.italics,
  });
}

export function h1(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true, color: RED, size: 36 })],
    spacing:  { before: 400, after: 160 },
  });
}

export function h2(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true, color: BLUE, size: 26 })],
    spacing:  { before: 280, after: 120 },
  });
}

export function line(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      run(label + ': ', { bold: true, color: GREY }),
      run(value),
    ],
    spacing: { before: 40, after: 40 },
  });
}

export function blank(): Paragraph {
  return new Paragraph({ children: [run('')], spacing: { before: 80, after: 80 } });
}

export function tCell(text: string, widthPct: number, bold = false): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [run(text, { bold, size: 18 })] })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}

export function tHeaderCell(text: string, widthPct: number): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [run(text, { bold: true, color: BLUE, size: 18 })] })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}
