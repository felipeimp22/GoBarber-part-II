require('dotenv/config'); // or require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST, // 'localhost'
  username: process.env.DB_USER, // 'postgres'
  password: process.env.DB_PASS, // 'docker'
  database: process.env.DB_NAME, // 'gobarber'
  define: {
    timestamps: true, // ensures that you have a "created at and updated at" column within each table within the database
    underscored: true,
    underscoredAll: true, // ensures that the sequelize has table and column nameclatura patterns through the underscor pattern
  },
};
