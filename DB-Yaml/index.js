const DatabaseInterface = require('multi-format-db/interfaces/db_interface');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
class DatabaseYAML extends DatabaseInterface {
    constructor(location, autoId = true, maxEntitiesPerFile = -1) {
        super(location, autoId, maxEntitiesPerFile);

        this.initialConfig('yaml');
    }

    writeData = (location, filename, data) => {
        fs.writeFileSync(
            path.join(location, filename),
            yaml.safeDump(data, {
                schema: yaml.JSON_SCHEMA
            })
        );
    };
    readData = (location, filename) => {
        return yaml.safeLoad(fs.readFileSync(path.join(location, filename)), {
            schema: yaml.JSON_SCHEMA,
            json: true
        });
    };
    
}

module.exports = DatabaseYAML;
