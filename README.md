NgDexie
=======

Angular wrapper around the DexieJS library

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
