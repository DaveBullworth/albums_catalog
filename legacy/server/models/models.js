const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Album = sequelize.define('album', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cover: { type: DataTypes.STRING, allowNull: false },
  nameAlbum: { type: DataTypes.STRING, allowNull: false },
  nameBand: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  review: { type: DataTypes.TEXT, allowNull: true },
  estimation: { type: DataTypes.BOOLEAN },
  favorite: { type: DataTypes.BOOLEAN },
  link: { type: DataTypes.STRING, allowNull: true },
});

const Track = sequelize.define('track', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order: { type: DataTypes.INTEGER, allowNull: false },
  nameTrack: { type: DataTypes.STRING, allowNull: false },
  estimation: { type: DataTypes.BOOLEAN },
  link: { type: DataTypes.STRING, allowNull: true },
});

User.hasMany(Album, { as: 'albums', onDelete: 'CASCADE' });
Album.belongsTo(User);
Album.hasMany(Track, { as: 'tracks', onDelete: 'CASCADE' });
Track.belongsTo(Album);

module.exports = {
  Album,
  Track,
  User,
};
