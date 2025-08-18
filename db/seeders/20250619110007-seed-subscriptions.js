'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'subscription',
      [
        {
          status: 'ACTIVE',
          alarm_on: true,
          memberId: 1, // 홍길동
          webtoonId: 1, // 세상을 구하는 방법
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          status: 'ACTIVE',
          alarm_on: false,
          memberId: 1, // 홍길동
          webtoonId: 2, // 그해 여름, 우리
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          status: 'ACTIVE',
          alarm_on: true,
          memberId: 2, // 김영희
          webtoonId: 1, // 세상을 구하는 방법
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subscription', null, {});
  },
};
