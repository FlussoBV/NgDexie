# NgDexie #

## Version 0.0.21 (2017-07-21) ##
* Dexie.js 1.5.1 seems to be failing on android. Return to 1.4.2

## Version 0.0.20 (2017-07-18) ##
* Improve ngDexie interface with method chaining (thanks FelipeBarrosCruz)
* Fix error in deepClone (thanks JanDouweVonk)
* Fix wrong dexie version in bower.json (thanks JanDouweVonk)

## Version 0.0.19 (2017-07-13) ##
* Renamed main file to ng-dexie.js
* Added cleargul
* Accepted merge request for loadDb (thanks magori)
* Fixed the remove call
* Fixed Missing catch was causing a DatabaseClosedError (thanks benamib)

## Version 0.0.18 (2016-03-08) ##
* Added an add version which is a little bit faster then a put
* Make ngDexie npm ready

## Version 0.0.17 (2016-03-07) ##
* Upgraded to dexie.js v1.2.0

## Version 0.0.16 (2015-09-03) ##
* Fixed missing dependency to dexie

## Version 0.0.15 (2015-08-07) ##
* Added remove function
* Added promise.reject when using put

## Version 0.0.14 (2015-06-09) ##
* Dropped the unofficial support for dexiejs.syncable
* Dropped the dexie.js fork as performance changes are in the core now

## Version 0.0.13 (2015-04-10) ##
* bind an object from the database on the scope
* use our own dexie.js github fork as it contains some performance changes

## Version 0.0.12 (2015-02-13) ##
* Change resync so it use an transaction for every table (safari)
* Added getTransaction

## Version 0.0.11 (2015-02-02) ##
* Version bump

## Version 0.0.10 (2015-02-02) ##
* Added reopen feature

## Version 0.0.9 (2015-01-30) ##
* Some small improvements
* More project changes
* Use ngAnnotate for build process

## Version 0.0.8 (2015-01-26) ##
* Converter NgDexie to an provider
* idb.utils is changed in ngdexie and ngdexie.sync
* ngDexie.db has been removed
* ngDexie.getDb() introduced which returns an Dexie.js handle (db), but can also handle a function(db){} as parameter

## Version 0.0.7 (2015-01-08) ##

* Fix: Get by index should return one object. If more then one found return the first.
* Feature: list by index (the old getByIndex which returned an array of found items)

**Breaking changes**  

* getByIndex() no longer returns an array