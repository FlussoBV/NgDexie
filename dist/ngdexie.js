'use strict';

/**
 * Create idb.utils module
 */
angular.module('idb.utils', ['ng']);

/**
 * NgDexie Class
 * @param {type} $http
 * @param {type} $q
 * @param {type} $log
 * @returns {NgDexie}
 */
var NgDexie = function ($rootScope, $http, $q, $log) {
    this.scope_ = $rootScope;
    this.http_ = $http;
    this.q_ = $q;
    this.log_ = $log;
    this.db = null;
    this.options = {};
    this.syncNeeded = false;

    this.getScope = function () {
        return this.scope_;
    };

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

    this.setSyncNeeded = function (value) {
        this.syncNeeded = value;
    };

    this.getSyncNeeded = function () {
        return this.syncNeeded;
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
    var self = this;
    self.getLog().debug('NgDexie :: init');

    var deferred = self.getQ().defer();
    var options = self.getOptions();

    options.debug = angular.isDefined(debug) ? debug : false;
    if (options.debug) {
        self.getLog().warn("NgDexie :: debug mode enabled");
    }

    var db = new Dexie(name);
    this.setDb(db);

    if (options.debug) {
        db.delete().then(function () {
            self.getLog().warn("debug mode :: Database deleted");
        });
    }

    configuration.call(self, db);
    db.open();
    deferred.resolve(db);
    db.syncable.on('statusChanged', function (newStatus, url) {
        self.getScope().$apply(function () {
            self.getScope().$broadcast("ngDexieStatusChanged", {status: newStatus, statusText: Dexie.Syncable.StatusTexts[newStatus], url: url});
        });
    });

    // Make sure we log it when the database is locked
    db.on('blocked', function () {
        self.getLog().warn('database seems to be blocked');
    });

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
 * Get entries from the database
 * @param {type} storeName
 * @param {type} index
 * @param {type} key
 * @returns {NgDexie@call;getQ@call;defer.promise}
 */
NgDexie.prototype.getByIndex = function (storeName, index, key) {
    var deferred = this.getQ().defer();
    this.getDb().table(storeName).where(index).equals(key).toArray(function (data) {
        deferred.resolve(data);
    });
    return deferred.promise;
};

NgDexie.prototype.getStatus = function () {
    return this.getStatus();
};

/**
 * Save an deepcloned value to the database (without $$hashKey)
 * @param {type} storeName
 * @param {type} value
 * @returns {NgDexie@call;getQ@call;defer.promise}
 */
NgDexie.prototype.put = function (storeName, value) {
    var deferred = this.getQ().defer();
    this.getDb().table(storeName).put(this.deepClone(value)).then(function(data){
        deferred.resolve(data);
    });
    return deferred.promise;
};

/**
 * Resync the database
 * @param {type} url
 * @param {type} storeNames
 * @returns {undefined}
 */
NgDexie.prototype.resync = function (url, storeNames) {
    var cdb = this.getDb();

    if (!angular.isArray(storeNames)) {
        storeNames = [storeNames];
    }

    // Disconnect the synchronisation database
    cdb.syncable.disconnect(url).then(function () {
        var dbTables = [];
        angular.forEach(storeNames, function (storeName) {
            dbTables.push(cdb.table(storeName));
        });
    

        cdb.transaction("rw", dbTables, function () {
            // Clear storenames
            angular.forEach(dbTables, function (dbTable) {
                dbTable.clear()
            });
        }).then(function () {
            return cdb.syncable.delete(url).then(function () {
                setTimeout(function () {
                    cdb.syncable.connect("iSyncRestProtocol", url);
                }, 1500);
            });
        });
    });
};

/**
 * Check if there are synchronisation changes
 * @param {type} url
 * @param {type} storeNames
 * @returns {undefined}
 */
NgDexie.prototype.unsyncedChanges = function (url) {
    var deferred = this.getQ().defer();
    
    var cdb = this.getDb();
    if (angular.isDefined(cdb) && cdb.isOpen()) {
        cdb.syncable.unsyncedChanges(url).then(function (data) {
            deferred.resolve(data);
        });
    }

    return deferred.promise;
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
angular.module('idb.utils').service('ngDexie', ["$rootScope","$http", "$q", "$log", NgDexie]);