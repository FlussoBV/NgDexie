describe('ngdexie tests', function () {

    beforeEach(function () {
        // Initialize the service provider 
        // by injecting it to a fake module's config block
        var fakeModule = angular.module('test.app.config', function () {
        });
        fakeModule.config(function (ngDexieProvider) {
            ngDexieProvider.setOptions({name: 'testDB'});
            ngDexieProvider.setConfiguration(function () {
                console.log("Configuration hook has been set");
            });
        });
        // Initialize test.app injector
        module('ngdexie', 'test.app.config');

        // Kickstart the injectors previously registered 
        // with calls to angular.mock.module
        inject(function () {
        });
    });

    it('NgDexie exists', inject(function (ngDexie) {
        expect(ngDexie).toBeDefined();
    }));

    it('NgDexie.getDb() getOptions', inject(function (ngDexie) {
        expect(ngDexie.getOptions()).toBeDefined();
        expect(ngDexie.getOptions().name).toBe("testDB");
        expect(ngDexie.getOptions().debug).toBe(false);
    }));

    it('NgDexie.getDb() tests', inject(function (ngDexie) {
        expect(ngDexie.getDb).toBeDefined();
        expect(ngDexie.getDb()).toBeDefined();
        expect(ngDexie.getDb().name).toBeDefined();
        expect(ngDexie.getDb().name).toBe("testDB");
    }));
});