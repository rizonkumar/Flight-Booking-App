'use strict';

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
            },
            role: {
                type: DataTypes.ENUM('admin', 'customer'),
                defaultValue: 'customer',
                allowNull: false,
            },
        },
        {
            hooks: {
                beforeCreate: async (user) => {
                    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
                    user.password = hashedPassword;
                },
            },
        }
    );

    User.prototype.isPasswordMatch = async function (plainPassword) {
        return bcrypt.compare(plainPassword, this.password);
    };

    User.associate = function (models) {
        // define associations here
    };

    return User;
};
