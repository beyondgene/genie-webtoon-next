'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'episode',
      [
        {
          title: '1화: 모든 것의 시작',
          epthumbnailUrl: 'https://example.com/thumbnails/webtoon1_ep1.jpg',
          contexntUrl: 'https://example.com/content/webtoon1_ep1.mp4',
          uploadDate: new Date(),
          webtoonId: 1, // '세상을 구하는 방법'
          adId: 2,
          adminId: 2,
        },
        {
          title: '2화: 새로운 동료',
          epthumbnailUrl: 'https://example.com/thumbnails/webtoon1_ep2.jpg',
          contexntUrl: 'https://example.com/content/webtoon1_ep2.mp4',
          uploadDate: new Date(),
          webtoonId: 1,
          adId: 2,
          adminId: 2,
        },
        {
          title: '1화: 첫 만남',
          epthumbnailUrl: 'https://example.com/thumbnails/webtoon3_ep1.jpg',
          contexntUrl: 'https://example.com/content/webtoon1_ep3.mp4',
          uploadDate: new Date(),
          webtoonId: 2, // '그해 여름, 우리'
          adId: 1,
          adminId: 2,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('episode', null, {});
  },
};
