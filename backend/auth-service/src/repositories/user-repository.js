const CrudRepository = require('./crud-repository');
const { User } = require('../models');
const { Logger } = require('../config');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async getUserByEmail(email) {
        try {
            const user = await User.findOne({ where: { email } });
            return user;
        } catch (error) {
            Logger.error(`UserRepository getUserByEmail error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = UserRepository;
