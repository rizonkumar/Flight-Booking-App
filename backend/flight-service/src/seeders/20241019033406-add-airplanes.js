"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM Airplanes WHERE modelNumber IN ('A340', 'boeing737')"
    );

    if (Number(existing[0].count) > 0) {
      return;
    }

    await queryInterface.bulkInsert("Airplanes", [
      {
        modelNumber: "A340",
        capacity: 900,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "boeing737",
        capacity: 400,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Airplanes", {
      modelNumber: ["A340", "boeing737"],
    });
  },
};
