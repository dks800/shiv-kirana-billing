type ExportRow = Record<string, string | number>;

export function exportRowsToCsv(filename: string, rows: ExportRow[]) {
  const csv = rowsToCsv(rows);
  downloadBlob(filename, csv, "text/csv;charset=utf-8");
}

export function exportRowsToExcel(filename: string, rows: ExportRow[]) {
  const headers = Object.keys(rows[0] ?? {});
  const table = `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows
          .map(
            (row) =>
              `<tr>${headers
                .map((header) => `<td>${escapeHtml(String(row[header] ?? ""))}</td>`)
                .join("")}</tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;

  downloadBlob(filename, table, "application/vnd.ms-excel;charset=utf-8");
}

export function printReport(title: string, rows: ExportRow[]) {
  const headers = Object.keys(rows[0] ?? {});
  const printable = window.open("", "_blank", "width=960,height=720");

  if (!printable) {
    return;
  }

  printable.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 20px; margin-bottom: 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <table>
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${headers
                    .map((header) => `<td>${escapeHtml(String(row[header] ?? ""))}</td>`)
                    .join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
}

function rowsToCsv(rows: ExportRow[]) {
  const headers = Object.keys(rows[0] ?? {});
  const values = rows.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...values].join("\n");
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}
