(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('BirdsEye', BirdsEye);

    BirdsEye.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$timeout', '$modal', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function BirdsEye($rootScope, $scope, $http, $stateParams, $window, $location, $timeout, $modal, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        
        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
        });
        

        var id;
         var minLength = 1;
    $scope.loading = false;
    $scope.toggle = true;
     $scope.selected={};

     $scope.birdsEyeLeftFull = true
     $scope.birdsEyeLeftEight = false
     $scope.birdsEyeRight = false


      // toggle column
      $scope.birdsEyeCollapse = function(){

        console.log('im, here');
        
        if($scope.birdsEyeLeftFull) {
            $scope.birdsEyeLeftFull = false
            $scope.birdsEyeLeftEight = true
            $scope.birdsEyeRight = true
        }else{
            $scope.birdsEyeLeftEight = false
            $scope.birdsEyeRight = false
            $scope.birdsEyeLeftFull = true
        }
      }



         var init = function() {
           Auth.getlocations(urls.GET_SUBTYPES, function(res) {
             $scope.subcategories = res;
            //console.log(res);
        },
         function() {
           
        });
        };
        init();


        var id;
        var info;
        
       var addressPointsToMarker = function(points, layer) {
              return points.map(function(ap, i) {

                var icon = {
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  }
                if( ap.subType.toLowerCase() == 'water atm') {
                        icon.iconUrl = './assets/img/type/water-atm.png'
                        icon.iconSize =  [40, 46]
                        icon.popupAnchor = [6, -32]
                }                
                else if( $rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {

                    icon.iconUrl = './assets/img/type/'+ap.pType.split(',')[0].toLowerCase()+'.png';

                } else {
                    icon.iconUrl = './assets/img/type/default.png'
                }

                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };
                
                try {
                  info = ap.images[0].imageLink;
                } catch(e) {
                  info = 'image'
                };                
                 
                return {
                  layer: layer,
                  id : ap.id,
                  idx: i,
                  userID: ap.user_id,
                  lat : parseFloat(ap.latitude),
                  lng : parseFloat(ap.longitude),
                  area : ap.area,
                  Address : ap.Address,
                  title: ap.Address,
                  subtype : ap.subType,
                  ptype : ap.pType,
                  uCode : ap.uCode,
                  image : info,
                  flag: false,
                  focus : false,
                  message :"<div ng-include src=\"'views/marker-popup.html'\"></div>",
                  draggable: true,
                  icon : icon
                };
              });
     };


     var new_place_added_to_marker = function(points) {
            return points.map(function(ap, i) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };
                return {
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    Address: ap.Address,
                    icon: {
                        iconUrl: './assets/img/marker-add.svg',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    }
                   
                };
            });
        };


    angular.extend($scope, {
      center: {
          lat: 23.728783,
          lng: 90.393791,
          zoom: 12,

        },
        defaults: {
                doubleClickZoom: false,
                scrollWheelZoom: true,
                map: {
                    contextmenu: true,
                    contextmenuWidth: 140,
                    contextmenuItems: [
                        {
                            text: 'Add Place Here',
                            callback: go_to_retool
                        }
                    ]
                }
            },

    events: {
        map: {
            enable: ['moveend', 'popupopen', 'contextmenu'],
            logic: 'emit'
        },
        marker: {
           enable: [ 'click', 'dblclick', 'dragend' ],
            logic: 'emit'
        }
    },
      layers: {
                    baselayers: {
                      // googleTerrain: {
                      //       name: 'Google Terrain',
                      //       layerType: 'TERRAIN',
                      //       type: 'google'
                      //   },

                      barikoi: {
                            name: 'barikoi',
                            url: 'http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png',
                            type: 'xyz',
                            layerOptions: {
                                attribution: 'Barikoi',
                                maxZoom: 23
                            },
                        },

                      bkoi: {
                    name: 'Barikoi',
                    type: 'wms',
                    url: 'http://13.229.51.147:8080/geoserver/barikoi/wms?',
                    visible: true,
                    layerOptions: {
                        layers: 'barikoi:bd_custom',
                        format: 'image/png',
                        // opacity: 0.25,
                        attribution: 'bkoi',
                        crs: L.CRS.EPSG3857,
                        maxZoom: 23
                    }
                },

                      osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            maxZoom: 22
                        },
                    },

                        mapbox_light: {
                            name: 'Mapbox Streets',
                            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                            type: 'xyz',
                            layerOptions: {
                                apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                                mapid: 'mapbox.streets',
                                maxZoom: 23
                            }
                        }
                        
                    },

                    overlays: {
                        new: {
                            type: 'group',
                            name: 'new',
                            visible: false
                        },

                        updated: {
                            type: 'group',
                            name: 'updated',
                            visible: false
                        }
                    }
                }
            });

    function go_to_retool (e, args) {
            console.log(e);
            DataTunnel.set_data(e)

            var modalInstance = $modal.open({
                templateUrl: '../../views/dtool/retool-modal.html',
                controller: 'Retool',
                size: 'lg',
                resolve: {
                    loc: function() {
                        return $scope.place;
                    }
                },
                backdrop: 'static'
            });

        }
    
    $http.get(urls.MAP_CODE)
      .success(function(data) {
            var data_array_add = data['Added Today'];
            $scope.markers_add = addressPointsToMarker(data_array_add, 'new');
            var data_array_update = data['Updated Today']
            $scope.markers_update = addressPointsToMarker(data_array_update, 'updated');
            $scope.markers = $scope.markers_add.concat($scope.markers_update)

           bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
        })
        .error(function() {
           
           bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                   
        })

    


    $scope.set_subtype = function(subtype) {
        bsLoadingOverlayService.start({
                referenceId: 'first'
        });

        console.log(subtype);
        Auth.get_with_params(urls.PLACE_BY_TYPE+'subType='+subtype.subtype, function(res) {
                bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                     $scope.total = res.Total;
                     $scope.markers = addressPointsToMarker(res.Places, 'new');
        },function() {
            
             bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                   // swal($rootScope.error);
        });
    };

     DataTunnel.subscribe($scope, function somethingChanged() {
        // Handle notification
        $scope.notifications++;
    });


    // $scope.set_road = function(road) {
    //     bsLoadingOverlayService.start({
    //             referenceId: 'first'
    //     });
    //     var data = {
    //       'data' : road
    //     };
        
    //     Auth.post_anything(urls.PLACE_BY_ROAD, data, function(res) {
    //             bsLoadingOverlayService.stop({
    //                     referenceId: 'first'
    //                 });
    //             $scope.markers = addressPointsToMarker(res.Places)
    //                 // console.log(DataTunnel.publish());
    //                  $scope.total = res["Total"];
    //     },function() {
            
    //         bsLoadingOverlayService.stop({
    //                     referenceId: 'first'
    //                 });
    //                 //swal($rootScope.error);
    //     });
    // };

    // $scope.set_ward = function(ward) {
    //     bsLoadingOverlayService.start({
    //             referenceId: 'first'
    //     });
       
        
    //     Auth.get_with_params(urls.PLACE_BY_WARD+"ward="+ward, function(res) {
    //              bsLoadingOverlayService.stop({
    //                     referenceId: 'first'
    //                 });
    //                  $scope.total = res["Total"];
    //                  $scope.markers = addressPointsToMarker(res.Places);
    //     },function() {
             
    //         bsLoadingOverlayService.stop({
    //                     referenceId: 'first'
    //                 });
    //                 //swal($rootScope.error);
    //     });
    // };

    $scope.onSelect = function(user){
      $scope.selected = user;
      console.log(user);
      $scope.markers.m1.lat = parseFloat($scope.selected.latitude);
      $scope.markers.m1.lng = parseFloat($scope.selected.longitude)
      $scope.center.lat = parseFloat($scope.selected.latitude);
      $scope.center.lng = parseFloat($scope.selected.longitude);
    };

    $scope.changeCenter = function (marker) {
        $scope.center.lat = marker.lat;
        $scope.center.lng = marker.lng;
        DataTunnel.set_data(marker);
        marker.focus = true;
    };


    $scope.users = function(userName) {
      if (userName.length < minLength) {
        return [];
      }
      $scope.loading = true;
      return Auth.getUsers(userName).then(function(data){
        $scope.loading = false;
            $scope.markers = addressPointsToMarker(data.places, 'new');
            console.log(data.places);
            return data.places;
      }, function(status){
        $scope.loading = false;
         //$rootScope.error = 'Failed to fetch data';
            $timeout(function(){
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                     $scope.markers = [];
            }, 2000);
      });
    };

    $scope.openSlide = function() {
      $scope.toggle = !$scope.toggle;
    };

    // $scope.$on("leafletDirectiveMap.dblclick", function(event, args) {
    //         console.log(args);
    //         //   $scope.markers = [];
    //         //  bsLoadingOverlayService.start({
    //         //         referenceId: 'first'
    //         // });


    //         DataTunnel.set_data(args.leafletEvent)

    //         var modalInstance = $modal.open({
    //             templateUrl: '../../views/dtool/retool-modal.html',
    //             controller: 'Retool',
    //             size: 'lg',
    //             resolve: {
    //                 loc: function() {
    //                     return $scope.place;
    //                 }
    //             }
    //         });


    //     });

     $scope.$on("leafletDirectiveMarker.click", function(event, args) {
            DataTunnel.set_data(args.model)
      });


     $rootScope.$on("mk-del", function(event, data) {
                console.log($scope.markers[data.idx])
                $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-dlt.svg';
                // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
                //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
                //$scope.markers.splice(data.idx, 1);
            })

     $rootScope.$on("mk-upd", function(event, data) {
                
                $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-upd.svg';
                // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
                //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
                //$scope.markers.splice(data.idx, 1);
        });

      $rootScope.$on("mk-muv", function(event, data) {
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-muv.svg';
        });

        $rootScope.$on("mk-new", function(event, data) {
            var tempary = [];
            tempary.push(data)
               var temp = new_place_added_to_marker(tempary, 'new')
               console.log(temp)
                $scope.markers.push(temp[0])

               
            })



        $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
            var data = {
                'latitude': args.model.lat,
                'longitude': args.model.lng,
            }

            swal({
                    title: "Are you sure?",
                    // text: "You will not be able to recover this imaginary file!",   
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, update marker position!",
                    closeOnConfirm: true
                },
                function(isConfirm) {
                    if (isConfirm) {
                        Auth.updateSomething2(urls.DROP_MARKER + args.model.id + "?longitude=" + args.model.lng + "&latitude=" + args.model.lat, function(res) {
                            // swal("Done", "marker position has been updated");
                            //$scope.markers = $scope.markers;
                           
                            $scope.markers[args.model.idx].lat = args.model.lat;
                            $scope.markers[args.model.idx].lng = args.model.lng; 
                            console.log('event handeled success');

                        }, function() {
                            args.model.lat = $scope.markers[args.model.idx].lat;
                            args.model.lng = $scope.markers[args.model.idx].lng;
                            // $scope.markers = $scope.markers;
                        })
                    } else {

                        $scope.$apply(function() {
                            console.log($scope.markers[args.model.idx]);
                            $scope.markers[args.model.idx].flag = !$scope.markers[args.model.idx].flag;
                        });
                       

                    }


                });

        });



        $scope.edit_address = function(referenceId, address, id) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });

            var data = {
                'Address' : address,
                
            }
            console.log(address);
            console.log(id);
            
            
            //Send Data Through Auth Service.......
            //Auth Service IS Responsible for Handling Http Request and Authentication......................
            Auth.updateSomething(urls.UPDATE_ADDRESS+id, data, function(res) {
                bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal("Success", res)
            },function(error) {
                bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal(error);
            })
        };

        $scope.set_date_interval = function() {
       bsLoadingOverlayService.start({
          referenceId: 'first'
        });
   
       $http({   
              method: 'GET',
              url: urls.MAP_CODE+"?dateFrom="+moment($scope.date2).format('YYYY-MM-DD')+"&dateTill="+moment($scope.date1).format('YYYY-MM-DD'),
              headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function(data) {
           $timeout(function(){
                   console.log($scope.bike);
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
              }, 2000);
           $scope.markers = addressPointsToMarker(data.Message, 'new');
           console.log($scope.markers);
                $scope.total = $scope.markers.length;
                // $scope.income_todays = data["Todays Income"];
                // $scope.income_total = data["Total Income"];
                $scope.count_total = data["Total Added"];
          }).error(function(err) {
             $timeout(function(){
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                }, 2000);
          })
     
    };


  }

}());