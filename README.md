#NgDexie#

##Major refactoring in v0.0.8, not compatible with older releases!##

quicknotes:  
* Converter NgDexie to an provider
* idb.utils is changed in ngdexie and ngdexie.sync
* ngDexie.db has been removed
* ngDexie.getDb() introduced which returns an dexie db, but can also run handle a function(db){} as parameter

So now the config of your database is done in the config part of your app.
```
.config(function (ngDexieProvider) {
    ngDexieProvider.setOptions({name: appConfig.database.name, debug: appConfig.database.debug});
        ngDexieProvider.setConfiguration(function (db) {
            db.version(1).stores({
                notes: "++id,title",
            });
            db.on('error', function (err) {
                // Catch all uncatched DB-related errors and exceptions
                console.error("db error err=" + err);
            });
    });
})
```

The documentation has been updated. If you find an error please open an issue.


## QuickStart ##
You can find the [QuickStart here](https://github.com/FlussoBV/NgDexie/wiki/QuickStart)
