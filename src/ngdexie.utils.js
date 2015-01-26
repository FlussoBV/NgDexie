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