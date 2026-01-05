/**
 * Utility functions for parsing IPO results table data
 */

/**
 * Parse raw results table data into structured format
 */
export function parseResultsTable(rawRows: string[][]): {
  summary: Array<{
    type: string;
    personCount: number;
    lotCount: number;
    ratio: number;
  }>;
  notes: string[];
} {
  const summary: Array<{
    type: string;
    personCount: number;
    lotCount: number;
    ratio: number;
  }> = [];
  const notes: string[] = [];

  // Skip header rows (first 2 rows are usually headers)
  // Process data rows starting from index 2
  for (let i = 2; i < rawRows.length; i++) {
    const row = rawRows[i];
    
    // Skip empty rows
    if (!row || row.length === 0) continue;

    // Check if this is a note row (single cell, usually starts with "*" or italic text)
    if (row.length === 1 || (row.length === 2 && row[1] === '')) {
      const noteText = row[0] || row[1] || '';
      if (noteText.trim()) {
        notes.push(noteText.trim());
      }
      continue;
    }

    // Check if this is a data row (should have at least 2 cells)
    if (row.length >= 2) {
      const type = row[0] || '';
      
      // Skip if type is empty or looks like a header
      if (!type || type.toLowerCase().includes('yatırımcı grubu') || type.toLowerCase().includes('dağıtım')) {
        continue;
      }

      // Parse person count (second column)
      const personCountStr = row[1] || '0';
      const personCount = parseNumber(personCountStr);

      // Parse lot count (third column, if exists)
      const lotCountStr = row[2] || '0';
      const lotCount = parseNumber(lotCountStr);

      // Parse ratio (fourth column, if exists, remove % sign)
      const ratioStr = row[3] || '0';
      const ratio = parsePercentage(ratioStr);

      // Only add if we have valid data
      if (type && (personCount > 0 || lotCount > 0 || ratio > 0)) {
        summary.push({
          type: type.trim(),
          personCount,
          lotCount,
          ratio,
        });
      }
    }
  }

  return { summary, notes };
}

/**
 * Parse number string (removes dots used as thousand separators)
 */
export function parseNumber(str: string): number {
  if (!str) return 0;
  // Remove dots (thousand separators) and convert to number
  const cleaned = str.replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse percentage string (removes % sign and converts to number)
 */
export function parsePercentage(str: string): number {
  if (!str) return 0;
  // Remove % sign and parse
  const cleaned = str.replace(/%/g, '').replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

