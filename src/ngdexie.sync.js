(function () {
    'use strict';

    /**
     * Create ngdexie.sync module
     */
    angular.module('ngdexie.sync', ['ngdexie.core']);

    /**
     * Create ngDexieUtils factory
     */
    angular.module('ngdexie.sync')
            .factory('ngDexieSync', ngDexieSync);

    ngDexieSync.$inject = ['$log', '$rootScope', '$q', 'ngDexie'];

    function ngDexieSync($log, $rootScope, $q, ngDexie) {
        if (ngDexie.getDb().syncable) {
            ngDexie.getDb().syncable.on('statusChanged', function (newStatus, url) {
                $rootScope.$apply(function () {
                    $rootScope.$broadcast("ngDexieStatusChanged", {status: newStatus, statusText: Dexie.Syncable.StatusTexts[newStatus], url: url});
                });
            });
        }

        return {
            resync: resync,
            unsyncedChanges: unsyncedChanges
        };


        /**
         * Resync the database
         * @param {type} url
         * @param {type} storeNames
         * @returns {undefined}
         */
        function resync(url, storeNames) {
            var db = ngDexie.getDb();

            if (!angular.isArray(storeNames)) {
                storeNames = [storeNames];
            }

            // Disconnect the synchronisation database
            db.syncable.disconnect(url).then(function () {
                var dbTables = [];
                angular.forEach(storeNames, function (storeName) {
                    dbTables.push(db.table(storeName));
                });

                db.transaction("rw", dbTables, function () {
                    // Clear storenames
                    angular.forEach(dbTables, function (dbTable) {
                        dbTable.clear();
                    });
                }).then(function () {
                    return db.syncable.delete(url).then(function () {
                        setTimeout(function () {
                            db.syncable.connect("iSyncRestProtocol", url);
                        }, 1500);
                    });
                });
            });
        }

        /**
         * Check if there are synchronisation changes
         * @param {type} url
         * @returns {undefined}
         */
        function unsyncedChanges(url) {
            var deferred = $q.defer();

            var db = ngDexie.getDb();
            if (angular.isDefined(db) && db.isOpen()) {
                db.syncable.unsyncedChanges(url).then(function (data) {
                    deferred.resolve(data);
                });
            }

            return deferred.promise;
        }
    }
})();