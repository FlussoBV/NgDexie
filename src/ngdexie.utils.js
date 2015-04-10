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
            console.log("debounce 1");
            var timeout;
            return function () {
                console.log("debounce 2");
                var context = this, args = arguments;
                var later = function () {
                    console.log("debounce later");
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