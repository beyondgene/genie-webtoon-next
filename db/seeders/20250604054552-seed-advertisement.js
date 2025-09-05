// 광고 테이블 시더
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'advertisement',
      [
        {
          adName: '여름맞이 특별 할인 이벤트',
          adLocation: 'HOME',
          status: 'ACTIVE',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-08-31'),
          totalExposureLimit: 100000,
          currentExposureCount: 15000,
          adImageUrl: 'https://example.com/ad_images/summer_event.png',
          targetUrl: 'https://example.com/events/summer',
          adminId: 2, // manager01이 등록
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          adName: '신작 웹툰 홍보 배너',
          adLocation: 'SIDE_BANNER',
          status: 'ACTIVE',
          startDate: new Date('2025-06-15'),
          endDate: null,
          totalExposureLimit: null,
          currentExposureCount: 50000,
          adImageUrl: 'https://example.com/ad_images/new_webtoon.png',
          targetUrl: 'https://example.com/webtoons/1',
          adminId: 2, // manager01이 등록
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('advertisement', null, {});
  },
};
