-- CMS Content Tables

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

-- CMS Pages (for static pages like 'over')
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
CREATE POLICY "FAQ items viewable by everyone" ON faq_items
  FOR SELECT USING (true);

CREATE POLICY "FAQ items editable by team" ON faq_items
  FOR ALL USING (auth.uid() IS NOT NULL);

-- CMS Pages Policies
CREATE POLICY "CMS pages viewable by everyone" ON cms_pages
  FOR SELECT USING (true);

CREATE POLICY "CMS pages editable by team" ON cms_pages
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default FAQ items
INSERT INTO faq_items (category, question, answer, sort_order) VALUES
  ('Algemeen', 'Wat is een p1Meter?', 'De p1Meter van HomeWizard is een slimme energiemeter die je aansluit op de P1-poort van je slimme meter. Hiermee kun je realtime je stroom- en gasverbruik monitoren via de HomeWizard app op je smartphone.', 1),
  ('Algemeen', 'Wat zijn de voordelen van een p1Meter?', 'Met een p1Meter krijg je direct inzicht in je energieverbruik. Je ziet precies hoeveel stroom je op dit moment verbruikt, kunt energievreters opsporen en bewuster omgaan met energie. Dit kan flink besparen op je energierekening.', 2),
  ('Algemeen', 'Wat kost de installatie?', 'De kosten voor installatie zijn afhankelijk van je situatie. Neem contact met ons op voor een vrijblijvende offerte. De p1Meter zelf kost rond de €25-30 en is een eenmalige aanschaf zonder abonnementskosten.', 3),
  ('Installatie', 'Hoe werkt de installatie?', 'Onze Energie Buddy komt bij je langs, sluit de p1Meter aan op de P1-poort van je slimme meter, en configureert de WiFi-verbinding. Daarna helpt de Energie Buddy je met het instellen van de HomeWizard app. De hele installatie duurt ongeveer 15-30 minuten.', 4),
  ('Installatie', 'Werkt de p1Meter met mijn slimme meter?', 'De p1Meter werkt met alle DSMR 4.0+ slimme meters in Nederland. Dit zijn meters van merken zoals Landis+Gyr, Kaifa, Iskra, Sagemcom en Kamstrup. Bij twijfel controleren onze Energie Buddies de compatibiliteit voor installatie.', 5),
  ('Installatie', 'Heb ik een adapter nodig?', 'Dit hangt af van je slimme meter. Meters met SMR 5.0 of nieuwer hebben geen adapter nodig - de p1Meter kan direct worden aangesloten. Bij oudere meters (SMR 4.x en eerder) is een USB-C adapter vereist. Onze Energie Buddy brengt de juiste adapter mee indien nodig.', 6),
  ('App & Gebruik', 'Waar kan ik de HomeWizard app downloaden?', 'De HomeWizard app is gratis beschikbaar in de Apple App Store (voor iPhone/iPad) en Google Play Store (voor Android). Zoek op "HomeWizard Energy" om de app te vinden.', 7),
  ('App & Gebruik', 'Moet ik een account aanmaken?', 'Ja, je hebt een gratis HomeWizard account nodig om de app te gebruiken. Dit account kun je aanmaken in de app zelf. Met dit account kun je de p1Meter koppelen en je verbruik bekijken.', 8),
  ('Problemen', 'De p1Meter toont geen data, wat nu?', 'Controleer eerst of de LED op de p1Meter groen knippert - dit betekent dat er verbinding is. Zo niet, controleer de WiFi-verbinding en probeer de p1Meter opnieuw te configureren via de app. Bij aanhoudende problemen kun je contact opnemen met onze support.', 9),
  ('Problemen', 'De p1Meter verbindt niet met WiFi', 'Zorg dat je 2.4GHz WiFi gebruikt (5GHz wordt niet ondersteund). Controleer of het WiFi-wachtwoord correct is ingevoerd. De p1Meter moet binnen bereik van je router zijn. Herstart eventueel je router en probeer opnieuw.', 10);

-- Insert default 'over' page content
INSERT INTO cms_pages (slug, title, content) VALUES
  ('over', 'Over p1Meter Installaties', '{
    "subtitle": "Wij verzorgen de professionele installatie van p1Meters bij huiseigenaren door heel Nederland.",
    "mission": {
      "title": "Onze missie",
      "text": "Wij geloven dat iedereen inzicht verdient in zijn energieverbruik. Door de installatie van p1Meters zo makkelijk mogelijk te maken, helpen we huiseigenaren bewuster om te gaan met energie en te besparen op hun energiekosten."
    },
    "values": [
      {
        "icon": "users",
        "title": "Ervaren Energie Buddies",
        "text": "Ons team bestaat uit ervaren Energie Buddies die zijn getraind in de installatie van slimme energie-apparatuur."
      },
      {
        "icon": "shield",
        "title": "Betrouwbaar",
        "text": "We komen onze afspraken na en zorgen voor een zorgvuldige installatie met aandacht voor kwaliteit."
      },
      {
        "icon": "clock",
        "title": "Snel & flexibel",
        "text": "Binnen enkele dagen een afspraak en flexibele tijden die bij jouw schema passen."
      }
    ],
    "contact": {
      "address": "Energiestraat 123\n1234 AB Amsterdam",
      "phone": "088 - 123 4567\nMa-Vr 09:00 - 17:00",
      "email": "info@p1meter-installaties.nl"
    }
  }');
