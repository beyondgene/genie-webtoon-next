'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'members',
      [
        {
          memberId: 'testuser1',
          memberPassword: 'hashed_password_1',
          nickname: '웹툰광',
          name: '홍길동',
          age: 25,
          gender: 'MALE',
          email: 'gildong.hong@example.com',
          phoneNumber: '010-1234-5678',
          address: '서울시 강남구',
          status: 'ACTIVE',
          adminId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          memberId: 'testuser2',
          memberPassword: 'hashed_password_2',
          nickname: '만화사랑',
          name: '김영희',
          age: 31,
          gender: 'FEMALE',
          email: 'younghee.kim@example.com',
          phoneNumber: '010-8765-4321',
          address: '경기도 성남시',
          status: 'ACTIVE',
          adminId: 2, // manager01이 관리
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('members', null, {});
  },
};
