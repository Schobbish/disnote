# DisNote
Discord bot made for HackUTD VII - Won Best Use of CockroachDB

You'll need to run `cp -r data_template data` (and `npm i` of course) before running.

Also need to [install](https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html) and [setup](https://www.cockroachlabs.com/docs/v20.2/secure-a-cluster) CockroachDB. During setup you'll only need to start up one node. Get a node running then run these commands on the thing:

```sql
CREATE USER IF NOT EXISTS disnote;
CREATE DATABASE notesdb;
GRANT ALL ON DATABASE notesdb TO disnote;
USE notesdb;

CREATE TABLE public.notes (
  serverid INT8 NOT NULL,
  notesid INT8 NOT NULL DEFAULT unique_rowid(),
  notename VARCHAR NOT NULL,
  notedownloadlink VARCHAR NOT NULL,
  notestring VARCHAR NOT NULL,
  notecreatedate TIMESTAMP NULL DEFAULT now():::TIMESTAMP,
  author VARCHAR NOT NULL,
  noteeditdate TIMESTAMP NULL,
  editauthor VARCHAR NULL,
  CONSTRAINT "primary" PRIMARY KEY (notesid ASC),
  FAMILY "primary" (serverid, notesid, notename, notedownloadlink, notestring, notecreatedate, author, noteeditdate, editauthor)
);
```

Also run `cockroach cert create-client disnote --certs-dir=certs --ca-key=my-safe-directory/ca.key` to generate key for the `disnote` user.

Finally, you'll also need a bot token, which gets stored in `./bot-token.json` like this (not a real token obviously):
```json
{
    "Token": "BxXT4POmXL66NqmZ2RbZL4zZ.JjcOSK.DPSJIC881NeBfT5Be8jwantu5A7"
}
```

Then run `node index.js` to start the bot.

