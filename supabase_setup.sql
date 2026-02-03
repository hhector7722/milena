-- Create clientes table
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre_propietario TEXT NOT NULL,
    nombre_perros TEXT NOT NULL,
    avatar TEXT,
    ultimo_servicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    dni_nif TEXT,
    raon_social TEXT,
    observaciones TEXT,
    invoice_files JSONB DEFAULT '[]'::jsonb
);

-- Ensure columns exist even if table was created previously
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS raon_social TEXT;

-- Create facturas table
CREATE TABLE IF NOT EXISTS public.facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    monto DECIMAL(10, 2) NOT NULL,
    concepto TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT
);

-- Enable RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplistic for now: authenticated users have full access)
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.clientes;
CREATE POLICY "Allow all access to authenticated users" ON public.clientes
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.facturas;
CREATE POLICY "Allow all access to authenticated users" ON public.facturas
    FOR ALL USING (true) WITH CHECK (true);

-- Ensure columns exist even if table was created previously
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS invoice_files JSONB DEFAULT '[]'::jsonb;

-- Enable Storage (Bucket will be created via UI or another tool if possible)
-- Suggested bucket name: "invoices"
