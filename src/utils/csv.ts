import { saveAs } from 'file-saver'

export interface CsvColumn {
  key: string
  label: string
}

export function downloadCSV(
  rows: Record<string, unknown>[],
  cols: CsvColumn[],
  filename: string,
) {
  if (!rows.length) return
  const header = cols.map((c) => `"${c.label}"`).join(',')
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const v = row[c.key]
          let s: string
          if (v == null) s = ''
          else if (typeof v === 'object') s = JSON.stringify(v)
          else s = String(v)
          return `"${s.replace(/"/g, '""')}"`
        })
        .join(','),
    )
    .join('\n')

  // ﻿ = BOM agar Excel baca UTF-8 dengan benar
  const blob = new Blob(['﻿' + header + '\n' + body], {
    type: 'text/csv;charset=utf-8;',
  })
  saveAs(blob, filename)
}
