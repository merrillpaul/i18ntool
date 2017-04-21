define(['app'], function (app) {
    'use strict';
    app.controller('configCtrl', function ($scope, $stateParams, $rootScope) {
        $scope.currentLang = $stateParams.lang;
        $rootScope.pageTitle = 'For ' + $scope.currentLang;
        $rootScope.editing = true;
    
        $scope.jsonItems = [
            {
                name: 'examinee',
                items: [
                    {
                        name: 'list',
                        items: [
                            {
                                name: 'title',
                                value: 'Examinee List',
                                otherValue: 'French list'
                            }
                        ]
                    },
                    {
                        name: 'grid',
                        items: [
                            {
                                name: 'title',
                                items: [
                                    {
                                        name: 'firstName',
                                        value: 'First Name',
                                        otherValue: ''
                                    },
                                    {
                                        name: 'lastName',
                                        value: 'Last Name',
                                        otherValue: ''
                                    },
                                    {
                                        name: 'dob',
                                        value: 'DOB',
                                        otherValue: ''
                                    },
                                    {
                                        name: 'gender',
                                        value: 'Gender',
                                        otherValue: ''
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'examineeDetails',
                        items: [
                            {
                                name: 'create',
                                items: [
                                    {
                                        name: 'title',
                                        value: 'Create Examinee',
                                        otherValue: ''
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: 'login',
                items: [
                    {
                        name: 'title',
                        value: 'Project One login',
                        otherValue: ''
                    },
                    {
                        name: 'form',
                        items: [
                            {
                                name: 'username',
                                value: 'Username',
                                otherValue: 'Nom'
                            },
                            {
                                name: 'password',
                                value: 'Password',
                                otherValue: 'Carte'
                            }
                        ]
                    }
                ]
            }
        ];
    });
});