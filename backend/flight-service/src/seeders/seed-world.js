const db = require("../models");

const cities = [
  { name: "London" }, { name: "New York" }, { name: "Tokyo" }, { name: "Dubai" }, { name: "Paris" },
  { name: "Singapore" }, { name: "Delhi" }, { name: "Mumbai" }, { name: "Bangalore" }, { name: "Sydney" },
  { name: "Melbourne" }, { name: "Rome" }, { name: "Berlin" }, { name: "Amsterdam" }, { name: "Frankfurt" },
  { name: "San Francisco" }, { name: "Los Angeles" }, { name: "Chicago" }, { name: "Toronto" }, { name: "Cairo" },
  { name: "Cape Town" }, { name: "Bangkok" }, { name: "Seoul" }, { name: "Istanbul" }, { name: "Madrid" },
  { name: "Rio de Janeiro" }, { name: "Johannesburg" }, { name: "Shanghai" }, { name: "Hong Kong" }, { name: "Beijing" },
  { name: "Zurich" }, { name: "Vancouver" }, { name: "Barcelona" }, { name: "Lisbon" }, { name: "Vienna" },
  { name: "Prague" }, { name: "Brussels" }, { name: "Dublin" }, { name: "Copenhagen" }, { name: "Oslo" },
  { name: "Stockholm" }, { name: "Helsinki" }, { name: "Warsaw" }, { name: "Budapest" }, { name: "Athens" },
  { name: "Moscow" }, { name: "Doha" }, { name: "Abu Dhabi" }, { name: "Riyadh" }, { name: "Jeddah" },
  { name: "Muscat" }, { name: "Bahrain" }, { name: "Kuwait" }, { name: "Casablanca" }, { name: "Nairobi" },
  { name: "Lagos" }, { name: "Addis Ababa" }, { name: "Chennai" }, { name: "Kolkata" }, { name: "Hyderabad" },
  { name: "Ahmedabad" }, { name: "Cochin" }, { name: "Goa" }, { name: "Pune" }, { name: "Colombo" },
  { name: "Male" }, { name: "Kathmandu" }, { name: "Dhaka" }, { name: "Karachi" }, { name: "Lahore" },
  { name: "Kuala Lumpur" }, { name: "Jakarta" }, { name: "Manila" }, { name: "Ho Chi Minh City" }, { name: "Hanoi" },
  { name: "Taipei" }, { name: "Auckland" }, { name: "Brisbane" }, { name: "Perth" }, { name: "Buenos Aires" },
  { name: "Santiago" }, { name: "Lima" }, { name: "Bogota" }, { name: "Mexico City" }, { name: "Panama City" },
  { name: "Miami" }, { name: "Boston" }, { name: "Seattle" }, { name: "Denver" }, { name: "Las Vegas" },
  { name: "Orlando" }, { name: "Atlanta" }, { name: "Houston" }, { name: "Dallas" }, { name: "Munich" },
  { name: "Milan" }, { name: "Geneva" }, { name: "Nice" }, { name: "Venice" }, { name: "Edinburgh" }
];

