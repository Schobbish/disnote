const Discord = require('discord.js');

module.exports = {
    name: 'note',
    description: 'Help function for all note functionality',
    usage: '`!dn note`',
    arguments: 'No additional arguments.',

    execute(message, words) {
        const helpEmbed = {
            embed: {
                title: "!dn note help",
                fields: [
                    {
                        name: "`!dn note help`",
                        value: "Display all commands in the \`note\` family."
                    }, {
                        name: "`!dn note upload`",
                        value: "Add the **attached** document to the notes cloud."
                    }, {
                        name: "`!dn note get <note name>`",
                        value: "Retrieve the notes file named [note Name] for download."
                    }, {
                        name: "`!dn note show all`",
                        value: "Retrieve a list of all notes from the server."
                    }, {
                        name: "`!dn note show date <YYYY-DD-MM>`",
                        value: "Retrieve a list of all notes from the given date."
                    }, {
                        name: "`!dn note delete <note name>`",
                        value: "Delete the specified note. This action cannot be undone."
                    }, {
                        name: "`!dn note delete all`",
                        value: "Delete **ALL** notes on this server. This action cannot be undone."
                    }
                ]
            }
        }
        //  Use index 2 because index 0 will be '!dn' and index 1 will be 'note'
        //  Check the third string in words to see which subroutine to run.
        if(words[2] === undefined){
            message.channel.send(helpEmbed);
            return;
        }
        switch (words[2].toUpperCase()){    //  Set string to upper case to remove case-sensitivity
            case 'HELP':
                message.channel.send(helpEmbed);
                return;
            case 'UPLOAD':
                Upload(message);
                break;
            case 'SHOW':
                if(words[3] == undefined){
                    message.channel.send("Additional arguments expected.");
                    return;
                }
                switch (words[3].toUpperCase()){
                    case 'DATE':
                        SearchDate(message, words);
                        break;
                    case 'ALL':
                        SearchAll(message);
                        break;
                    default:
                        message.channel.send("Undefined argument after `show`.");
                        break;
                }
                break;
            case 'GET':
                SearchName(message, words);
                break;
            case 'DELETE':
                if(words[3] == undefined){
                    message.channel.send("Additional arguments expected.");
                    return;
                }
                switch (words[3].toUpperCase()){
                    case 'ALL':
                        DeleteAll(message);
                        break;
                    case 'NAME':
                        DeleteName(message, words);
                        break;
                    default:
                        message.channel.send("Undefined argument after `delete`.")
                        break;
                }
                break;
            default:
                message.channel.send('Invalid command. Try using `!dn note help` for more information.');
                break;
        }
    }
};

//  BEGIN USER FUNCTIONS

function Upload(message){
    if (message.attachments.size > 0){
        let noteDownloadLink = SaveAttachedNote(message);
        let noteName = GetAttachmentName(message);
        let noteString = ConvertNoteToString(message);
        let author = GetAuthor(message);
        let serverID = GetServerID(message);
        AddNotesToTable(serverID, noteName, noteDownloadLink, noteString, author);
        message.channel.send("Uploaded!");
    }
    else{
        message.channel.send('Attachment expected, none found.');
    }
}

/*function Write(message, words){
//Leave for last
//Give up on this feature
}

function Close(message){
//Leave for last
//Give up on this feature
}*/

/*function Replace(message, words){
//Give up on this functionality
    if (message.attachments.size > 0){

    }
    else{
        message.channel.send('Attachment expected, none found.');
    }
}*/

