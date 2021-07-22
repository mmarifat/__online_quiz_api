const aggregateToVirtualAggregateQuery = [
  {
    $addFields: {
      id: '$_id',
    },
  },
  {
    $unset: ['_id', '__v', 'password'],
  },
];

export default aggregateToVirtualAggregateQuery;
