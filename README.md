#NgDexie#

Angular wrapper around the DexieJS library.

##Bower##

You can use bower to install NgDexie which will also install the latest Dexie
```
bower install ng-dexie --save
```

This documentation is not yet complete and can only be used as guides to get started.

You need to insert the DexieJS libraries into your app.<br/>
DexieJS: https://github.com/dfahlander/Dexie.js

If you want to use the synchronisation part of the library you need to add:
* Dexie.Observable
* Dexie.Syncable


Load ngDexie as this:

```javascript

angular.module('yourApp', ['idb.utils'])
    .run(function ($http, $rootScope, $log, ngDexie) {
            // This function can be used to configure the database and sync
            var configuration = function(db){
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
