#NgDexie#

##Version 0.0.12 (2015-02-13)##
* Change resync so it use an transaction for every table (safari)
* Added getTransaction

##Version 0.0.11 (2015-02-02)##
* Version bump

##Version 0.0.10 (2015-02-02)##
* Added reopen feature

##Version 0.0.9 (2015-01-30)##
* Some small improvements
* More project changes
* Use ngAnnotate for build process

##Version 0.0.8 (2015-01-26)##
* Converter NgDexie to an provider
* idb.utils is changed in ngdexie and ngdexie.sync
* ngDexie.db has been removed
* ngDexie.getDb() introduced which returns an Dexie.js handle (db), but can also handle a function(db){} as parameter

##Version 0.0.7 (2015-01-08)##

* Fix: Get by index should return one object. If more then one found return the first.
* Feature: list by index (the old getByIndex which returned an array of found items)

**Breaking changes**  

* getByIndex() no longer returns an array