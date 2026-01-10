import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================
// EXCEL EXPORT
// ============================================

type ExcelColumn = {
  header: string
  key: string
  width?: number
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string
) {
  // Transform data to use column headers
  const transformedData = data.map((row) => {
    const newRow: Record<string, unknown> = {}
    columns.forEach((col) => {
      newRow[col.header] = row[col.key]
    })
    return newRow
  })

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(transformedData)

  // Set column widths
  const colWidths = columns.map((col) => ({ wch: col.width || 15 }))
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')

  // Generate filename with date
  const date = new Date().toLocaleDateString('nl-NL').replace(/\//g, '-')
  const fullFilename = `${filename}_${date}.xlsx`

  // Download
  XLSX.writeFile(wb, fullFilename)
}

// ============================================
// PDF EXPORT
// ============================================

type PDFColumn = {
  header: string
  key: string
  width?: number
}

type PDFOptions = {
  title: string
  subtitle?: string
  orientation?: 'portrait' | 'landscape'
}

export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: PDFColumn[],
  filename: string,
  options: PDFOptions
) {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Add header
  doc.setFontSize(18)
  doc.setTextColor(30, 41, 59) // slate-800
  doc.text(options.title, 14, 20)

  if (options.subtitle) {
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.text(options.subtitle, 14, 28)
  }

  // Add date
  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184) // slate-400
  const date = new Date().toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  doc.text(`Gegenereerd: ${date}`, 14, options.subtitle ? 35 : 28)

  // Prepare table data
  const headers = columns.map((col) => col.header)
  const rows = data.map((row) => columns.map((col) => String(row[col.key] ?? '')))

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: options.subtitle ? 42 : 35,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width }
      }
      return acc
    }, {} as Record<number, { cellWidth: number }>),
  })

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Pagina ${i} van ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      'p1Meter Installaties',
      14,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  // Generate filename with date
  const dateStr = new Date().toLocaleDateString('nl-NL').replace(/\//g, '-')
  const fullFilename = `${filename}_${dateStr}.pdf`

  // Download
  doc.save(fullFilename)
}

// ============================================
// PRE-CONFIGURED EXPORTS
// ============================================

// Export customers to Excel
export function exportCustomersToExcel(customers: Array<{
  name: string
  email: string
  phone: string
  address: string
  postal_code: string
  city: string
  created_at: string
}>) {
  const columns: ExcelColumn[] = [
    { header: 'Naam', key: 'name', width: 25 },
    { header: 'E-mail', key: 'email', width: 30 },
    { header: 'Telefoon', key: 'phone', width: 15 },
    { header: 'Adres', key: 'address', width: 30 },
    { header: 'Postcode', key: 'postal_code', width: 10 },
    { header: 'Plaats', key: 'city', width: 20 },
    { header: 'Aangemaakt', key: 'created_at', width: 15 },
  ]

  const data = customers.map((c) => ({
    ...c,
    created_at: new Date(c.created_at).toLocaleDateString('nl-NL'),
  }))

  exportToExcel(data, columns, 'klanten')
}

// Export customers to PDF
export function exportCustomersToPDF(customers: Array<{
  name: string
  email: string
  phone: string
  address: string
  city: string
}>) {
  const columns: PDFColumn[] = [
    { header: 'Naam', key: 'name', width: 35 },
    { header: 'E-mail', key: 'email', width: 45 },
    { header: 'Telefoon', key: 'phone', width: 30 },
    { header: 'Adres', key: 'address', width: 40 },
    { header: 'Plaats', key: 'city', width: 30 },
  ]

  exportToPDF(customers, columns, 'klanten', {
    title: 'Klantenlijst',
    subtitle: `${customers.length} klanten`,
    orientation: 'landscape',
  })
}

// Export installations to Excel
export function exportInstallationsToExcel(installations: Array<{
  customer_name: string
  customer_address: string
  customer_city: string
  scheduled_at: string
  status: string
  assignee_name: string
}>) {
  const columns: ExcelColumn[] = [
    { header: 'Klant', key: 'customer_name', width: 25 },
    { header: 'Adres', key: 'customer_address', width: 30 },
    { header: 'Plaats', key: 'customer_city', width: 20 },
    { header: 'Datum', key: 'scheduled_at', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Energie Buddy', key: 'assignee_name', width: 20 },
  ]

  const data = installations.map((i) => ({
    ...i,
    scheduled_at: new Date(i.scheduled_at).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }))

  exportToExcel(data, columns, 'installaties')
}

// Export installations to PDF
export function exportInstallationsToPDF(installations: Array<{
  customer_name: string
  customer_address: string
  scheduled_at: string
  status: string
  assignee_name: string
}>) {
  const columns: PDFColumn[] = [
    { header: 'Klant', key: 'customer_name', width: 40 },
    { header: 'Adres', key: 'customer_address', width: 50 },
    { header: 'Datum', key: 'scheduled_at', width: 35 },
    { header: 'Status', key: 'status', width: 25 },
    { header: 'Energie Buddy', key: 'assignee_name', width: 30 },
  ]

  const data = installations.map((i) => ({
    ...i,
    scheduled_at: new Date(i.scheduled_at).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }))

  exportToPDF(data, columns, 'installaties', {
    title: 'Installatielijst',
    subtitle: `${installations.length} installaties`,
    orientation: 'landscape',
  })
}

// Export report summary to PDF
export function exportReportToPDF(report: {
  title: string
  period: string
  metrics: Array<{ label: string; value: string | number }>
  installations: Array<{
    customer_name: string
    scheduled_at: string
    status: string
    assignee_name: string
  }>
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Header
  doc.setFontSize(20)
  doc.setTextColor(30, 41, 59)
  doc.text(report.title, 14, 20)

  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139)
  doc.text(report.period, 14, 28)

  // Metrics section
  doc.setFontSize(14)
  doc.setTextColor(30, 41, 59)
  doc.text('Overzicht', 14, 42)

  let yPos = 50
  report.metrics.forEach((metric, index) => {
    const xPos = 14 + (index % 2) * 90
    if (index > 0 && index % 2 === 0) {
      yPos += 20
    }

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(metric.label, xPos, yPos)

    doc.setFontSize(16)
    doc.setTextColor(30, 41, 59)
    doc.text(String(metric.value), xPos, yPos + 7)
  })

  // Installations table
  if (report.installations.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('Installaties', 14, yPos + 30)

    const columns = [
      { header: 'Klant', key: 'customer_name' },
      { header: 'Datum', key: 'scheduled_at' },
      { header: 'Status', key: 'status' },
      { header: 'Energie Buddy', key: 'assignee_name' },
    ]

    const rows = report.installations.map((i) => [
      i.customer_name,
      new Date(i.scheduled_at).toLocaleDateString('nl-NL'),
      i.status,
      i.assignee_name,
    ])

    autoTable(doc, {
      head: [columns.map((c) => c.header)],
      body: rows,
      startY: yPos + 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}`,
    14,
    doc.internal.pageSize.getHeight() - 10
  )
  doc.text(
    'p1Meter Installaties',
    doc.internal.pageSize.getWidth() - 14,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'right' }
  )

  // Save
  const dateStr = new Date().toLocaleDateString('nl-NL').replace(/\//g, '-')
  doc.save(`rapportage_${dateStr}.pdf`)
}
