// 관리자 테이블 시더
'use strict';
// 실제 운영에서는 비밀번호를 해싱(hashing)하여 저장해야 합니다.
// const hashedPassword = await bcrypt.hash('password123', 10);
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'admin',
      [
        {
          adminId: 'superadmin',
          adminPassword: 'hashed_super_password', // 실제로는 해싱된 값
          lastLogin: new Date('2025-06-20T10:00:00'),
          isActive: true,
          role: 'SUPER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          adminId: 'manager01',
          adminPassword: 'hashed_manager_password', // 실제로는 해싱된 값
          lastLogin: null,
          isActive: true,
          role: 'MANAGER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin', null, {});
  },
};
