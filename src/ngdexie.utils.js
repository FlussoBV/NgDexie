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