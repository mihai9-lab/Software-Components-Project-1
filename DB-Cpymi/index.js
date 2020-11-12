const DatabaseInterface = require('multi-format-db/interfaces/db_interface');
const fs = require('fs');
const path = require('path');
const cypmi = require('./cpymi');

class DatabaseJSON extends DatabaseInterface {
    constructor(location, autoId = true, maxEntitiesPerFile = -1) {
        super(location, autoId, maxEntitiesPerFile);

        this.initialConfig('cypmi');
    }

    writeData = (location, filename, data) => {
        fs.writeFileSync(path.join(location, filename), cypmi.stringify(data));
    };
    readData = (location, filename) => {
        return cypmi.parse(fs.readFileSync(path.join(location, filename),'utf-8'));
    };
}
module.exports = DatabaseJSON;
