(function () {
    'use strict';

    /**
     * Create ngdexie module
     */
    angular.module('ngdexie', ['ngdexie.core', 'ngdexie.ui']);

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

        self.$get = /*@ngInject*/ function ($rootScope, $q, $log, ngDexieUtils) {
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
                remove: remove,
                add: add,
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
                db.table(storeName).get(key)
                  .then(deferred.resolve)
                  .catch(deferred.reject);
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
                db.table(storeName).toArray()
                  .then(deferred.resolve)
                  .catch(deferred.reject);
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
                db.table(storeName).where(index).equals(key).toArray()
                  .then(deferred.resolve)
                  .catch(deferred.reject);
                return deferred.promise;
            }

            /**
             * Remove an entrie from the database
             * Note: we don't want to use a method called delete as it is a reserved keyword
             * @param {type} storeName
             * @param {type} key
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function remove(storeName, key) {
                var deferred = $q.defer();
                ngDexie.getDb(function (db) {
                    db.table(storeName).delete(key).then(function () {
                        deferred.resolve();
                    }).catch(function (err) {
                        $log.debug("Error while using delete: " + err);
                        deferred.reject(err);
                    });
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
                }).catch(function (err) {
                    $log.debug("Error while using put: " + err);
                    deferred.reject(err);
                });
                return deferred.promise;
            }

            /**
             * Add an deepcloned value to the database (without $$hashKey)
             * @param {type} storeName
             * @param {type} value
             * @returns {NgDexie@call;getQ@call;defer.promise}
             */
            function add(storeName, value) {
                var deferred = $q.defer();
                db.table(storeName).add(ngDexieUtils.deepClone(value)).then(function (data) {
                    deferred.resolve(data);
                }).catch(function (err) {
                    $log.debug("Error while using add: " + err);
                    deferred.reject(err);
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
        };

        function getOptions() {
            return options;
        }
    }
})();
