const cors = {
  cors: {
    stub: {
      predicates: [
        {
          equals: {
            method: 'OPTIONS',
          },
        },
      ],
      responses: [
        {
          is: {
            statusCode: 200,
          },
        },
      ],
    },
  },
};
module.exports = cors;
