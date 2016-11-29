/*
 * Application angular JS permettant d'administrer l'application
 * Utilisée sur la page admin.html
 * La recuperation des données ainsi que l'ajout et la supression s'effectue par appels REST sur l'application SLD360
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
    app.controller("productCtrl", ['$scope', '$http', '$window','$q',  function ($scope, $http, $window, $q) {

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
        //valeurs par défauts
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
         * Par défault (avant chargement) contient juste la string "Loading..."
         * @type Array of Json de Product
         */
        $scope.products = [{nom_product: "Loading..."}];

        $scope.types=['MINERAL', 'DIVERS', 'BOIS', 'METAL',
            "alimentaire",
            "hygiene",
            "liquide",
            "epicerie",
            "frais",
            "bazar"
        ];

        $scope.numberByPage = [10,20,30,40];
        /*
         * ==============================================================
         */


        //--------------Utilitaires pour les modifications des données---------------
        $scope.tomodif="";
        $scope.modifier=function(nom){
            $scope.tomodif = nom;
        };
        $scope.modif=function(nom){
            return nom==$scope.tomodif;

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


        $scope.next= function(){
            $scope.currentPage ++;
            getProductsPagination();
        };
        $scope.prev= function(){
            $scope.currentPage --;
            getProductsPagination();
        };
        $scope.pageChanged = function() {
            getProductsPagination();
        };

        $scope.maxSize = 5;

        /*
         * Recuperation des produits par appel REST
         * Appels l'application SLD 360
         */

        function getProductsPagination() {
            sendHttpRequest(config.url + 'products?page='+$scope.currentPage+"&size="+$scope.itemPerPage, {}, 'GET').then(function(data) {
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
         * Ajout du product rentré par l'utilisateur dans les champs
         * Appels un service REST permettant l'ajout
         * Appel effectué sur l'application SLD360
         */

        $scope.addProduct = function () {
            $scope.error = false;
            $scope.message = '';


            //appel REST pour ajouter le product
            sendHttpRequest(config.urlAdmin + 'product', JSON.stringify($scope.jsonProduct), 'POST').then(function() {
                $scope.message = "Product Ajouté avec succès";
                $scope.entityAdded = true;
                $scope.jsonProduct = {
                    name: "",
                    description: "",
                    productType: "",
                    price: 0,
                    quantity: 0
                };
                //actualisation des produits
                sendHttpRequest(config.url + 'products', null, 'GET').then(function(data){
                    $scope.products=data;
                });
            }, function (){//errorCallback
                $scope.error = true;
                $scope.message = "failure : n'existe-t-il pas déja dans la base ?";
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
            $scope.error=false;
        };

        /**
         * suppression d'un product
         * Appels un service REST permettant la suppression
         * Appel effectué sur l'application SLD360
         * @param product le JSON du product a supprimer
         */
        $scope.removeProduct = function (product) {
            //Fenetre modale
            if (confirm('Voulez-vous vraiment supprimer ce produit?')) {
                //appel REST de suppression en fonction de l'id du product
                sendHttpRequest(config.url + 'products/'+product.id,{},'DELETE').then(function () {
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
         * @param product le product modifié
         */
        $scope.change_product=function(product){
            sendHttpRequest(config.urlAdmin + "product/"+product.id, product,'POST').then(function () {
                $scope.tomodif="";
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

        $scope.getUser = function(email) {
            sendHttpRequest(config.urlAdmin + 'user/'+ email, {},'GET').then(function (data) {
                if (data.role === "ADMIN" || data.role === "admin") {
                    $scope.isAdmin = true;
                } else if (data.role === "CLIENT" || data.role === "client") {
                    $scope.isClient = true;
                }
            }, function() {
                console.error("can't find user")
            });
        };
        /**
         * Ajout d'un administrateur rentré par l'utilisateur dans les champs
         * Appels un service REST permettant l'ajout
         * Appel effectué sur l'application SLD360
         */
       // $scope.user = {username: "", password: "", confirmation: ""};
        $scope.register = function() {
            $scope.message = '';
            //creation du Json à envoyer
            $scope.jsonUser = {
                nom_user: $scope.user.username,
                mdp_user: encode($scope.user.password)
            };
            //appel REST pour creer l'administrateur en base
            sendHttpRequest(config.url + 'admins', $scope.jsonUser,'POST').then(function () {
                $scope.message = "Utilisateur Ajouté avec succès";
                $scope.entityAdded = true;
                //MAJ de l'affichage
                $scope.users.push($scope.jsonUser);
            }, function (){//errorCallback
                $scope.error = true;
                $scope.message = "failure : n'existe-t-il pas déja dans la base ?";
            });
        };

        /**
         * Verifie l'égalité des deux mdp rentrés dans le champ du formulaire
         */
        $scope.mdpEquals = function () {
            return $scope.user.password == $scope.user.confirmation;
        };

        /**
         * suppression d'un admin
         * Appels un service REST permettant la suppression
         * Appel effectué sur l'application SLD360
         */
        $scope.removeAdmin = function (user) {
            //fenetre modale
            if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                //appel REST de suppression de l'admin à l'aide de son nom
                sendHttpRequest(config.url + 'admins/' + user.nom_user,{},'DELETE').then(function () {
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

    /**
     * Directive permettant l'affichage de la barre de navigation
     * ==============================================================
     */
    /*app.directive("navbarperso", function () {
        return {
            templateUrl: "navbar.html",
            controller: ['$scope', '$http', function ($scope, $http) {
                $scope.versions = [{version_SI: ""}];
                $http.get(config.url + 'rest/versions').success(function (data) {
                    $scope.versions = data;
                    $scope.distinctVersions = [];
                    doublon:
                        for (var i in $scope.versions) {
                            var version = $scope.versions[i].version_SI;
                            for (var j in $scope.distinctVersions) {
                                if (version == $scope.distinctVersions[j]) {
                                    continue doublon;
                                }
                            }
                            $scope.distinctVersions.push(version);
                        }
                });
            }]
        };
    });*/
    /*
     * ==============================================================
     */

    /**
     * Directive permettant l'affichage du pied de page
     * ==============================================================
     */
    /*app.directive("footerperso", function () {
        return {
            templateUrl: "footer.html"
        };
    });*/

    /**
     * Directive permettant la detection de l'appuie sur la touche Entrée
     * Utile pour les modifications dans la zone admin
     * ==============================================================
     */
   /* app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });*/
    /*
     * ==============================================================
     */


})();


var onSignIn=function(googleUser) {
    var profile = googleUser.getBasicProfile();
    var scope = angular.element(document.getElementById("mainWrap")).scope();
    scope.getUser(profile.getEmail());
};