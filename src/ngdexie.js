'use strict';

/**
 * Create idb.utils module
 */
angular.module('idb.utils', ['ng']);

/**
 * NgDexie Class
 * @param {type} $http
 * @param {type} $q
 * @param {type} $timeout
 * @returns {NgDexie}
 */
var NgDexie = function ($http, $q, $log) {
    this.http_ = $http;
    this.q_ = $q;
    this.log_ = $log;
    this.db = null;
    this.options = {};

    this.getQ = function () {
        return this.q_;
    };

    this.getLog = function () {
        return this.log_;
    };

    this.getDb = function () {
        return this.db;
    };

    this.setDb = function (db) {
        this.db = db;
    };

    this.getOptions = function () {
        return this.options;
    };
};

/**
 * Initialize the database
 * @param {type} name
 * @param {type} configuration
 * @param {type} debug
 * @returns {NgDexie@call;getQ@call;defer.promise}
 */
NgDexie.prototype.init = function (name, configuration, debug) {
    this.getLog().debug('NgDexie :: init');

    var deferred = this.getQ().defer();
    var options = this.getOptions();

    options.debug = angular.isDefined(debug) ? debug : false;
    if (options.debug) {
        this.getLog().warn("NgDexie :: debug mode enabled");
    }

    var db = new Dexie(name);
    this.setDb(db);

    if (options.debug) {
        db.delete().then(function () {
            this.getLog().warn("debug mode :: Database deleted");
        });
    }

    configuration.call(this, db);
    db.open();
    deferred.resolve(db);

    return deferred.promise;
};

/**
 * Get all entries from the storeName
 * @param {type} storeName
 * @returns {NgDexie@call;getQ@call;defer.promise}
 */
NgDexie.prototype.list = function (storeName) {
    var deferred = this.getQ().defer();
    this.getDb().table(storeName).toArray(function (data) {
        deferred.resolve(data);
    });
    return deferred.promise;
};

/**
 * Get one entrie from the database
 * @param {type} storeName
 * @param {type} key
 * @returns {NgDexie@call;getQ@call;defer.promise}
 */
NgDexie.prototype.get = function (storeName, key) {
    var deferred = this.getQ().defer();
    this.getDb().table(storeName).get(key, function (data) {
        deferred.resolve(data);
    });
    return deferred.promise;
};

/**
 * Get one entrie from the database
 * @param {type} storeName
 * @param {type} key
 * @returns {NgDexie@call;getQ@call;defer.promise}
 */
NgDexie.prototype.getByKey = function (storeName, index, key) {
    var deferred = this.getQ().defer();
    this.getDb().table(storeName).where(index).equals(key).toArray(function (data) {
        deferred.resolve(data);
    });
    return deferred.promise;
};

/**
 * Save an deepcloned value to the database (without $$hashKey)
 * @param {type} storeName
 * @param {type} value
 * @returns {undefined}
 */
NgDexie.prototype.put = function (storeName, value) {
    this.getDb().table(storeName).put(this.deepClone(value));
};

/**
 * Resync the database
 * @param {type} url
 * @param {type} storeNames
 * @returns {undefined}
 */
NgDexie.prototype.resync = function (url, storeNames) {
    var cdb = this.getDb();

    // Disconnect the synchronisation database
    cdb.syncable.disconnect(url);

    // Clear storenames
    if (angular.isArray(storeNames)) {
        angular.forEach(storeNames, function (storeName) {
            cdb.table(storeName).clear();
        });
    }

    // Clear the synchronisation tables and reconnect when done
    cdb.syncable.disconnect(url).then(function () {
        return cdb.syncable.delete(url);
    }).then(function () {
        return cdb.syncable.connect("iSyncRestProtocol", url);
    });
};

/**
 * Will use the deepClone from Dexie and removes the $$hashKey from the ngRepeat
 * @param {type} value
 * @returns {unresolved}
 */
NgDexie.prototype.deepClone = function (value) {
    var clone = Dexie.deepClone(value);
    if (angular.isDefined(clone.$$hashKey)) {
        delete(clone.$$hashKey);
    }
    return value;
};

// Register the service in angular
angular.module('idb.utils').service('ngDexie', ["$http", "$q", "$log", NgDexie]);