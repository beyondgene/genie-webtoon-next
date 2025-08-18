'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'artist',
      [
        {
          realName: '김성모',
          artistName: '김화백',
          artistPhone: '010-1993-0115',
          artistEmail: 'kimsungmo@example.com',
          webtoonList: '럭키짱,대털,마계대전',
          debutDate: new Date('1993-01-15'),
          adminId: 1, // 'superadmin'의 idx를 참조 (가정)
          modifiedDate: new Date(),
        },
        {
          realName: '박태준',
          artistName: '박만사',
          artistPhone: '010-2014-1120',
          artistEmail: 'parktaejun@example.com',
          webtoonList: '외모지상주의,인생존망,싸움독학',
          debutDate: new Date('2014-11-20'),
          adminId: 2, // 'manager01'의 idx를 참조 (가정)
          modifiedDate: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('artist', null, {});
  },
};
