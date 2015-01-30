routerFiles = {
    src: [
        'src/ngdexie.core.js',
        'src/ngdexie.utils.js',
        'src/ngdexie.sync.js'
    ],
    testUtils: [
        'bower_components/dexie/dist/latest/Dexie.js',
        'test/testUtils.js'
    ],
    test: [
        'test/*.spec.js'
    ],
    angular: function (version) {
        return [
            'lib/angular-' + version + '/angular.js',
            'lib/angular-' + version + '/angular-mocks.js'
        ].concat(['1.3.0'].indexOf(version) !== -1 ? ['lib/angular-' + version + '/angular-animate.js'] : []);
    }
};

if (exports) {
    exports.files = routerFiles;
}