function SearchName(message, words){
    if(words[3] === undefined){
        message.channel.send("Additional arguments expected, none found.")
        return;
    }

    let fileName = "";
    words.slice(3).forEach(function(word){
        if(word === undefined){
            return;
        }
        fileName += word;
    })

    let serverID = GetServerID(message);
    let async = require('async');

    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function(next){
                    client.query(`SELECT notedownloadlink FROM notes WHERE serverid = ${serverID} AND notename = '${fileName}';`, next);
                },
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }

                let rowStringList = [];
                results.rows.forEach(function(row){
                    rowStringList.push(JSON.stringify(row));
                });

                if(rowStringList.length == 0){
                    message.channel.send(`No notes named '${fileName}' found.`);
                }
                else{
                    //let noteDownloadLink = `Download for '${fileName}': `;
                    let noteDownloadLink = "";
                    rowStringList.forEach(function(row){
                        noteDownloadLink += row.substring(row.indexOf("notedownloadlink\":\"") + 19, row.lastIndexOf("\""));
                    });

                    if(noteDownloadLink.length == 0){
                        noteDownloadLink = "N/A";
                    }
                    //message.channel.send(noteDownloadLink);
                    const fileEmbed = new Discord.MessageEmbed()
                                    .setColor('#34ebb1')
                                    .setTitle(`${fileName}`)
                                    .setDescription("Click above to download")
                                    .setURL(noteDownloadLink)
                                    .setThumbnail("https://cdn.discordapp.com/attachments/802619145065594922/815482214606438421/2Q.png");
                    message.channel.send(fileEmbed);

                }

            });
        });
    }catch(error){
        console.error(error);
    }
}

/*function SearchString(message, words){
    //Give up on this feature
}*/

function SearchDate(message, words){

    if(words[4] === undefined){
        message.channel.send("Additional arguments expected, none found.");
        return;
    }
    let searchDate = words[4];
    var dateReg = /^\d{4}[-]\d{2}[-]\d{2}$/
    if(!searchDate.match(dateReg)){
        message.channel.send("Argument expected to be in YYYY-MM-DD form.");
        return;
    }


    let serverID = GetServerID(message);
    let async = require('async');

    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function(next){
                    client.query(`SELECT notename, author, notecreatedate FROM notes WHERE serverid = ${serverID};`, next);
                },
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }

                let tempRowStringList = [];
                results.rows.forEach(function(row){
                    tempRowStringList.push(JSON.stringify(row));
                });

                let rowStringList = []
                tempRowStringList.forEach(function(row){
                    if(row.substring(row.indexOf("notecreatedate\":\"") + 17, row.lastIndexOf("T")) == searchDate){
                        rowStringList.push(row);
                    }
                });

                if(rowStringList.length != 0){
                    let noteName = "";
                    let authorName = "";
                    let creationDate = "";
                    rowStringList.forEach(function(row){
                        noteName += row.substring(row.indexOf("notename\":\"") + 11, row.indexOf("\",\"author")) + "\n";
                        authorName += row.substring(row.indexOf("author\":\"") + 9, row.indexOf("\",\"notecreatedate")) + "\n";
                        creationDate += row.substring(row.indexOf("notecreatedate\":\"") + 17, row.lastIndexOf("T")) + "\n";
                    });

                    if(noteName.length == 0){
                        noteName = "N/A";
                    }
                    if(authorName.length == 0){
                        authorName = "N/A";
                    }
                    if(creationDate.length == 0){
                        creationDate = "N/A";
                    }

                    let searchEmbed = new Discord.MessageEmbed()
                        .addFields(
                            { name: 'Note Name', value: noteName, inline: true },
                            { name: 'Author', value: authorName, inline: true },
                            { name: 'Creation Date', value: creationDate, inline: true }
                        );
                    message.channel.send(searchEmbed);
                }
                else{
                    message.channel.send(`No notes found on '${searchDate}'`);
                }

            });
        });
    }catch(error){
        console.error(error);
    }
}

function SearchAll(message){
    let serverID = GetServerID(message);
    let async = require('async');

    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function(next){
                    client.query(`SELECT notename, author, notecreatedate FROM notes WHERE serverid = ${serverID};`, next);
                },
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }

                let rowStringList = [];
                results.rows.forEach(function(row){
                    rowStringList.push(JSON.stringify(row));
                });

                let noteName = "";
                let authorName = "";
                let creationDate = "";
                rowStringList.forEach(function(row){
                    noteName += row.substring(row.indexOf("notename\":\"") + 11, row.indexOf("\",\"author")) + "\n";
                    authorName += row.substring(row.indexOf("author\":\"") + 9, row.indexOf("\",\"notecreatedate")) + "\n";
                    creationDate += row.substring(row.indexOf("notecreatedate\":\"") + 17, row.lastIndexOf("T")) + "\n";
                });

                if(noteName.length == 0){
                    noteName = "N/A";
                }
                if(authorName.length == 0){
                    authorName = "N/A";
                }
                if(creationDate.length == 0){
                    creationDate = "N/A";
                }

                let searchEmbed = new Discord.MessageEmbed()
                    .addFields(
                        { name: 'Note Name', value: noteName, inline: true },
                        { name: 'Author', value: authorName, inline: true },
                        { name: 'Creation Date', value: creationDate, inline: true }
                    );
                message.channel.send(searchEmbed);
            });
        });
    }catch(error){
        console.error(error);
    }
}

