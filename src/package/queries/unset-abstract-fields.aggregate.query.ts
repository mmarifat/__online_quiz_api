const unsetAbstractFieldsAggregateQuery = {
  $unset: ['createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'isDeleted'],
};

export default [unsetAbstractFieldsAggregateQuery];