const rawAirports = [
  { name: "Heathrow Airport", code: "LHR", address: "Hounslow TW6, UK", cityName: "London" },
  { name: "Gatwick Airport", code: "LGW", address: "Horley, Gatwick RH6 0NP, UK", cityName: "London" },
  { name: "Stansted Airport", code: "STN", address: "Bassingbourn Rd, Stansted CM24 1QW, UK", cityName: "London" },
  { name: "John F. Kennedy International Airport", code: "JFK", address: "Queens, NY 11430, USA", cityName: "New York" },
  { name: "Newark Liberty International Airport", code: "EWR", address: "3 Brewster Rd, Newark, NJ 07714, USA", cityName: "New York" },
  { name: "LaGuardia Airport", code: "LGA", address: "Queens, NY 11371, USA", cityName: "New York" },
  { name: "Haneda Airport", code: "HND", address: "Hanedakuko, Ota City, Tokyo 144-0041, Japan", cityName: "Tokyo" },
  { name: "Narita International Airport", code: "NRT", address: "1-1 Furugome, Narita, Chiba 282-0004, Japan", cityName: "Tokyo" },
  { name: "Dubai International Airport", code: "DXB", address: "Dubai, United Arab Emirates", cityName: "Dubai" },
  { name: "Charles de Gaulle Airport", code: "CDG", address: "95700 Roissy-en-France, France", cityName: "Paris" },
  { name: "Orly Airport", code: "ORY", address: "94390 Orly, France", cityName: "Paris" },
  { name: "Changi Airport", code: "SIN", address: "Changi, Singapore", cityName: "Singapore" },
  { name: "Indira Gandhi International Airport", code: "DEL", address: "New Delhi, Delhi 110037, India", cityName: "Delhi" },
  { name: "Chhatrapati Shivaji Maharaj International Airport", code: "BOM", address: "Mumbai, Maharashtra 400099, India", cityName: "Mumbai" },
  { name: "Kempegowda International Airport", code: "BLR", address: "Devanahalli, Bengaluru, Karnataka 560300, India", cityName: "Bangalore" },
  { name: "Sydney Kingsford Smith Airport", code: "SYD", address: "Mascot NSW 2020, Australia", cityName: "Sydney" },
  { name: "Melbourne Airport", code: "MEL", address: "Tullamarine VIC 3045, Australia", cityName: "Melbourne" },
  { name: "Leonardo da Vinci–Fiumicino Airport", code: "FCO", address: "Via dell' Aeroporto di Fiumicino, 00054 Fiumicino RM, Italy", cityName: "Rome" },
  { name: "Ciampino Airport", code: "CIA", address: "Via Appia Nuova, 00040 Roma RM, Italy", cityName: "Rome" },
  { name: "Berlin Brandenburg Airport", code: "BER", address: "Melli-Beese-Ring 1, 12529 Schönefeld, Germany", cityName: "Berlin" },
  { name: "Schiphol Airport", code: "AMS", address: "Evert van de Beekstraat 202, 1118 CP Schiphol, Netherlands", cityName: "Amsterdam" },
  { name: "Frankfurt Airport", code: "FRA", address: "60547 Frankfurt, Germany", cityName: "Frankfurt" },
  { name: "San Francisco International Airport", code: "SFO", address: "San Francisco, CA 94128, USA", cityName: "San Francisco" },
  { name: "Los Angeles International Airport", code: "LAX", address: "1 World Way, Los Angeles, CA 90045, USA", cityName: "Los Angeles" },
  { name: "O'Hare International Airport", code: "ORD", address: "10000 W O'Hare Ave, Chicago, IL 60666, USA", cityName: "Chicago" },
  { name: "Toronto Pearson International Airport", code: "YYZ", address: "6301 Silver Dart Dr, Mississauga, ON L5P 1B2, Canada", cityName: "Toronto" },
  { name: "Cairo International Airport", code: "CAI", address: "Heliopolis, Cairo Governorate, Egypt", cityName: "Cairo" },
  { name: "Cape Town International Airport", code: "CPT", address: "Matroosfontein, Cape Town, 7490, South Africa", cityName: "Cape Town" },
  { name: "Suvarnabhumi Airport", code: "BKK", address: "Bang Phli District, Samut Prakan 10540, Thailand", cityName: "Bangkok" },
  { name: "Incheon International Airport", code: "ICN", address: "272 Gonghang-ro, Jung-gu, Incheon, South Korea", cityName: "Seoul" },
  { name: "Gimpo International Airport", code: "GMP", address: "112 Haneul-gil, Gangseo-gu, Seoul, South Korea", cityName: "Seoul" },
  { name: "Istanbul Airport", code: "IST", address: "Tayakadın, Terminal Caddesi No:1, 34283 Arnavutköy/İstanbul, Turkey", cityName: "Istanbul" },
  { name: "Sabiha Gökçen International Airport", code: "SAW", address: "Sanayi, 34906 Pendik/İstanbul, Turkey", cityName: "Istanbul" },
  { name: "Adolfo Suárez Madrid–Barajas Airport", code: "MAD", address: "Av de la Hispanidad, s/n, 28042 Madrid, Spain", cityName: "Madrid" },
  { name: "Galeão International Airport", code: "GIG", address: "Av. Vinte de Janeiro, s/n - Ilha do Governador, Rio de Janeiro - RJ, 21941-900, Brazil", cityName: "Rio de Janeiro" },
  { name: "O. R. Tambo International Airport", code: "JNB", address: "1 Jones Rd, Kempton Park, Johannesburg, 1627, South Africa", cityName: "Johannesburg" },
  { name: "Pudong International Airport", code: "PVG", address: "S1 Airport Expressway, Pudong, Shanghai, China", cityName: "Shanghai" },
  { name: "Hong Kong International Airport", code: "HKG", address: "1 Sky Plaza Rd, Chek Lap Kok, Hong Kong", cityName: "Hong Kong" },
  { name: "Beijing Capital International Airport", code: "PEK", address: "Chaoyang, Beijing, China", cityName: "Beijing" },
  { name: "Zurich Airport", code: "ZRH", address: "8058 Kloten, Switzerland", cityName: "Zurich" },
  { name: "Vancouver International Airport", code: "YVR", address: "3211 Grant McConachie Way, Richmond, BC V7B 0Y9, Canada", cityName: "Vancouver" },
  { name: "Josep Tarradellas Barcelona-El Prat Airport", code: "BCN", address: "08820 El Prat de Llobregat, Barcelona, Spain", cityName: "Barcelona" },
  { name: "Humberto Delgado Airport", code: "LIS", address: "Alameda das Comunidades Portuguesas, 1700-111 Lisboa, Portugal", cityName: "Lisbon" },
  { name: "Vienna International Airport", code: "VIE", address: "1300 Schwechat, Austria", cityName: "Vienna" },
  { name: "Václav Havel Airport Prague", code: "PRG", address: "Aviatická, 161 00 Praha 6, Czechia", cityName: "Prague" },
  { name: "Brussels Airport", code: "BRU", address: "Leopoldlaan, 1930 Zaventem, Belgium", cityName: "Brussels" },
  { name: "Dublin Airport", code: "DUB", address: "Dublin, Ireland", cityName: "Dublin" },
  { name: "Copenhagen Airport", code: "CPH", address: "Lufthavnsboulevarden 6, 2770 Kastrup, Denmark", cityName: "Copenhagen" },
  { name: "Oslo Airport", code: "OSL", address: "Edvard Munchs veg, 2061 Gardermoen, Norway", cityName: "Oslo" },
  { name: "Stockholm Arlanda Airport", code: "ARN", address: "190 45 Stockholm-Arlanda, Sweden", cityName: "Stockholm" },
  { name: "Helsinki Airport", code: "HEL", address: "01530 Vantaa, Finland", cityName: "Helsinki" },
  { name: "Warsaw Chopin Airport", code: "WAW", address: "Żwirki i Wigury 1, 00-906 Warszawa, Poland", cityName: "Warsaw" },
  { name: "Budapest Ferenc Liszt International Airport", code: "BUD", address: "Budapest, 1185 Hungary", cityName: "Budapest" },
  { name: "Athens International Airport", code: "ATH", address: "Attiki Odos, Spata Loutsa 190 04, Greece", cityName: "Athens" },
  { name: "Sheremetyevo International Airport", code: "SVO", address: "Khimki, Moscow Oblast, Russia, 141400", cityName: "Moscow" },
  { name: "Domodedovo Airport", code: "DME", address: "Domodedovo, Moscow Oblast, Russia, 142015", cityName: "Moscow" },
  { name: "Hamad International Airport", code: "DOH", address: "Doha, Qatar", cityName: "Doha" },
  { name: "Abu Dhabi International Airport", code: "AUH", address: "Abu Dhabi, United Arab Emirates", cityName: "Abu Dhabi" },
  { name: "King Khalid International Airport", code: "RUH", address: "Riyadh 11564, Saudi Arabia", cityName: "Riyadh" },
  { name: "King Abdulaziz International Airport", code: "JED", address: "Jeddah 23721, Saudi Arabia", cityName: "Jeddah" },
  { name: "Muscat International Airport", code: "MCT", address: "Muscat, Oman", cityName: "Muscat" },
  { name: "Bahrain International Airport", code: "BAH", address: "Muharraq, Bahrain", cityName: "Bahrain" },
  { name: "Kuwait International Airport", code: "KWI", address: "Gazali Rd, Kuwait", cityName: "Kuwait" },
  { name: "Mohammed V International Airport", code: "CMN", address: "Casablanca, Morocco", cityName: "Casablanca" },
  { name: "Jomo Kenyatta International Airport", code: "NBO", address: "Embakasi, Nairobi, Kenya", cityName: "Nairobi" },
  { name: "Murtala Muhammed International Airport", code: "LOS", address: "Ikeja, Lagos, Nigeria", cityName: "Lagos" },
  { name: "Bole International Airport", code: "ADD", address: "Addis Ababa, Ethiopia", cityName: "Addis Ababa" },
  { name: "Chennai International Airport", code: "MAA", address: "Meenambakkam, Chennai, Tamil Nadu 600027, India", cityName: "Chennai" },
  { name: "Netaji Subhash Chandra Bose International Airport", code: "CCU", address: "Jessore Rd, Dum Dum, Kolkata, West Bengal 700052, India", cityName: "Kolkata" },
  { name: "Rajiv Gandhi International Airport", code: "HYD", address: "Shamshabad, Hyderabad, Telangana 500409, India", cityName: "Hyderabad" },
  { name: "Sardar Vallabhbhai Patel International Airport", code: "AMD", address: "Hansol, Ahmedabad, Gujarat 380003, India", cityName: "Ahmedabad" },
  { name: "Cochin International Airport", code: "COK", address: "Airport Rd, Kochi, Kerala 683111, India", cityName: "Cochin" },
  { name: "Dabolim Airport", code: "GOI", address: "Dabolim, Goa 403801, India", cityName: "Goa" },
  { name: "Pune Airport", code: "PNQ", address: "Lohegaon, Pune, Maharashtra 411032, India", cityName: "Pune" },
  { name: "Bandaranaike International Airport", code: "CMB", address: "Canada Friendly Rd, Katunayake 11450, Sri Lanka", cityName: "Colombo" },
  { name: "Velana International Airport", code: "MLE", address: "Hulhulé Island, Maldives", cityName: "Male" },
  { name: "Tribhuvan International Airport", code: "KTM", address: "Ring Rd, Kathmandu 44600, Nepal", cityName: "Kathmandu" },
  { name: "Hazrat Shahjalal International Airport", code: "DAC", address: "Airport Rd, Sector 1, Kurmitola, Dhaka 1229, Bangladesh", cityName: "Dhaka" },
  { name: "Jinnah International Airport", code: "KHI", address: "Airport Road, Karachi, Sindh, Pakistan", cityName: "Karachi" },
  { name: "Allama Iqbal International Airport", code: "LHE", address: "Airport Road, Lahore, Punjab, Pakistan", cityName: "Lahore" },
  { name: "Kuala Lumpur International Airport", code: "KUL", address: "64000 Sepang, Selangor, Malaysia", cityName: "Kuala Lumpur" },
  { name: "Soekarno-Hatta International Airport", code: "CGK", address: "Tangerang City, Banten 15126, Indonesia", cityName: "Jakarta" },
  { name: "Ninoy Aquino International Airport", code: "MNL", address: "Pasay, Metro Manila, Philippines", cityName: "Manila" },
  { name: "Tan Son Nhat International Airport", code: "SGN", address: "Truong Son, Ward 2, Tan Binh, Ho Chi Minh City, Vietnam", cityName: "Ho Chi Minh City" },
  { name: "Noi Bai International Airport", code: "HAN", address: "Phu Minh, Soc Son, Hanoi, Vietnam", cityName: "Hanoi" },
  { name: "Taoyuan International Airport", code: "TPE", address: "Dayuan District, Taoyuan City, Taiwan", cityName: "Taipei" },
  { name: "Auckland Airport", code: "AKL", address: "Ray Emery Dr, Mangere, Auckland 2022, New Zealand", cityName: "Auckland" },
  { name: "Brisbane Airport", code: "BNE", address: "Airport Dr, Brisbane Airport QLD 4008, Australia", cityName: "Brisbane" },
  { name: "Perth Airport", code: "PER", address: "Perth WA 6105, Australia", cityName: "Perth" },
  { name: "Ministro Pistarini International Airport", code: "EZE", address: "Autopista Tte. Gral. Ricchieri Km 33,5, B1802 Ezeiza, Buenos Aires, Argentina", cityName: "Buenos Aires" },
  { name: "Arturo Merino Benítez International Airport", code: "SCL", address: "Pudahuel, Santiago, Metropolitan Region, Chile", cityName: "Santiago" },
  { name: "Jorge Chávez International Airport", code: "LIM", address: "Av. Elmer Faucett s/n, Callao 07031, Peru", cityName: "Lima" },
  { name: "El Dorado International Airport", code: "BOG", address: "Fontibón, Bogotá, Colombia", cityName: "Bogota" },
  { name: "Mexico City International Airport", code: "MEX", address: "Av. Capitán Carlos León s/n, Peñón de los Baños, Venustiano Carranza, 15620 Ciudad de México, CDMX, Mexico", cityName: "Mexico City" },
  { name: "Tocumen International Airport", code: "PTY", address: "Avenida Domingo Díaz, Panama City, Panama", cityName: "Panama City" },
  { name: "Miami International Airport", code: "MIA", address: "2100 NW 42nd Ave, Miami, FL 33142, USA", cityName: "Miami" },
  { name: "Boston Logan International Airport", code: "BOS", address: "Boston, MA 02128, USA", cityName: "Boston" },
  { name: "Seattle-Tacoma International Airport", code: "SEA", address: "17801 International Blvd, Seattle, WA 98158, USA", cityName: "Seattle" },
  { name: "Denver International Airport", code: "DEN", address: "8500 Peña Blvd, Denver, CO 80249, USA", cityName: "Denver" },
  { name: "Harry Reid International Airport", code: "LAS", address: "5757 Wayne Newton Blvd, Las Vegas, NV 89119, USA", cityName: "Las Vegas" },
  { name: "Orlando International Airport", code: "MCO", address: "1 Jeff Fuqua Blvd, Orlando, FL 32827, USA", cityName: "Orlando" },
  { name: "Hartsfield-Jackson Atlanta International Airport", code: "ATL", address: "6000 N Terminal Pkwy, Atlanta, GA 30320, USA", cityName: "Atlanta" },
  { name: "George Bush Intercontinental Airport", code: "IAH", address: "2800 N Terminal Rd, Houston, TX 77032, USA", cityName: "Houston" },
  { name: "Dallas/Fort Worth International Airport", code: "DFW", address: "2400 Aviation Dr, DFW Airport, TX 75261, USA", cityName: "Dallas" },
  { name: "Munich Airport", code: "MUC", address: "Nordallee 25, 85356 München, Germany", cityName: "Munich" },
  { name: "Malpensa Airport", code: "MXP", address: "21010 Ferno Varese, Italy", cityName: "Milan" },
  { name: "Geneva Airport", code: "GVA", address: "Route de l'Aéroport 21, 1215 Genève, Switzerland", cityName: "Geneva" },
  { name: "Nice Côte d'Azur Airport", code: "NCE", address: "Rue Costes et Bellonte, 06206 Nice, France", cityName: "Nice" },
  { name: "Venice Marco Polo Airport", code: "VCE", address: "Viale Galileo Galilei, 30, 30173 Venezia VE, Italy", cityName: "Venice" },
  { name: "Edinburgh Airport", code: "EDI", address: "Edinburgh EH12 9DN, UK", cityName: "Edinburgh" }
];