function DeleteAll(message){
    let serverID = GetServerID(message);
    let async = require('async');

    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function(next){
                    client.query(`DELETE FROM notes WHERE serverid =${serverID};`, next);
                },
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }
            });
        });
    }catch(error){
        console.error(error);
    }
    message.channel.send("All notes for this server deleted!");
}

function DeleteName(message, words){
    if(words[3] === undefined){
        message.channel.send("Name of note to be deleted expected, none found.");
        return;
    }

    let serverID = GetServerID(message);
    let async = require('async');

    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function(next){
                    client.query(`DELETE FROM notes WHERE serverid =${serverID} AND notename ='${words[4]}';`, next);
                },
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }
            });
        });
    }catch(error){
        console.error(error);
    }
    message.channel.send(`'${words[4]}' note deleted!`);
}

/*function DeleteDate(message, words){
//Give up on this functionality
    if(words[4] === undefined){
        message.channel.send("Additional arguments expected, none found.");
        return;
    }
    let searchDate = words[4];
    var dateReg = /^\d{4}[-]\d{2}[-]\d{2}$/
    if(!searchDate.match(dateReg)){
        message.channel.send("Argument expected to be in YYYY-MM-DD form.");
        return;
    }


    let serverID = GetServerID(message);
    let async = require('async');

    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function(next){
                    client.query(`SELECT notesid, notecreatedate FROM notes WHERE serverid = ${serverID};`, next);
                },
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }

                let tempRowStringList = [];
                results.rows.forEach(function(row){
                    tempRowStringList.push(JSON.stringify(row));
                });

                let rowStringList = []
                tempRowStringList.forEach(function(row){
                    if(row.substring(row.indexOf("notecreatedate\":\"") + 17, row.lastIndexOf("T")) == searchDate){
                        rowStringList.push(row);
                    }
                });
                let deleteID = "";
                if(rowStringList.length != 0){
                    rowStringList.forEach(function(row){
                        deleteID = row.substring(row.indexOf("notesid\":\"")+10, row.indexOf("notesid\":\"")+28);
                        client.query(`DELETE * from notes WHERE serverid = ${serverID} AND notesid = ${deleteID}`)
                    });
                message.channel.send(`All notes from ${searchDate} have been deleted!`);
                }
                else{
                    message.channel.send(`No notes found on '${searchDate}'`);
                }

            });
        });
    }catch(error){
        console.error(error);
    }
}*/

//  END USER FUNCTIONS

//  BEGIN BACKEND FUNCTIONS
function SaveAttachedNote(message, words){
    //Save the attached note from message
    //Return the directory address the file was saved to

    //Return the download link for the file
    var fs = require('fs');
    var https = require('https');
    let data = message.attachments.first().attachment.toString();

    return data;
}

function DownloadFromLink(link){
    var fs = require('fs');
    var path = require('path');
    var https = require('https');

    let filename = path.basename(link);
    let file = fs.createWriteStream(filename);
    let request = https.get(link, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            });
        file.on('error', function(err) {
            fs.unlink(filename);
            console.error(err);
            });
        });
    return file;
}
function download(url){
    //Give up on this feature
    let request = require(`request`);
    var fs = require('fs');
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream('../text.txt'));
}

