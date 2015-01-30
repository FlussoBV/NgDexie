/**
 * Angularjs wrapper around Dexie.js an IndexedDB handler
 * @version v0.0.8-dev-2015-01-30
 * @link https://github.com/FlussoBV/NgDexie
 * @license Apache License, see LICENSE file
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'ngDexie';
}

(function () {
    'use strict';
    /**
     * NgDexie is an wrapper around Dexie.js javascript library
     * @version v0.0.8
     * @link https://github.com/FlussoBV/NgDexie
     * @license Apache License, http://www.apache.org/licenses/
     */

    /**
     * Create ngdexie module
     */
    angular.module('ngdexie', ['ngdexie.core']);

    angular.module('ngdexie.core', ['ngdexie.utils']);

    angular.module('ngdexie.core')
            .provider('ngDexie', ngDexie);


    /**
     * NgDexie Class
     * @returns {ngDexie}
     */
    function ngDexie() {
        /* jshint validthis: true */
        var self = this;

        ////
        //// Configuration part
        ////
        var options = {
            name: '',
            debug: false
        };

        var configuration = function () {
            console.error('NgDexie :: No configuration hook has been set!');
        };

        self.setOptions = function (value) {
            options = angular.extend({}, options, value);
        };

        self.setConfiguration = function (handle) {
            configuration = handle;
        };

        ////
        //// api part
        ////
        self.$get = function ($rootScope, $q, $log, ngDexieUtils) {
            $log.debug('NgDexie :: init');
            var options = getOptions();

            // is debug enabled? Warn the developer
            if (options.debug) {
                $log.warn("NgDexie :: debug mode enabled");
            }

            // initialise Dexie object
            var db = new Dexie(options.name);

            // Do we need to remove the database
            if (options.debug) {
                db.delete().then(function () {
                    $log.warn("debug mode :: Database deleted");
                });
            }

            configuration.call(this, db);
            db.open();

            // Make sure we log it when the database is locked
            db.on('blocked', function () {
                $log.warn('database seems to be blocked');
            });


            return {
                getOptions: getOptions,
                get: get,
                getByIndex: getByIndex,
                getDb: getDb,
                list: list,
                listByIndex: listByIndex,
                put: put
            };

            /**
             * Get one entrie from the database
             * @param {type} storeName
             * @param {type} key
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function get(storeName, key) {
                var deferred = $q.defer();
                db.table(storeName).get(key, function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }

            /**
             * Get entries from the database
             * @param {type} storeName
             * @param {type} index
             * @param {type} key
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function getByIndex(storeName, index, key) {
                var deferred = $q.defer();
                db.table(storeName).where(index).equals(key).toArray(function (data) {
                    if (angular.isArray(data) && data.length > 0) {
                        deferred.resolve(data[0]);
                    } else {
                        deferred.reject();
                    }
                });
                return deferred.promise;
            }

            /**
             * Run the given function in an $apply
             * @param {type} handle to a function which receives an db object
             * @param {type} useApply wrapper
             * @return db
             */
            function getDb(handle, useApply) {
                // If handle is undefined then only return the db
                if (angular.isUndefined(handle)) {
                    return db;
                }

                // set default useApply = false
                if (angular.isUndefined(useApply)) {
                    useApply = false;
                }

                // UseApply?
                if (useApply) {
                    $rootScope.$apply(function () {
                        handle.call(self, db);
                    });
                } else {
                    handle.call(self, db);
                }

                return db;
            }

            /**
             * Get all entries from the storeName
             * @param {type} storeName
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function list(storeName) {
                var deferred = $q.defer();
                db.table(storeName).toArray(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }

            /**
             * Get entries from the database
             * @param {type} storeName
             * @param {type} index
             * @param {type} key
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function listByIndex(storeName, index, key) {
                var deferred = $q.defer();
                db.table(storeName).where(index).equals(key).toArray(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }

            /**
             * Save an deepcloned value to the database (without $$hashKey)
             * @param {type} storeName
             * @param {type} value
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function put(storeName, value) {
                var deferred = $q.defer();
                db.table(storeName).put(ngDexieUtils.deepClone(value)).then(function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
        };

        self.$get.$inject = ['$rootScope', '$q', '$log', 'ngDexieUtils'];

        function getOptions() {
            return options;
        }
    }
})();
(function () {
    'use strict';
    /**
     * NgDexie is an wrapper around Dexie.js javascript library
     * @version v0.0.8
     * @link https://github.com/FlussoBV/NgDexie
     * @license Apache License, http://www.apache.org/licenses/
     */

    /**
     * Create ngdexie.utils module
     */
    angular.module('ngdexie.utils', ['ngdexie.core']);

    /**
     * Create ngDexieUtils factory
     */
    angular.module('ngdexie.utils')
            .factory("ngDexieUtils", ngDexieUtils);

    function ngDexieUtils() {

        return {
            deepClone: deepClone
        };

        /**
         * Will use the deepClone from Dexie and removes the $$hashKey from the ngRepeat
         * @param {type} value
         * @returns {unresolved}
         */
        function deepClone(value) {
            var clone = Dexie.deepClone(value);
            if (angular.isDefined(clone.$$hashKey)) {
                delete(clone.$$hashKey);
            }
            return value;
        }
    }

})();
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