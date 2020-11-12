const fs = require('fs');
const path = require('path');

/**
 * A general driver interface that drivers should implement, as well as 2 methods
 * writeData(location,filename,data) that saves data(which is object) to "location/filename"
 * readData(location,filename) that reads data from "location/filename" and returns it as object
 *
 * @class
 */
class DatabaseInterface {
    /**
     * @constructor
     * @param {string} location='./'  relative or absolute path to FOLDER where database should be saved. One folder per database
     * @param {boolean} autoId=false  weather id's should be assigned automatically or personally
     * @param {number} maxEntitiesPerFile=-1  number of entities with id's per file, if -1 everythign will be saved in single file
     */
    constructor(location = './', autoId, maxEntitiesPerFile) {
        this.location = location;
        this.idSet = new Set();
        this.config = {
            autoId: autoId,
            maxEntitiesPerFile: maxEntitiesPerFile
        };

        try {
            this.readConfig();
        } catch (err) {
            this.config.files = [];
            this.config.maxId = 0;
            this.writeConfig();
        }
    }

    /**
     * Writes config data to config.json
     * @function
     */
    writeConfig = () => {
        let configpath = path.join(this.location, 'config.json');
        this.ensureDirectoryExistence(configpath);
        fs.writeFileSync(configpath, JSON.stringify(this.config));
    };
    /**
     * Reads config data from config.json
     * @function
     */
    readConfig = () => {
        this.file = JSON.parse(fs.readFileSync(path.join(this.location, 'config.json')));
    };

    /**
     * Initial configuration every driver should fire in constructor,
     * Enables changing of constructor parameters on autoid and maxEntitiesPerFile on different runs
     * @function
     */
    initialConfig = (ext) => {
        this.ext = ext;
        if (this.file !== undefined) {
            let tmpcnf = this.config;
            this.config = this.file;
            let data = this.load();
            this.removeFiles(this.location, this.config.files);
            let maxInt = 0;
            for (const key in data) {
                data[key].forEach((val) => {
                    if (Number.isInteger(val._id)) {
                        if (maxInt < val._id) {
                            maxInt = val._id;
                        }
                    }
                    this.idSet.add(val._id);
                });
            }
            tmpcnf.maxId = maxInt;
            tmpcnf.files = [];
            this.config = tmpcnf;
            this.save(data);
        } else {
            this.save({});
        }
    };

    removeFiles = (location, files) => {
        let len = files.length;
        for (let i = 0; i < len; i++) {
            fs.unlinkSync(path.join(location, files[i]));
        }
    };
    /**
     * Check if id is auto generated or not
     * @function
     * @returns {boolean}
     */
    isAutoId = () => {
        return this.config.autoId;
    };

    /**
     * Check if id is free
     * @function
     * @param {number|string} _id Checks if this id is free for use, ie. isnt' already used
     * @param {boolean} takeKey If it should be marked as used if free
     */
    isIdFree = (_id, takeKey) => {
        if (this.idSet.has(_id)) {
            return false;
        } else {
            if (takeKey) {
                this.idSet.add(_id);
            }
            return true;
        }
    };

    /**
     * Gets next id
     * @function
     * @returns {number}
     */
    getId = () => {
        this.config.maxId++;
        return this.config.maxId;
    };

    randomString = (length, ext) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result + '.' + ext;
    };
    ensureDirectoryExistence = (filePath) => {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        fs.mkdirSync(dirname, { recursive: true });
    };

    /**
     * Loads data from file/files
     * @function
     */
    load = () => {
        let data = {};
        if (this.config.maxEntitiesPerFile !== -1) {
            this.config.files.forEach((loc) => {
                let tmpdata = this.readData(this.location, loc);
                for (let key in tmpdata) {
                    if (data[key] === undefined) {
                        data[key] = [];
                    }
                    tmpdata[key].forEach((val) => {
                        data[key].push(val);
                    });
                }
            });
        } else {
            data = this.readData(this.location, this.config.files[0]);
        }
        return data;
    };

    /**
     * Saves data to file/files
     * @param {object} data
     */
    save = (data) => {
        if (this.config.maxEntitiesPerFile !== -1 && Object.keys(data).length > 0) {
            let cur = 0;
            let curFile = 0;
            let newFiles = [];
            let tmp = {};
            for (let key in data) {
                tmp[key] = [];
                data[key].forEach((val) => {
                    tmp[key].push(val);
                    cur++;
                    if (cur === this.config.maxEntitiesPerFile) {
                        let loc = this.config.files[curFile];
                        if (loc === undefined) {
                            loc = this.randomString(10, this.ext);
                        }
                        this.writeData(this.location, loc, tmp);
                        newFiles.push(loc);
                        curFile++;
                        tmp = {};
                        tmp[key] = [];
                        cur = 0;
                    }
                });
            }
            let loc = this.config.files[curFile];
            if (loc === undefined) {
                loc = this.randomString(10, this.ext);
            }
            this.writeData(this.location, loc, tmp);
            newFiles.push(loc);
            this.config.files.forEach((file) => {
                if (!newFiles.includes(file)) {
                    this.removeFiles(this.location, [file]);
                }
            });
            this.config.files = newFiles;
        } else {
            let loc = this.config.files[0];
            if (loc === undefined) {
                loc = this.randomString(10, this.ext);
            }
            this.writeData(this.location, loc, data);
            this.config.files = [loc];
        }
        this.writeConfig();
    };
}

module.exports = DatabaseInterface;
