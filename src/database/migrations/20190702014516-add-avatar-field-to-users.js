module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER, // integer becouse reference only the ID of image
      references: { model: 'files', key: 'id' }, // foreign key
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