function ConvertNoteToString(message){
    //Give up on this feature
    //Convert the attached note from the message to a string and return it
    var fs = require('fs');
//    var https = require('https');
    //let file = message.attachments.first();


    download(message.attachments.first().url);
    console.log("Hello world");
    console.log(fs.readFileSync("../text.txt").toString('utf-8'));
    return fs.readFileSync("../text.txt");


    //let data = message.attachments.first().attachment.toString();
    //message.channel.send(data);

//    const path = require("path");
//    const https = require("https");

//    console.log("Break1");

//    let download = DownloadFromLink(data);

//    console.log("Break4");
//    console.log(download);
//    console.log("Break5");
//    console.log(fs.readFileSync(path.basename(data)));
//    console.log("Break6");

    //function(data) {
    //    error.log("Break2");
    //    let filename = path.basename(data);
    //    let file = fs.createWriteStream(filename);
    //    let request = https.get(data, function(response) {
    //        response.pipe(file);
    //        file.on('finish', function() {
    //            file.close();
    //            });
    //        file.on('error', function(err) {
    //            fs.unlink(filename);
    //            console.error(err);
    //            });
    //        });
    //    error.log("Break3");
    //    message.channel.send(fs.readFileSync(file));
    //    message.channel.send("hello");
    //    };


//    fs.readFile(file, (err, data) => {
//        message.channel.send(data);
//        return data;
//    });

//    let data = "";
//    https.get(file.attachment, (res) => {
//        res.on('data', (d) => {
//            data = d;
//        });

//    }).on('error', (e) => {
//        console.error(e);
//    });
//    console.log(data);
    //return data;
}


function GetCockroachPool(){
    var fs = require('fs');
    var pg = require('pg');

    // Connect to the "NotesDB" database.
    var config = {
        user: 'DisNote',
        host: 'localhost',
        database: 'notesdb',
        port: 26257,
        ssl: {
            ca: fs.readFileSync('certs/ca.crt').toString(),
            key: fs.readFileSync('certs/client.DisNote.key').toString(),
            cert: fs.readFileSync('certs/client.DisNote.crt').toString()
        }
    };

    var pool = new pg.Pool(config);

    return pool;
}

function AddNotesToTable(serverID, noteName, noteDownloadLink, noteString, author){
    let async = require('async');
    //Save notes to SQL table
    sqlPool = GetCockroachPool();
    try{
        sqlPool.connect(function (err, client, done){

            var finish = function () {
                done();
            };
            if (err) {
                console.error('could not connect to cockroachdb', err);
            }

            async.waterfall([
                function (next){

                    /*CREATE TABLE Notes (*/
                    /*    ServerID bigint NOT NULL, /*Discord generates unique 8-byte server ID's, bigint will store them*/
                    /*    NotesID int DEFAULT unique_rowid() PRIMARY KEY,*/
                    /*    NoteName varchar NOT NULL,*/
                    /*    NoteDownloadLink varchar NOT NULL,*/
                    /*    NoteString varchar NOT NULL,*/
                    /*    NoteCreateDate TIMESTAMP DEFAULT now(),*/
                    /*    Author varchar NOT NULL,*/
                    /*    NoteEditDate TIMESTAMP NULL, /*allowed to hold null values because not all notes have been edited*/
                    /*    EditAuthor varchar NULL /*Holds the name of the person who most recently edited the note*/
                    /*);*/
                    client.query('CREATE TABLE IF NOT EXISTS notes (serverid bigint NOT NULL, NotesID int DEFAULT unique_rowid() PRIMARY KEY, NoteName varchar NOT NULL, NoteDownloadLink varchar NOT NULL, NoteString varchar NOT NULL, NoteCreateDate TIMESTAMP DEFAULT now(), Author varchar NOT NULL, NoteEditDate TIMESTAMP NULL, EditAuthor varchar NULL);', next);
                },
                function(results, next){
                    //Add notes row with data
                    let queryStr = `INSERT INTO Notes (ServerID, NoteName, NoteDownloadLink, NoteString, Author) VALUES (${serverID}, '${noteName}', '${noteDownloadLink}', '${noteString}', '${author}');`;
                    client.query(queryStr, next);
                }
            ],
            function (err, results){
                if(err){
                    console.error('Error inserting into table', err);
                }
            });
        });
    } catch(error){
        console.error(error);
    }
}

function GetAuthor(message){
    return message.author.username;
}

function GetAttachmentName(message){
    return message.attachments.first().name;
}

function GetServerID(message){
    return message.guild.id;
}

//  END BACKEND FUNCTIONS
