'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'webtoon',
      [
        {
          webtoonName: '세상을 구하는 방법',
          discription: '평범한 내가 이세계의 용사?',
          genre: 'FANTASY',
          views: 120000,
          recommend: 8500,
          adminIdx: 2, // manager01
          artistIdx: 1, // 귀귀 작가
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          webtoonName: '그해 여름, 우리',
          discription: '첫사랑에 대한 아련한 기억',
          genre: 'ROMANCE',
          views: 250000,
          recommend: 15000,
          adminIdx: 2, // manager01
          artistIdx: 2, // 뺵뺵 작가
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('webtoon', null, {});
  },
};
