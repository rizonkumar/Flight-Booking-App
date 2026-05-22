"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS count FROM Seats WHERE airplaneId = 1"
    );

    if (Number(existing[0].count) > 0) {
      return;
    }

    await queryInterface.bulkInsert("Seats", [
      {
        airplaneId: 1,
        row: 1,
        col: "A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 1,
        col: "B",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 1,
        col: "C",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 1,
        col: "D",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 1,
        col: "E",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 1,
        col: "F",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 2,
        col: "A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 2,
        col: "B",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 2,
        col: "C",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 2,
        col: "D",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 2,
        col: "E",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        airplaneId: 1,
        row: 2,
        col: "F",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Seats", { airplaneId: 1 });
  },
};
