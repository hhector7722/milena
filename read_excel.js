import pkg from 'xlsx';
import fs from 'fs';
const { readFile, utils } = pkg;

const clientsFile = 'c:\\Users\\hhect\\Desktop\\Deskstop\\Mile\\context\\clientes\\Clients.xlsx';
const templateFile = 'c:\\Users\\hhect\\Desktop\\Deskstop\\Mile\\context\\plantilla-factura\\Factura Plantilles by Merce.xlsx';

function readExcel(filePath) {
    try {
        const workbook = readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return utils.sheet_to_json(sheet);
    } catch (error) {
        return { error: error.message };
    }
}

const clientsData = readExcel(clientsFile);
const templateData = readExcel(templateFile);

fs.writeFileSync('clients_data.json', JSON.stringify(clientsData, null, 2));
fs.writeFileSync('template_data.json', JSON.stringify(templateData, null, 2));

console.log("Success: Written to clients_data.json and template_data.json");
