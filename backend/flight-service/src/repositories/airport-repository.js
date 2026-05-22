const CrudRepository = require("./crud-repository");
const { Airport, City } = require("../models");

class AirportRepository extends CrudRepository {
  constructor() {
    super(Airport);
  }

  async getAll() {
    return await Airport.findAll({
      include: {
        model: City,
        required: true,
      },
    });
  }
}

module.exports = AirportRepository;
