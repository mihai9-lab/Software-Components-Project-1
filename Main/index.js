const mfdb = require('multi-format-db');
// const JsonDriver = require('db-json');
// const YamlDriver = require('db-yaml');
// const CypmiDriver = require('db-cpymi');
const readline = require('readline');

sleep = (ms) => {
    // ms = 0;
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const addDatabase = async (type, name, location, autoId, maxEntitiesPerFile) => {
    console.log(
        `Adding driver ${type} to MultiFormatDBClient, with name ${name}, located at ${location}, with autoId ${autoId}, and maxEntitiesPerFile ${maxEntitiesPerFile}`
    );
    let DB = require(type);
    mfdb.addDB(name, new DB(location, autoId, maxEntitiesPerFile));
    await sleep(1000);
};
const switchDatabase = async (name) => {
    console.log(`Switching to database with name ${name}`);
    mfdb.switchDB(name);
    await sleep(1000);
};
const insertInDb = async (key, object, id) => {
    console.log(`Adding object to key ${key}\n `, 'Object: ', JSON.stringify(object, null, 4));
    if (id != undefined) {
        console.log('Id value: ', id);
    }
    mfdb.insert(key, object, id);
    await sleep(1000);
};
const main = async () => {
    await addDatabase('db-json', 'json', './json', true, -1);
    await addDatabase('db-yaml', 'yaml', './yaml', true, -1);
    await addDatabase('db-json', 'json2', './json2', true, 10);
    await addDatabase('db-cpymi', 'cpymi', './cpymi', true, 20);
    await switchDatabase('json');
    await insertInDb('student', {
        name: 'Jon',
        lastname: 'Snow',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'James',
            lastname: 'Smith'
        }
    });
    await insertInDb('student', {
        name: 'Jonn',
        lastname: 'Snoww',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'Jamess',
            lastname: 'Smithh'
        }
    });
    await insertInDb('student2', {
        name: 'Joney',
        lastname: 'Snowey',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'Jamesey',
            lastname: 'Smithey'
        }
    });
    await insertInDb('student2', {
        name: 'Name',
        lastname: 'LastName',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'James',
            lastname: 'Smith'
        }
    });

    await switchDatabase('yaml');
    await insertInDb('student', {
        name: 'Jon',
        lastname: 'Snow',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'James',
            lastname: 'Smith'
        }
    });
    await insertInDb('student', {
        name: 'Jonn',
        lastname: 'Snoww',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'Jamess',
            lastname: 'Smithh'
        }
    });
    await insertInDb('student2', {
        name: 'Joney',
        lastname: 'Snowey',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'Jamesey',
            lastname: 'Smithey'
        }
    });
    await insertInDb('student2', {
        name: 'Name',
        lastname: 'LastName',
        classes: ['Math', 'Statistics', 'History'],
        friend: {
            name: 'James',
            lastname: 'Smith'
        }
    });

    await switchDatabase('cpymi');
    await insertInDb(
        'student',
        {
            name: 'Jon',
            lastname: 'Snow',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'James',
                lastname: 'Smith'
            }
        },
        10
    );
    await insertInDb(
        'student',
        {
            name: 'Jonn',
            lastname: 'Snoww',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'Jamess',
                lastname: 'Smithh'
            }
        },
        'keyyy'
    );
    await insertInDb(
        'student2',
        {
            name: 'Joney',
            lastname: 'Snowey',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'Jamesey',
                lastname: 'Smithey'
            }
        },
        'lie'
    );
    await insertInDb(
        'student2',
        {
            name: 'Name',
            lastname: 'LastName',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'James',
                lastname: 'Smith'
            }
        },
        'kakak'
    );

    await switchDatabase('json2');
    await insertInDb(
        'student',
        {
            name: 'Jon',
            lastname: 'Snow',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'James',
                lastname: 'Smith'
            }
        },
        1
    );
    await insertInDb(
        'student',
        {
            name: 'Jonn',
            lastname: 'Snoww',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'Jamess',
                lastname: 'Smithh'
            }
        },
        5
    );
    await insertInDb(
        'student2',
        {
            name: 'Joney',
            lastname: 'Snowey',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'Jamesey',
                lastname: 'Smithey'
            }
        },
        8
    );
    await insertInDb(
        'student2',
        {
            name: 'Name',
            lastname: 'LastName',
            classes: ['Math', 'Statistics', 'History'],
            friend: {
                name: 'James',
                lastname: 'Smith'
            }
        },
        3
    );

    await switchDatabase('json');
    console.log(
        'Finding everything in database and sorting by student by name first in ASC, then by lastname in DESC, and student2 by classes first, and then by lastname'
    );
    console.log(
        JSON.stringify(
            mfdb.find(
                { student: {}, student2: {} },
                {
                    student: [
                        { field: 'name', order: 1 },
                        { field: 'lastname', order: -1 }
                    ],
                    student2: [
                        { field: 'classes', order: 1 },
                        { field: 'lastname', order: -1 }
                    ]
                }
            ),
            null,
            4
        )
    );
    await sleep(1000);
    await switchDatabase('cpymi');
    console.log('Finding everything by key');
    console.log(JSON.stringify(mfdb.findByKey('student'), null, 4));
    await sleep(1000);
    await switchDatabase('yaml');
    console.log('Find entity with id 1');
    console.log(JSON.stringify(mfdb.findById('1'), null, 4));

    console.log('Remove whole yaml database');
    mfdb.findAndRemove({ student: {}, student2: {} });
    await sleep(1000);
    console.log('Find everything in yaml db');
    console.log(mfdb.find({ student: {}, student2: {} }));
    await sleep(1000);
    await switchDatabase('json2');
    console.log('Removing everything with key student2 from json2 db');
    mfdb.findByKeyAndRemove('student2');
    await sleep(1000);
    console.log("json2 db find student2's");
    console.log(JSON.stringify(mfdb.findByKey('student2'), null, 4));
    await sleep(1000);

    await switchDatabase('json');

    console.log('Updatading id 1 in json db');
    mfdb.update(1, 'newKey', ['new', 'array', 'of', { values: '1' }]);
    await sleep(1000);
    console.log('json db entity with id 1');
    console.log(JSON.stringify(mfdb.findById(1), null, 4));
    await sleep(1000);

    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.question('Press any key to exit\n', () => {
        rl.close();
    });
};

main();
