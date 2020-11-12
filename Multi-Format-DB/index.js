const findHelper = require('./helpers/findHelper');
const { isParamObject, getType } = require('./helpers/objHelper');
/**
 * A general client that consumes drivers that work with different databses
 * Singleton
 * @class
 */
class MultiFormatDB {
    drivers = {};
    currentDriver = undefined;
    /**
     * Empty constructor
     * @constructor
     */
    constructor() {}

    /**
     * Add database driver
     * @function
     * @param {string} driverName
     * @param {DatabaseInterface} driver
     */
    addDB = (driverName, driver) => {
        this.drivers[driverName] = driver;
        if (this.currentDriver === undefined) this.currentDriver = driverName;
    };

    /**
     * Switch to a different driver
     * @function
     * @param {string} driverName
     * @throws If driverName doesn't exist
     */
    switchDB = (driverName) => {
        if (this.drivers[driverName] === undefined) {
            throw new Error(`Database with name ${driverName} does not exist`);
        }
        this.currentDriver = driverName;
    };

    /**
     * Safety function to check if maybe a driver isn't selected,
     * @function
     * @throws If no databases have been added
     * @returns {DatabaseInterface|Error}
     */
    checkIfDbSelectedAndRetDb = () => {
        if (this.currentDriver === undefined) {
            throw new Error(`No databases have been added`);
        }
        return this.drivers[this.currentDriver];
    };

