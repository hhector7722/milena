import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateInvoicePDF = async (client, data) => {
    const doc = jsPDF()

    // --- COLORS & STYLES ---
    const primaryColor = [41, 87, 115] // #295773 - Canine Blue
    const accentColor = [211, 118, 101] // #D37665 - Terracotta
    const greyColor = [100, 100, 100]
    const lightGrey = [245, 245, 245]

    // --- HEADER: BRANDING ---
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('Milena González', 14, 25)

    // --- INVOICE DETAILS ---
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('FACTURA', 196, 25, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`${data.numFactura || '25-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 196, 32, { align: 'right' })
    const dateObj = new Date(data.fecha || Date.now())
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    doc.text(`${dd}/${mm}/${yyyy}`, 196, 38, { align: 'right' })

    // --- PARTIES INFO ---
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(14, 45, 196, 45)

    // FROM (Milena)
    doc.setFontSize(9)
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
    doc.text('DE:', 14, 62)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Milena González Villacampa', 14, 68)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('NIF 46355789W', 14, 73)
    doc.text('Travessera de Gràcia, 421, 5-1', 14, 78)
    doc.text('08025 Barcelona', 14, 83)

    // TO (Client)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
    doc.text('PER A:', 196, 62, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const displayName = client.raon_social || client.nombre_propietario || 'Client Name'
    doc.text(displayName, 196, 68, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    if (client.raon_social && client.nombre_propietario) {
        doc.text(`Attn: ${client.nombre_propietario}`, 196, 73, { align: 'right' })
        if (client.dni_nif) doc.text(`NIF: ${client.dni_nif}`, 196, 78, { align: 'right' })
        if (client.direccion) {
            const addrLines = doc.splitTextToSize(client.direccion, 70)
            doc.text(addrLines, 196, 83, { align: 'right' })
        }
    } else {
        if (client.dni_nif) doc.text(`NIF: ${client.dni_nif}`, 196, 73, { align: 'right' })
        if (client.direccion) {
            const addrLines = doc.splitTextToSize(client.direccion, 70)
            doc.text(addrLines, 196, 78, { align: 'right' })
        }
    }

    // --- LINE ITEMS TABLE ---
    const tableBody = data.items.map(item => [
        item.concepto,
        item.cantidad,
        `${parseFloat(item.precio).toFixed(2)}€`,
        `${(parseFloat(item.precio) * parseFloat(item.cantidad)).toFixed(2)}€`
    ])

    doc.autoTable({
        startY: 110,
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
    const irpf = data.ambIRPF ? subtotal * 0.15 : 0
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

    if (data.ambIRPF) {
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

    return doc.output('blob')
}
