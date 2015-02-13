/**
 * Angularjs wrapper around Dexie.js an IndexedDB handler
 * @version v0.0.12 - build 2015-02-13
 * @link https://github.com/FlussoBV/NgDexie
 * @license Apache License, http://www.apache.org/licenses/
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'ngDexie';
}

(function () {
    'use strict';

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

        self.$get = /*@ngInject*/ ["$rootScope", "$q", "$log", "ngDexieUtils", function ($rootScope, $q, $log, ngDexieUtils) {
            $log.debug('NgDexie :: init');
            var options = getOptions();

            // initialise Dexie object
            var db = new Dexie(options.name);

            // is debug enabled? Warn the developer
            if (options.debug) {
                $log.warn("NgDexie :: debug mode enabled");
            }

            // Do we need to remove the database
            if (options.debug) {
                db.delete().then(function () {
                    $log.warn("debug mode :: Database deleted");
                });
            }

            configuration.call(this, db);
            db.open().then(function () {
                db.close();
                db.open().then(function () {
                    $log.debug("NgDexie :: database is open");
                });
            });

            // Make sure we log it when the database is locked
            db.on('blocked', function () {
                $log.warn('database seems to be blocked');
            });


            return {
                getOptions: getOptions,
                get: get,
                getByIndex: getByIndex,
                getDb: getDb,
                getTransaction: getTransaction,
                list: list,
                listByIndex: listByIndex,
                put: put,
                reopen: reopen
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
             * Get an dexie.transaction in RW mode
             * @param {type} storeName
             * @param {type} handle which receives the transaction
             * @returns {$q@call;defer.promise}
             */
            function getTransaction(storeName, handle) {
                var deferred = $q.defer();
                db.transaction("rw", storeName, function () {
                    handle.call(self, db);
                }).then(function () {
                    deferred.resolve();
                }).catch(function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
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

            /**
             * Open and close the database. In between the given function will be called
             * @param {type} handle
             * @returns {$q@call;defer.promise}
             */
            function reopen(handle) {
                var deferred = $q.defer();
                db.close();
                if (handle) {
                    handle.call(this, db);
                }
                db.open().then(function () {
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }];

        function getOptions() {
            return options;
        }
    }
})();
(function () {
    'use strict';

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

    /*@ngInject*/
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
                var clearTables = 0;
                angular.forEach(storeNames, function (storeName) {
                    var dbTable = db.table(storeName);
                    // Use single table transactions for safari
                    db.transaction("rw", dbTable, function () {
                        dbTable.clear();
                    }).then(function () {
                        clearTables++;
                        if (clearTables === storeNames.length) {
                            db.syncable.delete(url).then(function () {
                                setTimeout(function () {
                                    db.syncable.connect("iSyncRestProtocol", url);
                                }, 1500);
                            });
                        }
                    });
                });

            });
        }

        /**
         * Resync the database
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
    ngDexieSync.$inject = ["$log", "$rootScope", "$q", "ngDexie"];
})();