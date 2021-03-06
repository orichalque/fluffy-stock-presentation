/*
 * Application angular JS permettant d'administrer l'application
 * Utilisee sur la page admin.html
 * La recuperation des donnees ainsi que l'ajout et la supression s'effectue par appels REST sur l'application SLD360
 */
(function () {

    /**
     * Dependances
     * $scope: Acces aux variables JS depuis le HTML
     * $http: Gestion des appels REST
     * $cookies: Gestion des cookies pour maintenir ma connexion
     * $window: Redirections
     * $q promises
     */
    var app = angular.module("adminApp", []);
    app.controller("productCtrl", ['$scope', '$http', '$window', '$q', function ($scope, $http, $window, $q) {

        $scope.user = {"mail": "", "role": ""};

        function sendHttpRequest(uri, parameters, pMethod) {
            var defer = $q.defer();
            $http({
                method: pMethod,
                url: uri,
                data: parameters,
                crossDomain: true,
                contentType: 'application/json'
            }).then(function (response) {//successCallback
                defer.resolve(response.data);
            }, function (response) {//errorCallback
                defer.reject(response.data);
            });
            return defer.promise;
        }

        //valeurs par defauts
        /**
         * Indique si le message d'ajout doit s'afficher
         * @type {boolean}
         */
        $scope.entityAdded = false;
        /**
         * indique si le message d'erreur doit s'afficher
         * @type {boolean}
         */
        $scope.error = false;
        /**
         * Liste des Products en base
         * Par default (avant chargement) contient juste la string "Loading..."
         * @type Array of Json de Product
         */
        $scope.products = [{nom_product: "Loading..."}];

        $scope.types = ['MINERAL', 'DIVERS', 'BOIS', 'METAL',
            "ALIMENTAIRE",
            "HYGIENE",
            "LIQUIDE",
            "EPICERIE",
            "FRAIS",
            "BAZAR"
        ];

        $scope.numberByPage = [10, 20, 30, 40];
        /*
         * ==============================================================
         */


        //--------------Utilitaires pour les modifications des donnees---------------
        $scope.tomodif = "";
        $scope.modifier = function (nom) {
            $scope.tomodif = nom;
        };
        $scope.modif = function (nom) {
            return nom == $scope.tomodif;

        };
        /*
         * ==============================================================
         */

        /*
         * Onglet administration des products
         * ==============================================================
         */


        /**
         *gestion Pagination
         */
        $scope.totalItems = 200; // api -> count
        $scope.currentPage = 1;
        $scope.itemPerPage = 20;


        $scope.next = function () {
            $scope.currentPage++;
            getProductsPagination();
        };
        $scope.prev = function () {
            $scope.currentPage--;
            getProductsPagination();
        };
        $scope.pageChanged = function () {
            getProductsPagination();
        };

        $scope.maxSize = 5;

        /*
         * Recuperation des produits par appel REST
         * Appels l'application SLD 360
         */

        function getProductsPagination() {
            sendHttpRequest(config.url + 'products?page=' + $scope.currentPage + "&size=" + $scope.itemPerPage, {}, 'GET').then(function (data) {
                $scope.products = data;
            });
        }

        getProductsPagination();

        $scope.jsonProduct = {
            name: "",
            description: "",
            productType: "",
            price: 0,
            quantity: 0
        };
        /***
         * Ajout du product rentre par l'utilisateur dans les champs
         * Appels un service REST permettant l'ajout
         * Appel effectue sur l'application SLD360
         */

        $scope.addProduct = function () {
            $scope.error = false;
            $scope.message = '';


            //appel REST pour ajouter le product
            sendHttpRequest(config.urlAdmin + 'product', JSON.stringify($scope.jsonProduct), 'POST').then(function () {
                $scope.message = "Product Ajoute avec succes";
                $scope.entityAdded = true;
                $scope.jsonProduct = {
                    name: "",
                    description: "",
                    productType: "",
                    price: 0,
                    quantity: 0
                };
            }, function () {//errorCallback
                $scope.error = true;
                $scope.message = "failure : n'existe-t-il pas deja dans la base ?";
                $scope.jsonProduct = {
                    name: "",
                    description: "",
                    productType: "",
                    price: 0,
                    quantity: 0
                };
            });

        };

        //pour enlever la bulle "d'ajout avec succes"
        $scope.setFalse = function () {
            $scope.entityAdded = false;
            $scope.error = false;
        };

        /**
         * suppression d'un product
         * Appels un service REST permettant la suppression
         * Appel effectue sur l'application SLD360
         * @param product le JSON du product a supprimer
         */
        $scope.removeProduct = function (product) {
            //Fenetre modale
            if (confirm('Voulez-vous vraiment supprimer ce produit?')) {
                //appel REST de suppression en fonction de l'id du product
                sendHttpRequest(config.urlAdmin + 'product/' + product.id, {}, 'DELETE').then(function () {
                    //on supprime aussi le product de l'affichage (pas besoin d'actualiser)
                    var index = $scope.products.indexOf(product);
                    if (index > -1) {
                        $scope.products.splice(index, 1);
                    }
                });
            }
        };

        /**
         * modification de la campagne et/ou de la description d'un product et/ou de son nom
         * @param product le product modifie
         */
        $scope.change_product = function (product) {

            sendHttpRequest(config.urlAdmin + "product/" + product.id, angular.toJson(product), 'PUT').then(function () {
                $scope.tomodif = "";
            });
        };

        /*
         * ==============================================================
         */


        /*
         * Onglet administration des admin
         * ==============================================================
         */
        $scope.isAdmin = false;
        $scope.isClient = false;

        $scope.getUser = function (email) {
            sendHttpRequest(config.urlAdmin + 'user/' + email.replace(new RegExp("\\.", 'g'), "*"), {}, 'GET').then(function (data) {
                if (data.role === "ADMIN" || data.role === "admin") {
                    $scope.isAdmin = true;
                } else if (data.role === "CLIENT" || data.role === "client") {
                    $scope.isClient = true;
                }
            }, function () {
                console.error("can't find user")
            });
        };

        $scope.getUsers = function () {
            sendHttpRequest(config.urlAdmin + 'users', {}, 'GET').then(function (data) {
                $scope.users = data
            }, function () {
                console.error("can't get all users")
            });
        };
        /**
         * Ajout d'un administrateur rentre par l'utilisateur dans les champs
         * Appels un service REST permettant l'ajout
         * Appel effectue sur l'application SLD360
         */
            // $scope.user = {username: "", password: "", confirmation: ""};
        $scope.register = function () {
            $scope.message = '';
            //creation du Json a envoyer

            //appel REST pour creer l'administrateur en base
            sendHttpRequest(config.urlAdmin + 'user/' + $scope.user.role, $scope.user.mail.replace(new RegExp("\\.", 'g'), "*"), 'POST').then(function () {
                $scope.message = "Utilisateur Ajoute avec succes";
                $scope.entityAdded = true;
                $scope.getUsers();
            }, function () {//errorCallback
                $scope.error = true;
                $scope.message = "failure : l'utilisateur est incorrect ou deja present";
            });
        };

        /**
         * suppression d'un admin
         * Appels un service REST permettant la suppression
         * Appel effectue sur l'application SLD360
         */
        $scope.removeAdmin = function (user) {
            //fenetre modale
            if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                //appel REST de suppression de l'admin a l'aide de son nom
                sendHttpRequest(config.urlAdmin + 'user/' + user.mail, {}, 'DELETE').then(function () {
                    var index = $scope.users.indexOf(user);
                    if (index > -1) {
                        //MAJ affichage
                        $scope.users.splice(index, 1);
                    }
                });
            }
        };
        /*
         * ==============================================================
         */


        /*
         * ==============================================================
         */


        /**
         * Gestion des tabs
         * Permet de savoir quel tab afficher
         * ==============================================================
         */
        this.tab = 1;
        $scope.error = false;

        this.setTab = function (newValue) {
            this.tab = newValue;
        };

        this.isSet = function (tabName) {
            return this.tab === tabName;
        };
        /*
         * ==============================================================
         */
    }]);

})();

/**
 * Methode d'Oauth google
 * @param googleUser token
 */
var onSignIn=function(googleUser) {
    var profile = googleUser.getBasicProfile();
    var scope = angular.element(document.getElementById("mainWrap")).scope();
    scope.getUser(profile.getEmail());
    scope.getUsers();
};