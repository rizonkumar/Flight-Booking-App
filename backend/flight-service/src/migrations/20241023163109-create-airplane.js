'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Duplicate historical migration; the earlier airplane migration owns this table.
  },
  async down(queryInterface, Sequelize) {
    // No-op so rollback order does not drop Airplanes before dependent tables.
  }
};
