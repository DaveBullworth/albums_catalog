const {Album, Track} = require('../models/models')
const {ApiError} = require('../error/apiError')
const uuid = require('uuid')
const path = require('path')
const { Op } = require("sequelize")
const fs = require('fs');

class AlbumController {
    async create(req,res, next){
        try{
            const {cover} = req.files
            let fileName = uuid.v4() + ".jpg"
            cover.mv(path.resolve(__dirname, '..', 'static', fileName))
            let {nameAlbum, nameBand, year, review, estimation, favorite, tracks, link} = req.body

            const album = await Album.create({cover: fileName, nameAlbum, nameBand, year, review, estimation, favorite, link})

            if(tracks){
                tracks = JSON.parse(tracks)
                tracks.forEach((item, index)=>
                    Track.create({
                        order: item.order,
                        nameTrack: item.nameTrack,
                        estimation: item.estimation,
                        albumId: album.id,
                        link: item.link
                    })
                )
            }

            return res.json(album)
        } catch (error) {
            next(error)
        }
    }

    async getOne(req, res, next){
        const {id} = req.params
        const album = await Album.findOne(
            {
                where:{id},
                include:[{model: Track, as: 'tracks'}]
            }
        )
        return res.json(album)
    }

    async getPage(req, res) {
        let { page, limit, filters } = req.query;
        filters = filters ? JSON.parse(filters) : {};
        page = page || 1;
        limit = limit || 4;
        let offset = page * limit - limit;
        let albums;
    
        const whereClause = {};
    
        if (filters.yearA) {
            whereClause.year = { [Op.gt]: filters.yearA - 1 };
        }
    
        if (filters.yearB) {
            if (whereClause.year) {
                whereClause.year[Op.lt] = Number(filters.yearB) + 1;
            } else {
                whereClause.year = { [Op.lt]: Number(filters.yearB) + 1 };
            }
        }
    
        if (filters.nameBand) {
            whereClause.nameBand = { [Op.like]: `%${filters.nameBand}%` };
        }
    
        if (filters.nameAlbum) {
            whereClause.nameAlbum = { [Op.like]: `%${filters.nameAlbum}%` };
        }
    
        if (filters.estimation) {
            whereClause.estimation = filters.estimation;
        }
    
        if (filters.favorite) {
            whereClause.favorite = filters.favorite;
        }
    
        let order = [['id', 'ASC']]; // Default order by ID
    
        if (filters.sortYear) {
            if (filters.sortYear === 'asc') {
                order = [['year', 'ASC']];
            } else if (filters.sortYear === 'desc') {
                order = [['year', 'DESC']];
            }
        }
    
        albums = await Album.findAndCountAll({
            where: whereClause,
            order: order,
            limit,
            offset
        });
    
        return res.json(albums);
    }    

    async delete(req, res, next) {
        const { id } = req.params;
        
        try {
            const album = await Album.findByPk(id);
    
            if (!album) {
                throw ApiError.badRequest("Album not found");
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
    
            return res.json({ message: 'Album deleted successfully' });
        } catch (error) {
            next(error);
        }
    }       

    async update(req, res, next) {
        const { id } = req.params;
        let cover = null;
        if(req.files){ cover = req.files.cover }
        let { nameAlbum, nameBand, year, review, estimation, favorite, tracks, link } = req.body;
        try {
            const album = await Album.findByPk(id);
            
            if (!album) {
                throw ApiError.badRequest("Album Not Found!");
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
                const fileName = uuid.v4() + ".jpg";
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
                        link: item.link
                    });
                });
            }
            
            return res.json(album);
        } catch (error) {
            next(error); // Передаем ошибку в middleware обработки ошибок
        }
    }    
}

module.exports = new AlbumController();