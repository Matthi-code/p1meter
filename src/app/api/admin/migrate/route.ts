import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST() {
  try {
    const supabase = getAdminClient()

    // Create FAQ items table
    const { error: faqTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS faq_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          category VARCHAR(100) NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    // If RPC doesn't exist, try direct insert to check if table exists
    // and create via alternative method

    // Check if faq_items table exists by trying to select from it
    const { error: checkFaqError } = await supabase
      .from('faq_items')
      .select('id')
      .limit(1)

    if (checkFaqError?.code === '42P01') {
      // Table doesn't exist - we need to create it manually
      return NextResponse.json({
        success: false,
        message: 'Tabellen bestaan nog niet. Voer de SQL migratie handmatig uit in Supabase Dashboard > SQL Editor.',
        sql: `-- Kopieer en plak dit in Supabase SQL Editor:

-- FAQ Items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS Pages
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

-- FAQ Policies
CREATE POLICY "FAQ items viewable by everyone" ON faq_items FOR SELECT USING (true);
CREATE POLICY "FAQ items editable by team" ON faq_items FOR ALL USING (auth.uid() IS NOT NULL);

-- CMS Pages Policies
CREATE POLICY "CMS pages viewable by everyone" ON cms_pages FOR SELECT USING (true);
CREATE POLICY "CMS pages editable by team" ON cms_pages FOR ALL USING (auth.uid() IS NOT NULL);`
      })
    }

    // Check if cms_pages table exists
    const { error: checkPagesError } = await supabase
      .from('cms_pages')
      .select('id')
      .limit(1)

    if (checkPagesError?.code === '42P01') {
      return NextResponse.json({
        success: false,
        message: 'cms_pages tabel bestaat nog niet.',
      })
    }

    // Check if checklist_data column exists in installations table
    const { data: installationCheck, error: installationCheckError } = await supabase
      .from('installations')
      .select('checklist_data')
      .limit(1)

    if (installationCheckError?.code === '42703') {
      // Column doesn't exist - provide instructions
      const sqlToRun = `
-- Voer dit uit in Supabase SQL Editor:
ALTER TABLE installations ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT NULL;

-- OF maak eerst deze functie aan (eenmalig), dan kan de API het uitvoeren:
CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`
      // Try to use exec_sql if it exists
      const { error: execError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE installations ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT NULL'
      })

      if (execError) {
        return NextResponse.json({
          success: false,
          message: 'checklist_data kolom bestaat nog niet. Voer de SQL handmatig uit.',
          sql: sqlToRun,
          error: execError.message
        })
      }

      return NextResponse.json({
        success: true,
        message: 'checklist_data kolom toegevoegd via exec_sql functie'
      })
    }

    // Tables exist, check if they have data
    const { data: faqData } = await supabase.from('faq_items').select('id').limit(1)
    const { data: pagesData } = await supabase.from('cms_pages').select('id').limit(1)

    const results = {
      faq_items: faqData?.length ? 'exists with data' : 'exists but empty',
      cms_pages: pagesData?.length ? 'exists with data' : 'exists but empty',
    }

    // If empty, seed with default data
    if (!faqData?.length) {
      const { error: seedFaqError } = await supabase.from('faq_items').insert([
        { category: 'Algemeen', question: 'Wat is een p1Meter?', answer: 'De p1Meter van HomeWizard is een slimme energiemeter die je aansluit op de P1-poort van je slimme meter. Hiermee kun je realtime je stroom- en gasverbruik monitoren via de HomeWizard app op je smartphone.', sort_order: 1 },
        { category: 'Algemeen', question: 'Wat zijn de voordelen van een p1Meter?', answer: 'Met een p1Meter krijg je direct inzicht in je energieverbruik. Je ziet precies hoeveel stroom je op dit moment verbruikt, kunt energievreters opsporen en bewuster omgaan met energie. Dit kan flink besparen op je energierekening.', sort_order: 2 },
        { category: 'Algemeen', question: 'Wat kost de installatie?', answer: 'De kosten voor installatie zijn afhankelijk van je situatie. Neem contact met ons op voor een vrijblijvende offerte. De p1Meter zelf kost rond de €25-30 en is een eenmalige aanschaf zonder abonnementskosten.', sort_order: 3 },
        { category: 'Installatie', question: 'Hoe werkt de installatie?', answer: 'Onze Energie Buddy komt bij je langs, sluit de p1Meter aan op de P1-poort van je slimme meter, en configureert de WiFi-verbinding. Daarna helpt de Energie Buddy je met het instellen van de HomeWizard app. De hele installatie duurt ongeveer 15-30 minuten.', sort_order: 4 },
        { category: 'Installatie', question: 'Werkt de p1Meter met mijn slimme meter?', answer: 'De p1Meter werkt met alle DSMR 4.0+ slimme meters in Nederland. Dit zijn meters van merken zoals Landis+Gyr, Kaifa, Iskra, Sagemcom en Kamstrup. Bij twijfel controleren onze Energie Buddies de compatibiliteit voor installatie.', sort_order: 5 },
        { category: 'App & Gebruik', question: 'Waar kan ik de HomeWizard app downloaden?', answer: 'De HomeWizard app is gratis beschikbaar in de Apple App Store (voor iPhone/iPad) en Google Play Store (voor Android). Zoek op "HomeWizard Energy" om de app te vinden.', sort_order: 6 },
        { category: 'Problemen', question: 'De p1Meter toont geen data, wat nu?', answer: 'Controleer eerst of de LED op de p1Meter groen knippert - dit betekent dat er verbinding is. Zo niet, controleer de WiFi-verbinding en probeer de p1Meter opnieuw te configureren via de app. Bij aanhoudende problemen kun je contact opnemen met onze support.', sort_order: 7 },
      ])

      if (seedFaqError) {
        console.error('Seed FAQ error:', seedFaqError)
      } else {
        results.faq_items = 'seeded with default data'
      }
    }

    if (!pagesData?.length) {
      const { error: seedPagesError } = await supabase.from('cms_pages').insert([
        {
          slug: 'over',
          title: 'Over p1Meter Installaties',
          content: {
            subtitle: 'Wij verzorgen de professionele installatie van p1Meters bij huiseigenaren door heel Nederland.',
            mission: {
              title: 'Onze missie',
              text: 'Wij geloven dat iedereen inzicht verdient in zijn energieverbruik. Door de installatie van p1Meters zo makkelijk mogelijk te maken, helpen we huiseigenaren bewuster om te gaan met energie en te besparen op hun energiekosten.'
            },
            values: [
              { icon: 'users', title: 'Ervaren Energie Buddies', text: 'Ons team bestaat uit ervaren Energie Buddies die zijn getraind in de installatie van slimme energie-apparatuur.' },
              { icon: 'shield', title: 'Betrouwbaar', text: 'We komen onze afspraken na en zorgen voor een zorgvuldige installatie met aandacht voor kwaliteit.' },
              { icon: 'clock', title: 'Snel & flexibel', text: 'Binnen enkele dagen een afspraak en flexibele tijden die bij jouw schema passen.' }
            ],
            contact: {
              address: 'Energiestraat 123\n1234 AB Amsterdam',
              phone: '088 - 123 4567\nMa-Vr 09:00 - 17:00',
              email: 'info@p1meter-installaties.nl'
            }
          }
        }
      ])

      if (seedPagesError) {
        console.error('Seed pages error:', seedPagesError)
      } else {
        results.cms_pages = 'seeded with default data'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migratie voltooid',
      results,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden', details: String(error) },
      { status: 500 }
    )
  }
}
