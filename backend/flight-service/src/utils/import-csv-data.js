"use strict";

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const db = require("../models");
const {
  sequelize,
  Country,
  Region,
  Runway,
  AirportFrequency,
  AirportComment,
  City,
  Airport,
  Airplane,
  Flight,
} = db;

const CSV_DIR = path.resolve(__dirname, "../../../../");
const BATCH_SIZE = 2000;

function parseIntSafe(val) {
  if (!val) return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
}

function parseFloatSafe(val) {
  if (!val) return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

function importCSV(fileName, model, rowMapper, filterFn = null) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(CSV_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}`);
      return resolve();
    }

    console.log(`[INFO] Starting stream import for ${fileName}...`);
    let buffer = [];
    let count = 0;
    let totalImported = 0;

    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on("data", async (row) => {
      if (filterFn && !filterFn(row)) {
        return;
      }

      const mapped = rowMapper(row);
      if (mapped) {
        buffer.push(mapped);
      }

      if (buffer.length >= BATCH_SIZE) {
        stream.pause();
        try {
          const currentBatch = [...buffer];
          buffer = [];
          await model.bulkCreate(currentBatch, { ignoreDuplicates: true });
          totalImported += currentBatch.length;
          console.log(`[INFO] ${fileName}: Seeded ${totalImported} records...`);
        } catch (err) {
          console.error(
            `[ERROR] Batch insert failed for ${fileName}:`,
            err.message,
          );
        }
        stream.resume();
      }
    });

    stream.on("end", async () => {
      if (buffer.length > 0) {
        try {
          await model.bulkCreate(buffer, { ignoreDuplicates: true });
          totalImported += buffer.length;
        } catch (err) {
          console.error(
            `[ERROR] Final batch insert failed for ${fileName}:`,
            err.message,
          );
        }
      }
      console.log(
        `[SUCCESS] Completed importing ${fileName}. Total: ${totalImported} records.`,
      );
      resolve();
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

async function run() {
  try {
    console.log("[START] Database seeding pipeline initiated.");

    console.log("[INFO] Syncing database models...");
    await sequelize.sync();
    console.log("[SUCCESS] Database synced.");

    console.log("[INFO] Clearing existing flight, airport, and city data...");
    await Flight.destroy({ where: {} });
    await Airport.destroy({ where: {} });
    await City.destroy({ where: {} });
    console.log("[SUCCESS] Existing flight, airport, and city tables cleared.");

    await importCSV("countries.csv", Country, (row) => ({
      id: parseIntSafe(row.id),
      code: row.code,
      name: row.name,
      continent: row.continent,
      wikipediaLink: row.wikipedia_link || null,
      keywords: row.keywords || null,
    }));

    const countries = await Country.findAll();
    const countryMap = {};
    countries.forEach((c) => {
      countryMap[c.code] = c.name;
    });

    await importCSV("regions.csv", Region, (row) => ({
      id: parseIntSafe(row.id),
      code: row.code,
      localCode: row.local_code || null,
      name: row.name,
      continent: row.continent || null,
      isoCountry: row.iso_country || null,
      wikipediaLink: row.wikipedia_link || null,
      keywords: row.keywords || null,
    }));

    await importCSV("runways.csv", Runway, (row) => ({
      id: parseIntSafe(row.id),
      airportRef: parseIntSafe(row.airport_ref),
      airportIdent: row.airport_ident,
      lengthFt: parseIntSafe(row.length_ft),
      widthFt: parseIntSafe(row.width_ft),
      surface: row.surface || null,
      lighted: row.lighted === "1",
      closed: row.closed === "1",
      leIdent: row.le_ident || null,
      leLatitude: parseFloatSafe(row.le_latitude_deg),
      leLongitude: parseFloatSafe(row.le_longitude_deg),
      leElevation: parseIntSafe(row.le_elevation_ft),
      leHeadingT: parseFloatSafe(row.le_heading_degT),
      leDisplacedThreshold: parseIntSafe(row.le_displaced_threshold_ft),
      heIdent: row.he_ident || null,
      heLatitude: parseFloatSafe(row.he_latitude_deg),
      heLongitude: parseFloatSafe(row.he_longitude_deg),
      heElevation: parseIntSafe(row.he_elevation_ft),
      heHeadingT: parseFloatSafe(row.he_heading_degT),
      heDisplacedThreshold: parseIntSafe(row.he_displaced_threshold_ft),
    }));

    await importCSV("airport-frequencies.csv", AirportFrequency, (row) => ({
      id: parseIntSafe(row.id),
      airportRef: parseIntSafe(row.airport_ref),
      airportIdent: row.airport_ident,
      type: row.type || null,
      description: row.description || null,
      frequencyMhz: parseFloatSafe(row.frequency_mhz),
    }));

    await importCSV("airport-comments.csv", AirportComment, (row) => {
      const threadRef = parseIntSafe(row.threadRef);
      const airportRef = parseIntSafe(row.airportRef);
      const id = parseIntSafe(row.id);
      if (!id) return null;
      return {
        id,
        threadRef,
        airportRef,
        airportIdent: row.airportIdent || null,
        date: row.date ? new Date(row.date) : null,
        memberNickname: row.memberNickname || null,
        subject: row.subject || null,
        body: row.body || null,
      };
    });

    console.log(
      "[INFO] Filtering and importing commercial airports & cities...",
    );

    const commercialAirportsList = [];
    const uniqueCities = new Set();

    await new Promise((resolve, reject) => {
      const filePath = path.join(CSV_DIR, "airports.csv");
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const type = row.type;
          const iata = row.iata_code ? row.iata_code.trim() : "";
          if (
            (type === "medium_airport" || type === "large_airport") &&
            iata.length === 3
          ) {
            commercialAirportsList.push(row);
            const countryName =
              countryMap[row.iso_country] ||
              row.iso_country ||
              "Unknown Country";
            const cityName = row.municipality
              ? `${row.municipality.trim()}, ${countryName}`
              : `${row.name.trim()}, ${countryName}`;
            uniqueCities.add(cityName);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(
      `[INFO] Found ${commercialAirportsList.length} commercial airports and ${uniqueCities.size} unique cities.`,
    );

    const citiesToCreate = Array.from(uniqueCities).map((name) => ({ name }));
    console.log(`[INFO] Bulk creating ${citiesToCreate.length} cities...`);
    for (let i = 0; i < citiesToCreate.length; i += BATCH_SIZE) {
      await City.bulkCreate(citiesToCreate.slice(i, i + BATCH_SIZE), {
        ignoreDuplicates: true,
      });
    }
    console.log("[SUCCESS] Cities seeded.");

    const allCities = await City.findAll({ attributes: ["id", "name"] });
    const cityIdMap = {};
    allCities.forEach((city) => {
      cityIdMap[city.name] = city.id;
    });

    const airportsToCreate = [];
    const uniqueAirportCodes = new Set();

    commercialAirportsList.forEach((row) => {
      const code = row.iata_code.trim().toUpperCase();
      if (uniqueAirportCodes.has(code)) return;
      uniqueAirportCodes.add(code);

      const countryName =
        countryMap[row.iso_country] || row.iso_country || "Unknown Country";
      const cityName = row.municipality
        ? `${row.municipality.trim()}, ${countryName}`
        : `${row.name.trim()}, ${countryName}`;
      const cityId = cityIdMap[cityName];

      airportsToCreate.push({
        name: row.name,
        code: code,
        address: `${code} Terminal Road, ${cityName}`,
        cityId: cityId,
      });
    });

    console.log(`[INFO] Bulk creating ${airportsToCreate.length} airports...`);
    for (let i = 0; i < airportsToCreate.length; i += BATCH_SIZE) {
      await Airport.bulkCreate(airportsToCreate.slice(i, i + BATCH_SIZE), {
        ignoreDuplicates: true,
      });
    }
    console.log("[SUCCESS] Airports seeded.");

    // 9. Generate realistic flights between real-world commercial airports
    console.log("[INFO] Seeding flight data...");
    const seededAirports = await Airport.findAll({
      include: [City],
    });

    const airplanes = await Airplane.findAll();
    let flightAirplanes = airplanes;
    if (flightAirplanes.length === 0) {
      console.log("[INFO] Seeding default airplanes...");
      flightAirplanes = await Airplane.bulkCreate([
        { modelNumber: "Airbus A320", capacity: 180 },
        { modelNumber: "Boeing 737-800", capacity: 174 },
        { modelNumber: "Boeing 777-300ER", capacity: 396 },
        { modelNumber: "Airbus A350-900", capacity: 325 },
      ]);
    }

    // Divide airports into countries to generate concentrated domestic/international flights
    const airportsByCountry = {};
    seededAirports.forEach((ap) => {
      const nameParts = ap.City?.name.split(", ");
      const country = nameParts ? nameParts[nameParts.length - 1] : "Unknown";
      if (!airportsByCountry[country]) {
        airportsByCountry[country] = [];
      }
      airportsByCountry[country].push(ap);
    });

    const indAirports = airportsByCountry["India"] || [];
    const usAirports = airportsByCountry["United States"] || [];

    console.log(
      `[INFO] Found ${indAirports.length} Indian airports and ${usAirports.length} US airports for domestic routes.`,
    );

    const flightRows = [];
    const now = new Date();
    const flightNumberSet = new Set();

    function generateFlightNumber(index) {
      let num = `SG${String(100 + index).padStart(4, "0")}`;
      while (flightNumberSet.has(num)) {
        num = `SG${String(Math.floor(Math.random() * 90000) + 10000)}`;
      }
      flightNumberSet.add(num);
      return num;
    }

    // A helper to push flight records
    function addFlight(fromAp, toAp, index, departureOffsetHours) {
      const airplane = flightAirplanes[index % flightAirplanes.length];
      const departureTime = new Date();
      // Distribute departure times over the next 15 days
      departureTime.setHours(departureTime.getHours() + departureOffsetHours);

      const durationHours = 2 + (index % 12); // Realistic flight hours
      const arrivalTime = new Date(
        departureTime.getTime() + durationHours * 60 * 60 * 1000,
      );
      const basePrice = 4000 + ((index * 257) % 65000);

      flightRows.push({
        flightNumber: generateFlightNumber(index),
        airplaneId: airplane.id,
        departureAirportId: fromAp.code,
        arrivalAirportId: toAp.code,
        departureTime,
        arrivalTime,
        price: basePrice,
        boardingGate: `${String.fromCharCode(65 + (index % 6))}${(index % 20) + 1}`,
        totalSeats: airplane.capacity,
        createdAt: now,
        updatedAt: now,
      });
    }

    let flightIndex = 0;

    // A. Generate domestic India flights (e.g. BOM <-> DEL, BLR <-> DEL, CCU <-> BOM, etc.)
    if (indAirports.length >= 2) {
      console.log("[INFO] Generating domestic Indian routes...");
      for (let i = 0; i < Math.min(indAirports.length, 30); i++) {
        for (let j = 0; j < Math.min(indAirports.length, 30); j++) {
          if (i === j) continue;
          // Generate a couple of flights at different times for each pair
          for (let offset = 4; offset <= 360; offset += 36) {
            addFlight(indAirports[i], indAirports[j], flightIndex++, offset);
          }
        }
      }
    }

    // B. Generate domestic US flights (e.g. JFK <-> LAX, ORD <-> SFO, ATL <-> MIA, etc.)
    if (usAirports.length >= 2) {
      console.log("[INFO] Generating domestic US routes...");
      for (let i = 0; i < Math.min(usAirports.length, 30); i++) {
        for (let j = 0; j < Math.min(usAirports.length, 30); j++) {
          if (i === j) continue;
          for (let offset = 6; offset <= 360; offset += 36) {
            addFlight(usAirports[i], usAirports[j], flightIndex++, offset);
          }
        }
      }
    }

    // C. Generate international flights (India <-> US, India <-> UK, US <-> UK, UAE, etc.)
    console.log("[INFO] Generating international routes...");
    const globalMajorAirports = seededAirports.filter((ap) =>
      ["LHR", "DXB", "SIN", "HND", "CDG", "FRA", "SYD"].includes(ap.code),
    );

    // India <-> US
    if (indAirports.length > 0 && usAirports.length > 0) {
      for (let i = 0; i < Math.min(indAirports.length, 10); i++) {
        for (let j = 0; j < Math.min(usAirports.length, 10); j++) {
          for (let offset = 12; offset <= 360; offset += 48) {
            addFlight(indAirports[i], usAirports[j], flightIndex++, offset);
            addFlight(
              usAirports[j],
              indAirports[i],
              flightIndex++,
              offset + 12,
            );
          }
        }
      }
    }

    // Other international destinations
    if (globalMajorAirports.length > 0) {
      const sourcePool = [
        ...indAirports.slice(0, 10),
        ...usAirports.slice(0, 10),
      ];
      sourcePool.forEach((ap, sIdx) => {
        globalMajorAirports.forEach((gAp, gIdx) => {
          for (let offset = 8; offset <= 360; offset += 48) {
            addFlight(ap, gAp, flightIndex++, offset);
            addFlight(gAp, ap, flightIndex++, offset + 18);
          }
        });
      });
    }

    console.log(
      `[INFO] Bulk creating ${flightRows.length} highly realistic flights...`,
    );
    for (let i = 0; i < flightRows.length; i += BATCH_SIZE) {
      await Flight.bulkCreate(flightRows.slice(i, i + BATCH_SIZE), {
        ignoreDuplicates: true,
      });
    }
    console.log(`[SUCCESS] Seeded ${flightRows.length} flights.`);

    console.log("[FINISH] Database seeding pipeline completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[CRITICAL ERROR] Database seeding failed:", err);
    process.exit(1);
  }
}

run();
