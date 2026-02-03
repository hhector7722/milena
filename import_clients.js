import pkg from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const { readFile, utils } = pkg;

// Use values directly to ensure the script works in the shell environment
const SUPABASE_URL = "https://rcnaprnngfnbfnipmynx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbmFwcm5uZ2ZuYmZuaXBteW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODg0NTEsImV4cCI6MjA4NTU2NDQ1MX0.H6K0azasc7LU9ojd2r2jdk9pC3fkGfVRoBTFLTtnd4w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const clientsFile = 'c:\\Users\\hhect\\Desktop\\Deskstop\\Mile\\context\\clientes\\Clients.xlsx';

function transformData(grid) {
    const clients = [];
    const numCols = grid[0].length;

    for (let c = 0; c < numCols; c++) {
        let currentClient = null;

        for (let r = 0; r < grid.length; r++) {
            const val = grid[r][c];
            if (!val || typeof val !== 'string' || val.trim() === '') continue;

            const trimmedVal = val.trim();

            // Detect start of a new client or continuation of details
            // A new client usually starts with a name (no NIF, no parens, not an address fragment)
            const isNif = trimmedVal.startsWith('NIF') || trimmedVal.startsWith('NIE');
            const isPet = trimmedVal.includes('(') && trimmedVal.includes(')');
            const isAddressFragment = /\d{5}/.test(trimmedVal) || trimmedVal.includes('/') || trimmedVal.includes('Pg.') || trimmedVal.includes('Trav.') || trimmedVal.includes('Ronda') || trimmedVal.includes('C/');

            // If it's none of the above, and it looks like a name (Title Case, no numbers usually)
            const isName = !isNif && !isPet && !isAddressFragment && trimmedVal.length > 5;

            if (isName) {
                if (currentClient) {
                    clients.push(currentClient);
                }
                currentClient = {
                    nombre_propietario: trimmedVal,
                    nombre_perros: '',
                    dni_nif: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    observaciones: ''
                };
            } else if (currentClient) {
                if (isNif) {
                    currentClient.dni_nif = trimmedVal.replace('NIF', '').replace('NIE', '').trim();
                } else if (isPet) {
                    currentClient.nombre_perros = trimmedVal.replace('(', '').replace(')', '').trim();
                } else if (isAddressFragment) {
                    currentClient.direccion = (currentClient.direccion ? currentClient.direccion + ', ' : '') + trimmedVal;
                } else {
                    currentClient.observaciones = (currentClient.observaciones ? currentClient.observaciones + ' ' : '') + trimmedVal;
                }
            }
        }
        if (currentClient) {
            clients.push(currentClient);
        }
    }

    return clients;
}

async function start() {
    console.log("Reading Excel as grid...");
    const workbook = readFile(clientsFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const grid = utils.sheet_to_json(sheet, { header: 1 });

    console.log("Transforming data...");
    const clients = transformData(grid);

    // Filter out clients without a valid name
    const validClients = clients.filter(c => c.nombre_propietario && c.nombre_propietario.length > 5);
    console.log(`Found ${validClients.length} valid clients.`);

    // Clear existing clients for a fresh import
    console.log("Cleaning existing records...");
    const { error: delError } = await supabase
        .from('clientes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (delError) {
        console.error("Error clearing table:", delError.message);
    }

    console.log(`Importing ${validClients.length} clients...`);

    const { error: insError } = await supabase
        .from('clientes')
        .insert(validClients);

    if (insError) {
        console.error(`Error importing clients:`, insError.message);
    } else {
        console.log("Successfully imported all clients.");
    }

    console.log("Import finished.");
}

start();
