/**
 * Angularjs wrapper around Dexie.js an IndexedDB handler
 * @version v0.0.17 - build 2016-03-08
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

    /*@ngInject*/
    function ngDexieUtils() {

        return {
            deepClone: deepClone,
            debounce: debounce
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

        /**
         * Protect a function for being called to rapidly
         * @param {type} func
         * @param {type} wait
         * @param {type} immediate
         * @returns {Function}
         */
        function debounce(func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) {
                        func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) {
                    func.apply(context, args);
                }
            };
        }
    }
})();
(function () {
    'use strict';

    /**
     * Create ngdexie.utils module
     */
    angular.module('ngdexie.ui', ['ngdexie.core']);

    /**
     * Create ngDexieUtils factory
     */
    angular.module('ngdexie.ui')
            .factory("ngDexieBind", ngDexieBind);

    /*@ngInject*/
    function ngDexieBind($parse, $log, ngDexie, ngDexieUtils) {
        var self = this;

        // Hold the scopes
        self._scopes = {};

        self._getScope = function ($scope) {
            var scopeKey = "s" + $scope.$id;

            // Creating scope if it does not exist
            if (angular.isUndefined(self._scopes[scopeKey])) {
                self._scopes[scopeKey] = {
                    watchers: {},
                    dbchanges: {}
                };

                // Cleanup when scope is terminated
                $scope.$on("$destroy", function () {
                    delete self._scopes[scopeKey];
                });
            }

            return self._scopes[scopeKey];
        };

        self._removeScope = function ($scope) {
            var scopeItem = self._getScope($scope);

            // Cleanup all the properties
            angular.forEach(scopeItem.watchers, function (watchFunction, property) {
                unbind($scope, property);
            });

            // Remove the scope item
            var scopeKey = "s" + $scope.$id;
            delete self._scopes[scopeKey];
        };

        // Start watching the dbase for changes
        dbWatcher();

        return {
            bind: bind,
            unbind: unbind,
            unbindScope: unbindScope
        };

        /**
         * Bind an scope property to an database record
         * @param {type} $scope
         * @param {type} property
         * @param {type} storeName
         * @param {type} id
         * @returns {ngdexie.ui.ngDexieBind}
         */
        function bind($scope, property, storeName, id) {
            var scopeItem = self._getScope($scope);

            var debounceFunc = ngDexieUtils.debounce(function (storeName, newVal) {
                ngDexie.put(storeName, newVal);
            }, 1000); // only commit stuff after 1 second

            // Check if the propery is defined
            if (angular.isUndefined($scope.$eval(property))) {
                // Value does not exist lets get the item from the db so we know it exists
                ngDexie.get(storeName, id).then(function (item) {
                    // Bind the property
                    $parse(property).assign($scope, item);

                    // Watch the item
                    var watchDeep = angular.isObject(item);
                    var watchFunction = function (newVal) {
                        if (angular.isDefined(newVal)) {
                            debounceFunc(storeName, newVal);
                        }
                    };

                    // Add to the watchers array
                    scopeItem.watchers[property] = $scope.$watch(property, watchFunction, watchDeep);

                    // Add to the dbChanges array
                    scopeItem.dbchanges[property] = {table: storeName, key: id,
                        refresh: function () {
                            ngDexie.get(storeName, id).then(function (item) {
                                $parse(property).assign($scope, item);
                            });
                        }
                    };

                });
            } else {
                $log.error("Already binded: " + property);
            }


            return this;
        }

        /**
         * Unbind the property
         * @param {type} $scope
         * @param {type} property
         * @returns {undefined}
         */
        function unbind($scope, property) {
            var scopeItem = self._getScope($scope);

            // Unregister watcher
            scopeItem.watchers[property]();

            // Remove from array
            delete scopeItem.watchers[property];
            delete scopeItem.dbchanges[property];
        }

        function unbindScope($scope) {
            self._removeScope($scope);
        }

        /**
         * Initialise the dbWatcher
         * @returns {undefined}
         */
        function dbWatcher() {
            ngDexie.getDb(function (db) {
                db.on("changes", function (changes) {
                    angular.forEach(changes, function (change) {
                        checkScopesForDbw(change.table, change.key);
                    });
                });
            });
        }

        /**
         * Check and/or refresh if there where db changes in an scope object
         * @param {type} table
         * @param {type} key
         * @returns {undefined}
         */
        function checkScopesForDbw(table, key) {
            angular.forEach(self._scopes, function (scope) {
                angular.forEach(scope.dbchanges, function (dbc) {
                    if (dbc.table === table && dbc.key === key) {
                        dbc.refresh();
                    }
                });
            });
        }
    }
    ngDexieBind.$inject = ["$parse", "$log", "ngDexie", "ngDexieUtils"];
})();