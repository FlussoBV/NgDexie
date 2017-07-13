(function (angular) {
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
})(angular);