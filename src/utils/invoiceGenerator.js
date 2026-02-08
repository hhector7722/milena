import jsPDF from 'jspdf'
import 'jspdf-autotable'

const applyInvoiceTemplate = (doc, client, data, startY = 0) => {
    // --- COLORS & STYLES ---
    const primaryColor = [41, 87, 115] // #295773 - Canine Blue
    const accentColor = [211, 118, 101] // #D37665 - Terracotta
    const greyColor = [100, 100, 100]

    // --- HEADER: BRANDING ---
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('Milena González', 14, startY + 25)

    // --- INVOICE DETAILS ---
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('FACTURA', 196, startY + 25, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`${data.num_factura || data.numFactura || '25-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 196, startY + 32, { align: 'right' })
    const dateObj = new Date(data.fecha_emision || data.fecha || Date.now())
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    doc.text(`${dd}/${mm}/${yyyy}`, 196, startY + 38, { align: 'right' })

    // --- PARTIES INFO ---
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(14, startY + 45, 196, startY + 45)

    // FROM (Milena)
    doc.setFontSize(9)
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
    doc.text('DE:', 14, startY + 62)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Milena González Villacampa', 14, startY + 68)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('NIF 46355789W', 14, startY + 73)
    doc.text('Travessera de Gràcia, 421, 5-1', 14, startY + 78)
    doc.text('08025 Barcelona', 14, startY + 83)

    // TO (Client)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
    doc.text('PER A:', 196, startY + 62, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const displayName = client.raon_social || client.nombre_propietario || 'Client Name'
    doc.text(displayName, 196, startY + 68, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    if (client.raon_social && client.nombre_propietario) {
        doc.text(`Attn: ${client.nombre_propietario}`, 196, startY + 73, { align: 'right' })
        if (client.dni_nif) doc.text(`NIF: ${client.dni_nif}`, 196, startY + 78, { align: 'right' })
        if (client.direccion) {
            const addrLines = doc.splitTextToSize(client.direccion, 70)
            doc.text(addrLines, 196, startY + 83, { align: 'right' })
        }
    } else {
        if (client.dni_nif) doc.text(`NIF: ${client.dni_nif}`, 196, startY + 73, { align: 'right' })
        if (client.direccion) {
            const addrLines = doc.splitTextToSize(client.direccion, 70)
            doc.text(addrLines, 196, startY + 78, { align: 'right' })
        }
    }

    // --- LINE ITEMS TABLE ---
    const tableBody = data.items
        .filter(item => item.concepto || item.precio || item.cantidad)
        .map(item => [
            item.concepto || 'Sense descripció',
            item.cantidad || '0',
            `${parseFloat(item.precio || 0).toFixed(2)}€`,
            `${(parseFloat(item.precio || 0) * parseFloat(item.cantidad || 0)).toFixed(2)}€`
        ])

    doc.autoTable({
        startY: startY + 110,
        head: [['Concepte', 'Quantitat', 'Preu', 'Subtotal']],
        body: tableBody,
        theme: 'plain',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: primaryColor,
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [255, 255, 255]
        },
        bodyStyles: {
            textColor: [50, 50, 50],
            lineWidth: 0.1,
            lineColor: [255, 255, 255]
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        },
        didParseCell: function (data) {
            if (data.column.index === 0) data.cell.styles.halign = 'left';
            if (data.column.index === 1) data.cell.styles.halign = 'center';
            if (data.column.index === 2) data.cell.styles.halign = 'right';
            if (data.column.index === 3) data.cell.styles.halign = 'right';
        },
        margin: { left: 14, right: 14 }
    })

    // --- TOTALS SECTION ---
    const finalY = doc.lastAutoTable.finalY + 15
    const subtotal = data.items.reduce((acc, item) => acc + (parseFloat(item.precio) * parseFloat(item.cantidad) || 0), 0)
    const iva = subtotal * 0.21
    const ambIRPF = data.amb_irpf || data.ambIRPF
    const irpf = ambIRPF ? subtotal * 0.15 : 0
    const total = subtotal + iva - irpf

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])

    let currentY = finalY
    doc.text('BASE IMPONIBLE:', 170, currentY, { align: 'right' })
    doc.text(`${subtotal.toFixed(2)}€`, 196, currentY, { align: 'right' })

    currentY += 7
    doc.text('IVA (21%):', 170, currentY, { align: 'right' })
    doc.text(`${iva.toFixed(2)}€`, 196, currentY, { align: 'right' })

    if (ambIRPF) {
        currentY += 7
        doc.text('IRPF (-15%):', 170, currentY, { align: 'right' })
        doc.text(`-${irpf.toFixed(2)}€`, 196, currentY, { align: 'right' })
    }

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(140, currentY + 4, 196, currentY + 4)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAL:', 170, currentY + 13, { align: 'right' })
    doc.text(`${total.toFixed(2)}€`, 196, currentY + 13, { align: 'right' })

    // --- FOOTER ---
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(180, 180, 180)
    doc.text('Gràcies per la teva confiança.', 105, 280, { align: 'center' })
}

export const generateInvoicePDF = async (client, data) => {
    const doc = jsPDF()
    applyInvoiceTemplate(doc, client, data)
    return doc.output('blob')
}

export const generateMonthlyArchivePDF = async (monthName, invoices) => {
    const doc = jsPDF()

    invoices.forEach((invoice, index) => {
        if (index > 0) doc.addPage()

        // When fetching with clients, clients data is in invoice.clientes
        const clientData = invoice.clientes || {}
        applyInvoiceTemplate(doc, clientData, invoice)
    })

    return doc.output('blob')
}
