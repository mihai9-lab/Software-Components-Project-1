const DatabaseInterface = require('multi-format-db/interfaces/db_interface');
const fs = require('fs');
const path = require('path');
class DatabaseJSON extends DatabaseInterface {
    constructor(location, autoId = true, maxEntitiesPerFile = -1) {
        super(location, autoId, maxEntitiesPerFile);

        this.initialConfig('json');
    }

    writeData = (location, filename, data) => {
        fs.writeFileSync(path.join(location, filename), JSON.stringify(data));
    };
    readData = (location, filename) => {
        return JSON.parse(fs.readFileSync(path.join(location, filename)));
    };
}

module.exports = DatabaseJSON;
