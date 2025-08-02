'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'comments',
      [
        {
          likes: 'LIKE',
          creationDate: new Date(),
          modifiedDate: new Date(),
          memberId: 1, // 홍길동
          webtoonId: 1, // 세상을 구하는 방법
          episodeId: 1, // 1화
          adminId: null,
        },
        {
          likes: 'NONE',
          creationDate: new Date(),
          modifiedDate: new Date(),
          memberId: 2, // 김영희
          webtoonId: 1,
          episodeId: 1,
          adminId: null,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  },
};
