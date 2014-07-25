(function() {

    var app = angular.module('WeatherApp', ["ui.map", "ui.event", "ngAnimate", "myFilters"]);

        app.service('weatherService', ['$http', '$q', function ($http, $q) {
            
            function getWeather(lat, lon) {
                    var deffered = $q.defer();

                    var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast?lat='+ lat + '&lon='+ lon +'&callback=?';
                    var config = {
                        params: {
                            callback: 'JSON_CALLBACK'
                        }
                    };

                    var successCallback = function(response) {
                        deffered.resolve(response);

                        function responseList(data) {

                        };

                        angular.forEach(response.list, responseList);
                    };

                    var errorCallback = function(err) {
                        alert('Error Retrieving Information');
                        deffered.reject(err);
                    };

                    $http.jsonp(weatherAPI, config).success(successCallback).error(errorCallback);

                    return deffered.promise;
                };

                latlng: {}; 
        
            return {
                getWeather: getWeather      
            };


        }]);

        angular.module('myFilters', []).filter('friendlyDate', function() {
            return function(date) {
                return moment(date).add('day', 1).calendar();
            };
        });

        app.controller('WeatherCtrl', ['$scope', 'weatherService', function ($scope, weatherService) {

            $scope.address = "";
            $scope.lat = '0';
            $scope.lng = '0';
            $scope.error = "";
            $scope.model = { myMap: undefined };
            $scope.myMarkers = {};
            $scope.forecast = false;
            $scope.msg = {};
            var DEG = 'c';
            $scope.weatherLoaded = false;


            $scope.getCoords = function(string){
                $scope.address = string;
                GMaps.geocode({
                  address: $scope.address,
                  callback: function(results, status) {
                    if (status === 'OK') {
                      var latlng = results[0].geometry.location;
                      $scope.lat = latlng.lat();
                      $scope.lng = latlng.lng();
                      weatherService.mapLatLng = latlng;
                      $scope.fetchWeather(latlng.lat().toString(), latlng.lng().toString());
                      $scope.showPositionWithLatLng(latlng);
                    }
                  }
                });
            };

            $scope.fetchWeather = function(lat, lon) {
                $scope.weatherLoaded = false;
                weatherService.getWeather(lat, lon).then(function(response) {
                    $scope.place = response;
                    $scope.forecast = true;
                    $scope.weatherLoaded = true;
                });
            };
            
            $scope.fetchWeather('6.430556', '3.3958333');

            $scope.findWeather = function(lat, lon) {
                $scope.place = '';
                $scope.fetchWeather(lat, lon);
            };

            $scope.convertTemperature = function(kelvin){
                return Math.round(DEG == 'c' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
            }

            $scope.convertTime = function(time){
                $scope.d = new Date();
                return new Date(time*1000 - ($scope.d.getTimezoneOffset()*60*1000));
            }

            $scope.currentIndex = 0;

            $scope.isCurrent = function(index){
                return $scope.currentIndex === index;
            }

             $scope.showPrev = function () {
                console.log($scope.offset);
                if($scope.currentIndex > 0){
                    $scope.currentIndex = $scope.currentIndex - 1;
                }
            };


            $scope.showNext = function () {
                if($scope.currentIndex < $scope.place.list.length - 1){
                    $scope.currentIndex = $scope.currentIndex + 1;
                }
            };


            //Map Controls

            $scope.showResult = function () {
                return $scope.error == "";
            }
             
            $scope.mapOptions = {
                center: new google.maps.LatLng($scope.lat, $scope.lng),
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
            };
             
            $scope.showPosition = function (position) {
                $scope.lat = position.coords.latitude;
                $scope.lng = position.coords.longitude;
                $scope.$apply();
         
                var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
                $scope.model.myMap.setCenter(latlng);

                $scope.myMarkers = new google.maps.Marker({
                    map: $scope.model.myMap,
                    position:  latlng,
                    animation: google.maps.Animation.DROP
                });
            }

            $scope.showPositionWithLatLng = function (latlng) {
                $scope.model.myMap.setCenter(latlng);

                $scope.myMarkers.setPosition(latlng);
            }

            $scope.getLocation = function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
                }
                else {
                    $scope.error = "Geolocation is not supported by this browser.";
                }
            }

            $scope.getLocation();

        }]);

})();