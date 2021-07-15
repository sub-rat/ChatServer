'use strict';

import {LoginService} from "../service/login.service";
import {QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
      return queryInterface.bulkInsert('AuthUser', [{
        firstName: 'Admin',
        lastName: 'Admin',
        email: 'chat@ayaanshtech.com',
        password: LoginService.hashPassword('Admin@2020'),
        isVerified: true,
        isAdmin: true
      }], {});
  },

  down: (queryInterface: any, Sequelize: any) => {
    return queryInterface.bulkDelete('AuthUser', null, {})
  }
};