const airplaneModels = [
  { modelNumber: "Boeing 777-300ER", capacity: 396 },
  { modelNumber: "Airbus A350-900", capacity: 325 },
  { modelNumber: "Boeing 787-9 Dreamliner", capacity: 290 },
  { modelNumber: "Airbus A330-900neo", capacity: 287 },
  { modelNumber: "Boeing 737 MAX 8", capacity: 178 },
  { modelNumber: "Airbus A321neo", capacity: 220 },
  { modelNumber: "Airbus A320neo", capacity: 180 },
  { modelNumber: "Embraer 195-E2", capacity: 132 },
  { modelNumber: "Boeing 747-8 Intercontinental", capacity: 410 },
  { modelNumber: "Airbus A380-800", capacity: 525 },
  { modelNumber: "Bombardier CRJ-900", capacity: 90 },
  { modelNumber: "ATR 72-600", capacity: 78 }
];

const airlines = ["AI", "EK", "QR", "SQ", "LH", "BA", "AF", "AA", "DL", "UA", "EY", "CX"];

async function seed() {
  try {
    await db.sequelize.authenticate();
    
    await db.City.destroy({ where: {}, truncate: { cascade: true }, force: true }).catch(() => {});
    await db.Airport.destroy({ where: {}, truncate: { cascade: true }, force: true }).catch(() => {});
    await db.Airplane.destroy({ where: {}, truncate: { cascade: true }, force: true }).catch(() => {});
    await db.Flight.destroy({ where: {}, truncate: { cascade: true }, force: true }).catch(() => {});
    await db.Seat.destroy({ where: {}, truncate: { cascade: true }, force: true }).catch(() => {});

    console.log("Seeding cities...");
    const createdCitiesList = await db.City.bulkCreate(cities, { returning: true });
    
    const cityMap = {};
    createdCitiesList.forEach(city => {
      cityMap[city.name] = city.id;
    });

    console.log("Seeding airports...");
    const airportsToSeed = rawAirports.map(airport => ({
      name: airport.name,
      code: airport.code,
      address: airport.address,
      cityId: cityMap[airport.cityName] || createdCitiesList[0].id
    }));
    const createdAirports = await db.Airport.bulkCreate(airportsToSeed, { returning: true });

    console.log("Seeding airplanes...");
    const createdAirplanes = await db.Airplane.bulkCreate(airplaneModels, { returning: true });

    console.log("Seeding seats...");
    const seatsToSeed = [];
    createdAirplanes.forEach(airplane => {
      const rows = Math.min(20, Math.ceil(airplane.capacity / 6));
      const cols = ["A", "B", "C", "D", "E", "F"];
      
      for (let r = 1; r <= rows; r++) {
        cols.forEach(c => {
          let seatType = "economy";
          if (r <= 2) {
            seatType = "first-class";
          } else if (r <= 5) {
            seatType = "business";
          } else if (r <= 8) {
            seatType = "premium-economy";
          }

          seatsToSeed.push({
            airplaneId: airplane.id,
            row: r,
            col: c,
            type: seatType
          });
        });
      }
    });
    await db.Seat.bulkCreate(seatsToSeed);

    console.log("Generating 1000+ flights dynamically...");
    const flightsToSeed = [];
    const now = new Date();

    for (let i = 1; i <= 1200; i++) {
      const deptAirportIndex = Math.floor(Math.random() * createdAirports.length);
      let arrAirportIndex = Math.floor(Math.random() * createdAirports.length);
      while (arrAirportIndex === deptAirportIndex) {
        arrAirportIndex = Math.floor(Math.random() * createdAirports.length);
      }

      const depAirport = createdAirports[deptAirportIndex];
      const arrAirport = createdAirports[arrAirportIndex];
      const airplane = createdAirplanes[Math.floor(Math.random() * createdAirplanes.length)];
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      
      const depDate = new Date(now.getTime());
      depDate.setDate(depDate.getDate() + Math.floor(Math.random() * 30));
      depDate.setHours(Math.floor(Math.random() * 24));
      depDate.setMinutes(Math.floor(Math.random() * 4) * 15);
      depDate.setSeconds(0);
      depDate.setMilliseconds(0);

      const durationMinutes = 60 + Math.floor(Math.random() * 600);
      const arrDate = new Date(depDate.getTime() + durationMinutes * 60 * 1000);

      const flightNumber = `${airline}-${100 + Math.floor(Math.random() * 900)}`;
      const price = 4000 + Math.floor(Math.random() * 80000);
      const boardingGate = `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20) + 1}`;

      flightsToSeed.push({
        flightNumber,
        airplaneId: airplane.id,
        departureAirportId: depAirport.code,
        arrivalAirportId: arrAirport.code,
        departureTime: depDate,
        arrivalTime: arrDate,
        price,
        boardingGate,
        totalSeats: airplane.capacity
      });
    }

    await db.Flight.bulkCreate(flightsToSeed);
    console.log("Dynamic World Seeding completed successfully!");
    console.log(`- Seeded ${createdCitiesList.length} Cities`);
    console.log(`- Seeded ${createdAirports.length} Airports`);
    console.log(`- Seeded ${createdAirplanes.length} Airplanes`);
    console.log(`- Seeded ${seatsToSeed.length} Seats`);
    console.log(`- Seeded ${flightsToSeed.length} Flights`);
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
}

seed();