    /**
     * Insert into database
     * @function
     * @param {string} key | Outer selector in database, describing part of database ie. all Students
     * @param {object} object | Object we wish to insert into that part of database ie. Student
     * @param {number|string} [_id] | If autoId is set to false, this must be passed to set id of object we're inserting
     * @throws If id is taken
     * @returns {True}
     */
    insert = (key, object, _id = false) => {
        if (typeof key !== 'string') {
            throw new Error('Param "key" should be of type String');
        }
        isParamObject(object, 1);
        let db = this.checkIfDbSelectedAndRetDb();
        let data = db.load();
        let autoId = db.isAutoId();
        let id;
        if (autoId) {
            id = db.getId();
        } else {
            if (db.isIdFree(_id, true)) {
                id = _id;
            } else {
                throw new Error(`Key with id:"${_id}" already taken`);
            }
        }
        object = {
            ...object,
            _id: id
        };
        if (data[key] === undefined) {
            data[key] = [];
        }
        data[key].push(object);
        db.save(data);
        return true;
    };
    /**
     * Update entity already in database
     * @function
     * @param {number|string} id | Id of entity we're trying to update
     * @param {string} keyy | key value that's going to be added to object if it's found
     * @param {object|number|string|array} value | value that's going to be value of key that's going to be added
     * @throws If keyy isn't string
     * @returns {true|false} | If added or not, respectively
     */
    update = (id, keyy, value) => {
        if (value === undefined) {
            throw new Error('Param 3 doesnt have value');
        }
        if (typeof keyy !== 'string') throw new Error('Param "key" should be of type String');
        let db = this.checkIfDbSelectedAndRetDb();
        let data = db.load();
        for (let key in data) {
            let len = data[key].length;

            for (let i = 0; i < len; i++) {
                if (data[key][i]._id === id) {
                    data[key][i][keyy] = value;
                    db.save(data);
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Find something in database
     * @function
     * @param {object} obj
     * @param {object} [sort]
     * @example obj = {student:{name:'Jack',lastname:'Jacko'},teacher:{name:'Lilly',classes:['Math','English'],info:{something:'aa',somethingelse:'bb'}}}
     * @example <caption>There are basically 2 parameters here, student, and teacher. Let's assume they are in the outer part of database.
     *  Function will search once in students, for any amount of students matching both name and lastname,
     * and once in teachers, for any amount of studnets matching name, EXACT classes(because array),and info object matchin somethign and somethingelse</caption>
     * @example <caption>sort = {student:[{field:'name',order:-1},{field:'lastname',order:1}],teachers:[{field:'name',order:1}]}
     * Will sort students first by name, in DESC order, then if equal, by lastname in ASC order
     * Will sort teachers by name in ASC order</caption>
     * @example <caption>Returns object with student and teacher as keys, that contain an array of students and teachers maching description</caption>
     * @returns {object}
     * @throws If obj is not object
     */
    find = (obj, sort = undefined) => {
        isParamObject(obj);
        let data = this.checkIfDbSelectedAndRetDb().load();
        let found = {};
        for (let key in obj) {
            if (data[key] === undefined) {
                continue;
            }

            found[key] = [];
            data[key].forEach((value) => {
                if (findHelper.findByVal(value, obj[key])) {
                    found[key].push(value);
                }
            });
        }
        try {
            if (sort !== undefined) {
                for (let key in sort) {
                    let len = sort[key].length;
                    let params = [];
                    let order = [];
                    for (let i = 0; i < len; i++) {
                        params.push(sort[key][i].field.split('.'));
                        order.push(sort[key][i].order);
                    }
                    if (found[key] === undefined) {
                        continue;
                    }
                    found[key].sort((a, b) => {
                        let aa = a;
                        let bb = b;
                        for (let i = 0; i < len; i++) {
                            let llen = params[i].length;
                            a = aa;
                            b = bb;
                            for (let j = 0; j < llen; j++) {
                                if (a[params[i][j]]) {
                                    a = a[params[i][j]];
                                } else return 1;
                                if (b[params[i][j]]) {
                                    b = b[params[i][j]];
                                } else return -1;
                            }
                            if (order[i] === 1) {
                                if (a < b) {
                                    return -1;
                                } else if (a > b) {
                                    return 1;
                                }
                            } else if (order[i] === -1) {
                                if (a < b) {
                                    return 1;
                                } else if (a > b) {
                                    return -1;
                                }
                            } else {
                                throw new Error('Wrong order param');
                            }
                        }
                        return 0;
                    });
                }
            }
        } catch (err) {
            throw new Error('Something went wrong in sort, check parameters');
        }
        return found;
    };

    /**
     * Finds every element with {key} as key
     * @function
     * @param {string} key | Key in outer part
     * @param {array} sort
     * @example key = 'student'
     * @example sort = [{field:'name',order:-1},{field:'lastname',order:1}]
     * @returns {array}
     */
    findByKey = (key, sort = undefined) => {
        if (typeof key !== 'string') {
            throw new Error('Param "key" should be of type String');
        }
        let data = this.checkIfDbSelectedAndRetDb().load();
        let found = [];
        if (data[key] !== undefined) {
            found = data[key];
        }
        try {
            if (sort !== undefined && found.length > 0) {
                let len = sort.length;
                let params = [];
                let order = [];
                for (let i = 0; i < len; i++) {
                    params.push(sort[i].field.split('.'));
                    order.push(sort[i].order);
                }
                found.sort((a, b) => {
                    let aa = a;
                    let bb = b;
                    for (let i = 0; i < len; i++) {
                        let llen = params[i].length;
                        a = aa;
                        b = bb;
                        for (let j = 0; j < llen; j++) {
                            if (a[params[i][j]]) {
                                a = a[params[i][j]];
                            } else return 1;
                            if (b[params[i][j]]) {
                                b = b[params[i][j]];
                            } else return -1;
                        }
                        if (order[i] === 1) {
                            if (a < b) {
                                return -1;
                            } else if (a > b) {
                                return 1;
                            }
                        } else if (order[i] === -1) {
                            if (a < b) {
                                return 1;
                            } else if (a > b) {
                                return -1;
                            }
                        } else {
                            throw new Error('Wrong order param');
                        }
                    }
                    return 0;
                });
            }
        } catch (err) {
            throw new Error('Something went wrong in sort, check parameters');
        }
        return found;
    };

    /**
     * Finds single element by id
     * @function
     * @param {number|string} id | Unique id of entity
     * @returns {object}
     */
    findById = (id) => {
        let data = this.checkIfDbSelectedAndRetDb().load();
        for (let key in data) {
            let len = data[key].length;

            for (let i = 0; i < len; i++) {
                if (data[key][i]._id === id) {
                    return data[key][i];
                }
            }
        }
        return false;
    };

    /**
     *
     * Finds any number of elements and removes them
     * @function
     * @param {object} obj | same type of object as one in find function
     * @returns {true|false} If removed at least a single element or none, respectively
     * @throws If obj isnt object
     */
    findAndRemove = (obj) => {
        isParamObject(obj);
        let db = this.checkIfDbSelectedAndRetDb();
        let data = db.load();
        let didRemove = false;
        for (let key in obj) {
            if (data[key] === undefined) {
                continue;
            }
            let newArr = data[key];
            let len = data[key].length;
            for (let i = len - 1; i >= 0; i--) {
                if (findHelper.findByVal(data[key][i], obj[key])) {
                    newArr.splice(i, 1);
                    didRemove = true;
                }
            }
            data[key] = newArr;
        }
        db.save(data);
        return didRemove;
    };

    /**
     * Removes all elements that have {key} as key
     * @function
     * @param {string} key | Same as in findByKey
     * @throws If key isnt string
     * @returns {true|false} If elements deleted or not,respectively
     */
    findByKeyAndRemove = (key) => {
        if (typeof key !== 'string') {
            throw new Error('Param "key" should be of type String');
        }
        let db = this.checkIfDbSelectedAndRetDb();
        let data = db.load();

        if (data[key] !== undefined) {
            data[key] = [];
            db.save(data);
            return true;
        }
        return false;
    };

    /**
     * Removes single
     * @function
     * @param {number|string} id Unique id of entity
     * @returns {true|false} if object with id exist and was removed or not
     */
    findByIdAndRemove = (id) => {
        let db = this.checkIfDbSelectedAndRetDb();
        let data = db.load();
        for (let key in data) {
            let len = data[key].length;

            for (let i = 0; i < len; i++) {
                if (data[key][i]._id === id) {
                    data[key] = data[key].splice(i, 1);
                    db.save(data);
                    return true;
                }
            }
        }
        return false;
    };
}

module.exports = new MultiFormatDB();
