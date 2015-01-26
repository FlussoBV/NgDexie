#NgDexie#

##Major refactoring in v0.0.8, not compatible with older releases!##
##!!Documentation is outdated!!##
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

I hope too update the documentation soon, sorry for the inconvenience!



AngularJS wrapper around the Dexie.js library.

##Bower##

You can use bower to install NgDexie which will also install the latest Dexie
```
bower install ng-dexie --save
```

This documentation is not yet complete and can only be used as guides to get started.

You need to insert the Dexie.js libraries into your app.<br/>
Dexie.js: https://github.com/dfahlander/Dexie.js

If you want to use the synchronisation part of the library you need to add:
* Dexie.Observable
* Dexie.Syncable


Load NgDexie as this:

```javascript

angular.module('yourApp', ['idb.utils'])
    .run(function ($http, $rootScope, $log, ngDexie) {
            // This function can be used to configure the database and sync
            var configuration = function(db){
                // See the Dexie.js site for more information
                db.version(1).stores({
                    mytable: "id", 
                });
                db.on('error', function (err) {
                    // Catch all uncatched DB-related errors and exceptions
                    $log.error("db error", err);
                });
            };
            
            // Initialize :: Dexie
            ngDexie.init("mydatabase", configuration, false).then(function(){
                $log.debug("APPJS :: database open");
            });
    });

```

In your controllers you need to inject NgDexie and then you can use it for various actions:

```javascript
angular.module('yourApp')
    .controller('MyDataCtrl', function($scope, ngDexie) {
            // Function wich will load the data from the database into the scope
            var load = function () {
                ngDexie.list('mytable').then(function(data){
                   $scope.data = data; 
                });
            };

            // Initial load
            load();

            // Watch for changes on our table
            ngDexie.db.on('changes', function (changes) {
                for (var index = 0; index < changes.length; index++) {
                    if (changes[index].table === "mytable") {
                        load();
                        break;
                    }
                }
            });
    });

```
