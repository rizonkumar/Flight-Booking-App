"use strict";

const AIRPLANE_TARGET = 1000;
const AIRPORT_TARGET = 5000;
const FLIGHT_TARGET = 1200;
const BATCH_SIZE = 1000;

const COUNTRIES = [
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Norway",
  "United Arab Emirates",
  "Qatar",
  "Saudi Arabia",
  "India",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Japan",
  "South Korea",
  "China",
  "Australia",
  "New Zealand",
  "South Africa",
  "Kenya",
  "Egypt",
  "Turkey",
];

const CITY_ROOTS = [
  "Alder",
  "Bayside",
  "Cedar",
  "Dover",
  "Eagle",
  "Fairview",
  "Grand",
  "Harbor",
  "Ivy",
  "Jasper",
  "Kings",
  "Lake",
  "Maple",
  "North",
  "Oak",
  "Pine",
  "Queen",
  "River",
  "Summit",
  "Trinity",
  "Union",
  "Valley",
  "West",
  "York",
  "Zenith",
];

const AIRPORT_SUFFIXES = [
  "International Airport",
  "Regional Airport",
  "Metropolitan Airport",
  "City Airport",
  "Global Gateway",
];

const AIRCRAFT_LAYOUTS = [
  {
    model: "Airbus A320",
    sections: [{ rows: 30, cols: ["A", "B", "C", "D", "E", "F"], type: "economy" }],
  },
  {
    model: "Airbus A321",
    sections: [
      { rows: 4, cols: ["A", "C", "D", "F"], type: "business" },
      { rows: 32, cols: ["A", "B", "C", "D", "E", "F"], type: "economy" },
    ],
  },
  {
    model: "Boeing 737-800",
    sections: [
      { rows: 5, cols: ["A", "C", "D", "F"], type: "business" },
      { rows: 29, cols: ["A", "B", "C", "D", "E", "F"], type: "economy" },
    ],
  },
  {
    model: "Boeing 787-9",
    sections: [
      { rows: 2, cols: ["A", "D", "G", "K"], type: "first-class" },
      { rows: 7, cols: ["A", "D", "G", "K"], type: "business" },
      { rows: 5, cols: ["A", "B", "C", "D", "E", "F", "G", "H"], type: "premium-economy" },
      { rows: 23, cols: ["A", "B", "C", "D", "E", "F", "G", "H", "J"], type: "economy" },
    ],
  },
  {
    model: "Airbus A350-900",
    sections: [
      { rows: 8, cols: ["A", "D", "G", "K"], type: "business" },
      { rows: 6, cols: ["A", "B", "C", "D", "E", "F", "G", "H"], type: "premium-economy" },
      { rows: 25, cols: ["A", "B", "C", "D", "E", "F", "G", "H", "J"], type: "economy" },
    ],
  },
  {
    model: "Boeing 777-300ER",
    sections: [
      { rows: 2, cols: ["A", "D", "G", "K"], type: "first-class" },
      { rows: 10, cols: ["A", "D", "G", "K"], type: "business" },
      { rows: 6, cols: ["A", "B", "C", "D", "E", "F", "G", "H"], type: "premium-economy" },
      { rows: 30, cols: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], type: "economy" },
    ],
  },
];

function capacityFor(layout) {
  return layout.sections.reduce((total, section) => total + section.rows * section.cols.length, 0);
}

function cityName(index) {
  const root = CITY_ROOTS[index % CITY_ROOTS.length];
  const country = COUNTRIES[index % COUNTRIES.length];
  return `${root} ${String(index + 1).padStart(4, "0")}, ${country}`;
}

function airportCode(index) {
  let value = index;
  let code = "";
  for (let i = 0; i < 3; i += 1) {
    code = String.fromCharCode(65 + (value % 26)) + code;
    value = Math.floor(value / 26);
  }
  return code;
}

function airportRows(now) {
  return Array.from({ length: AIRPORT_TARGET }, (_, index) => {
    const city = cityName(index);
    const code = airportCode(index + 1000);
    return {
      name: `${city.split(",")[0]} ${AIRPORT_SUFFIXES[index % AIRPORT_SUFFIXES.length]}`,
      code,
      address: `${code} Terminal Road, ${city}`,
      cityId: index + 1,
      createdAt: now,
      updatedAt: now,
    };
  });
}

