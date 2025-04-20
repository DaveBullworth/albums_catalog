const { Album, Track } = require('../models/models');
const ApiError = require('../error/apiError');
const uuid = require('uuid');
const path = require('path');
const { Op } = require('sequelize');
const fs = require('fs');
const { logError } = require('../utils/logger');

class AlbumController {
  async create(req, res, next) {
    try {
      const { cover } = req.files;
      let fileName = uuid.v4() + '.jpg';
      cover.mv(path.resolve(__dirname, '..', 'static', fileName));
      let { nameAlbum, nameBand, year, review, estimation, favorite, tracks, link } = req.body;

      const album = await Album.create({
        cover: fileName,
        nameAlbum,
        nameBand,
        year,
        review,
        estimation,
        favorite,
        link,
        userId: req.user.id,
      });

      if (tracks) {
        tracks = JSON.parse(tracks);
        tracks.forEach((item, index) =>
          Track.create({
            order: item.order,
            nameTrack: item.nameTrack,
            estimation: item.estimation,
            albumId: album.id,
            link: item.link,
          })
        );
      }

      return res.json(album);
    } catch (error) {
      logError(error, 'AlbumController: ошибка при создании альбома');
      next(ApiError.internal(req.t('album.create.internalError')));
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const album = await Album.findOne({
        where: { id },
        include: [{ model: Track, as: 'tracks' }],
      });

      if (!album) {
        return next(ApiError.notFound(req.t('album.getOne.notFound')));
      } else if (album.userId !== req.user.id) {
        return next(ApiError.forbidden(req.t('album.getOne.forbidden')));
      }

      return res.json(album);
    } catch (error) {
      logError(error, 'AlbumController: ошибка при получении альбома');
      next(ApiError.internal(req.t('album.getOne.internalError')));
    }
  }

  async getPage(req, res, next) {
    let { page, limit, filters } = req.query;
    try {
      filters = filters ? JSON.parse(filters) : {};
      page = page || 1;
      limit = limit || 4;
      let offset = page * limit - limit;
      let albums;

      const conditions = [
        { userId: req.user.id }, // Always filter by current user
      ];

      if (filters.yearA || filters.yearB) {
        const yearCondition = {};
        if (filters.yearA) {
          yearCondition[Op.gt] = filters.yearA - 1;
        }
        if (filters.yearB) {
          yearCondition[Op.lt] = Number(filters.yearB) + 1;
        }
        conditions.push({ year: yearCondition });
      }

      if (filters.nameBand) {
        conditions.push({ nameBand: { [Op.like]: `%${filters.nameBand}%` } });
      }

      if (filters.nameAlbum) {
        conditions.push({ nameAlbum: { [Op.like]: `%${filters.nameAlbum}%` } });
      }

      if (filters.estimation) {
        conditions.push({ estimation: filters.estimation });
      }

      if (filters.favorite) {
        conditions.push({ favorite: filters.favorite });
      }

      const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};
      let order = [['id', 'ASC']]; // Default order by ID

      if (filters.sortYear) {
        if (filters.sortYear === 'asc') {
          order = [['year', 'ASC']];
        } else if (filters.sortYear === 'desc') {
          order = [['year', 'DESC']];
        }
      }

      // Sorting by band name
      if (filters.sortBandName) {
        if (filters.sortBandName === 'asc') {
          order = [['nameBand', 'ASC']];
        } else if (filters.sortBandName === 'desc') {
          order = [['nameBand', 'DESC']];
        }
      }

      // Sorting by album name
      if (filters.sortAlbumName) {
        if (filters.sortAlbumName === 'asc') {
          order = [['nameAlbum', 'ASC']];
        } else if (filters.sortAlbumName === 'desc') {
          order = [['nameAlbum', 'DESC']];
        }
      }

      albums = await Album.findAndCountAll({
        where: whereClause,
        order: order,
        limit,
        offset,
      });

      return res.json(albums);
    } catch (error) {
      logError(error, 'AlbumController: ошибка при получении списка альбомов');
      next(ApiError.internal(req.t('album.getPage.internalError')));
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;

    try {
      const album = await Album.findByPk(id);

      if (!album) {
        next(ApiError.badRequest(req.t('album.delete.notFound')));
      }

      // Get the cover filename
      const coverFileName = album.cover;

      // Delete the album from the database
      await album.destroy();

      // Delete the cover file from the static folder
      const coverFilePath = path.resolve(__dirname, '..', 'static', coverFileName);
      if (fs.existsSync(coverFilePath)) {
        fs.unlinkSync(coverFilePath);
      }

      return res.json({ message: req.t('album.delete.success') });
    } catch (error) {
      logError(error, 'AlbumController: ошибка при удалении альбома');
      next(ApiError.internal(req.t('album.delete.internalError')));
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    let cover = null;
    if (req.files) {
      cover = req.files.cover;
    }
    let { nameAlbum, nameBand, year, review, estimation, favorite, tracks, link } = req.body;
    try {
      const album = await Album.findByPk(id);

      if (!album) {
        next(ApiError.badRequest(req.t('album.update.notFound')));
      } else if (album.userId !== req.user.id) {
        next(ApiError.forbidden(req.t('album.update.forbidden')));
      }

      const oldCoverFileName = album.cover;

      // Обновить поля альбома, если они были переданы
      if (nameAlbum) {
        album.nameAlbum = nameAlbum;
      }
      if (nameBand) {
        album.nameBand = nameBand;
      }
      if (year) {
        album.year = year;
      }
      if (review) {
        album.review = review;
      }
      if (estimation) {
        album.estimation = estimation;
      }
      if (favorite) {
        album.favorite = favorite;
      }
      if (link) {
        album.link = link;
      }
      if (cover) {
        // Если загружено новое изображение обложки, обновить его
        const fileName = uuid.v4() + '.jpg';
        cover.mv(path.resolve(__dirname, '..', 'static', fileName));
        album.cover = fileName;

        // Delete the old cover file
        const oldCoverFilePath = path.resolve(__dirname, '..', 'static', oldCoverFileName);
        if (fs.existsSync(oldCoverFilePath)) {
          fs.unlinkSync(oldCoverFilePath);
        }
      }

      await album.save();

      if (tracks) {
        // Если есть треки, обновить их
        tracks = JSON.parse(tracks);

        // Удалить существующие треки, связанные с альбомом
        await Track.destroy({ where: { albumId: album.id } });

        // Создать новые треки
        tracks.forEach((item, index) => {
          Track.create({
            order: item.order,
            nameTrack: item.nameTrack,
            estimation: item.estimation,
            albumId: album.id,
            link: item.link,
          });
        });
      }

      return res.json(album);
    } catch (error) {
      logError(error, 'AlbumController: ошибка при обновлении альбома');
      next(ApiError.internal(req.t('album.update.internalError')));
    }
  }
}

module.exports = new AlbumController();
