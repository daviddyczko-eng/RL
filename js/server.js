import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeRando(url) {
  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    // Heure d'accueil (ex: "Accueil café à 9h30")
    const accueilBrut = $(".field-name-field-rando-info-accueil .field-item").first().text().trim();
    const heureAccueil = accueilBrut.match(/\b\d{1,2}h\d{0,2}\b/)?.[0] || null;

    // Heure de départ
    const heureDepart = $(".field-name-field-rando-heure .field-item").first().text().trim();

    // GPS
    const gpsBrut = $(".caption:contains('Coordonnées GPS')").first().text();
    const gps = gpsBrut.replace("Coordonnées GPS :", "").trim();

    // Distance
    const distance = $(".field-name-field-rando-distance .field-item").first().text().trim();

    // Dénivelé
    const denivele = $(".field-name-field-rando-denivele .field-item").first().text().trim();

    // Lieu de rendez-vous
    const lieu = $(".field-name-field-rando-rv-info .field-item").first().text().trim();

    // Contact téléphone
    const contact = $(".field-name-field-rando-telephone").first().text().trim();

    return {
      lieu,
      gps,
      distance,
      denivele,
      contact,
      heureAccueil,
      heureDepart
    };

  } catch (err) {
    console.error("Erreur scraping :", err);
    return { error: "Impossible de récupérer les données" };
  }
}

app.get("/api/rando", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "URL manquante" });

  const data = await scrapeRando(url);
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Serveur actif sur http://localhost:${PORT}`);
});
