// 광고 시청로그 테이블 시더
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'ad_view_log',
      [
        {
          viewedAt: new Date(),
          memberId: 1, // 회원(홍길동)의 광고 조회
          adId: 1, // '여름맞이 특별 할인 이벤트' 광고
        },
        {
          viewedAt: new Date(),
          memberId: 2, // 회원(김영희)의 광고 조회
          adId: 1,
        },
        {
          viewedAt: new Date(),
          memberId: 3,
          adId: 2, // '신작 웹툰 홍보 배너' 광고
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ad_view_log', null, {});
  },
};