function cityRows(now) {
  return Array.from({ length: AIRPORT_TARGET }, (_, index) => ({
    name: cityName(index),
    createdAt: now,
    updatedAt: now,
  }));
}

function airplaneRows(now) {
  return Array.from({ length: AIRPLANE_TARGET }, (_, index) => {
    const layout = AIRCRAFT_LAYOUTS[index % AIRCRAFT_LAYOUTS.length];
    return {
      modelNumber: `${layout.model}-STD-${String(index + 1).padStart(4, "0")}`,
      capacity: capacityFor(layout),
      createdAt: now,
      updatedAt: now,
    };
  });
}

function seatRows(airplanes, now) {
  const rows = [];
  airplanes.forEach((airplane, index) => {
    const layout = AIRCRAFT_LAYOUTS[index % AIRCRAFT_LAYOUTS.length];
    let rowNumber = 1;
    layout.sections.forEach((section) => {
      for (let row = 0; row < section.rows; row += 1) {
        section.cols.forEach((col) => {
          rows.push({
            airplaneId: airplane.id,
            row: rowNumber,
            col,
            type: section.type,
            createdAt: now,
            updatedAt: now,
          });
        });
        rowNumber += 1;
      }
    });
  });
  return rows;
}

function flightRows(airplanes, now) {
  const firstDeparture = Date.UTC(2026, 5, 1, 6, 0, 0);
  return Array.from({ length: FLIGHT_TARGET }, (_, index) => {
    const airplane = airplanes[index % airplanes.length];
    const departureIndex = index % AIRPORT_TARGET;
    const arrivalIndex = (index * 37 + 113) % AIRPORT_TARGET;
    const departureTime = new Date(firstDeparture + index * 45 * 60 * 1000);
    const durationHours = 1 + (index % 15);
    const basePrice = 2500 + (index * 137) % 90000;
    return {
      flightNumber: `FB${String(index + 1).padStart(5, "0")}`,
      airplaneId: airplane.id,
      departureAirportId: airportCode(departureIndex + 1000),
      arrivalAirportId: airportCode((arrivalIndex === departureIndex ? arrivalIndex + 1 : arrivalIndex) + 1000),
      arrivalTime: new Date(departureTime.getTime() + durationHours * 60 * 60 * 1000),
      departureTime,
      price: basePrice + (durationHours * 499),
      boardingGate: `${String.fromCharCode(65 + (index % 12))}${(index % 40) + 1}`,
      totalSeats: airplane.capacity,
      createdAt: now,
      updatedAt: now,
    };
  });
}

async function bulkInsertInBatches(queryInterface, tableName, rows) {
  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    await queryInterface.bulkInsert(tableName, rows.slice(index, index + BATCH_SIZE));
  }
}

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM Airplanes WHERE modelNumber LIKE 'Airbus A320-STD-%'"
    );

    if (Number(existing[0].count) > 0) {
      return;
    }

    const now = new Date();

    await bulkInsertInBatches(queryInterface, "Cities", cityRows(now));
    await bulkInsertInBatches(queryInterface, "Airports", airportRows(now));
    await bulkInsertInBatches(queryInterface, "Airplanes", airplaneRows(now));

    const [seededAirplanes] = await queryInterface.sequelize.query(
      "SELECT id, modelNumber, capacity FROM Airplanes WHERE modelNumber LIKE '%-STD-%' ORDER BY id ASC"
    );

    await bulkInsertInBatches(queryInterface, "Seats", seatRows(seededAirplanes, now));
    await bulkInsertInBatches(queryInterface, "Flights", flightRows(seededAirplanes, now));
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("DELETE FROM Flights WHERE flightNumber LIKE 'FB%'");
    await queryInterface.sequelize.query(
      "DELETE Seats FROM Seats INNER JOIN Airplanes ON Seats.airplaneId = Airplanes.id WHERE Airplanes.modelNumber LIKE '%-STD-%'"
    );
    await queryInterface.sequelize.query("DELETE FROM Airplanes WHERE modelNumber LIKE '%-STD-%'");
    await queryInterface.sequelize.query("DELETE FROM Airports WHERE address LIKE '% Terminal Road, %'");
    await queryInterface.sequelize.query(
      "DELETE FROM Cities WHERE name REGEXP '^[A-Za-z]+ [0-9]{4}, '"
    );
  },
};
