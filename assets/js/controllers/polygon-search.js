(function () {
  "use strict";

  var barikoi = angular.module("barikoi");
  barikoi.controller("PolygonSearch", PolygonSearch);
  barikoi.filter('searchFilter', searchFilter);

  PolygonSearch.$inject = [
    "$scope",
    "$modal",
    "$http",
    "$stateParams",
    "$window",
    "$anchorScroll",
    "$location",
    "$timeout",
    "leafletData",
    "urls",
    "Auth",
    "DataTunnel",
    "bsLoadingOverlayService"
  ];

  function PolygonSearch(
    $scope,
    $modal,
    $http,
    $stateParams,
    $window,
    $anchorScroll,
    $location,
    $timeout,
    leafletData,
    urls,
    Auth,
    DataTunnel,
    bsLoadingOverlayService
  ) {
    leafletData.getMap().then(function (map) {
      $timeout(function () {
        map.invalidateSize();
        //create bounds
      }, 500);
    });

    var init = function () {
      Auth.getlocations(
        urls.POLYGON,
        function (res) {
          $scope.areas = res.area;
          var coordinates = [];
          var temp = [];
          $scope.areas.map(function (area) {
            var polyjson = JSON.parse(area["ST_AsGeoJSON(area)"]);
            //console.log(polyjson.coordinates[0]);
            temp.push(polyjson.coordinates[0]);
            // console.log(array.concat(polyjson.coordinates[0]));
          });
          coordinates = temp;
          // console.log(coordinates);
          //             var array1 = [[1, 2, 3],[4, 5, 6]];
          // var array2 = [[7, 8, 9],[10, 11, 12]]

          // console.log(array1.concat(array2));

          $scope.areas.push({
            id: -1,
            name: "all",
            "ST_AsGeoJSON(area)": JSON.stringify({
              type: "Polygon",
              coordinates: coordinates
            })
          });
        },
        function () {}
      );
      Auth.getlocations(
        urls.GET_SUBTYPES,
        function (res) {
          $scope.subcategories = res;
          $scope.subcategories.push({
            subtype: "all"
          });
          //console.log(res);
        },
        function () {}
      );
    };
    init();

    var id;
    var info;
    var addressPointsToMarkers = function (points) {
      return points.map(function (ap) {
        if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
          console.log(ap.latitude, ap.longitude);
          ap.latitude = 23.2433323;
          ap.longitude = 90.02433323;
        }

        var icon = {
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 35],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }
        if (ap.subType.toLowerCase() == 'water atm') {
          icon.iconUrl = './assets/img/type/water-atm.png'
          icon.iconSize = [40, 46]
          icon.popupAnchor = [6, -32]
        } else if ($rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {

          icon.iconUrl = './assets/img/type/' + ap.pType.split(',')[0].toLowerCase() + '.png';

        } else {
          icon.iconUrl = './assets/img/type/default.png'
        }

        info =
          "<div><p>Address: " +
          ap.Address +
          "<br></p><p>Subtype: " +
          ap.subType +
          "<br></p><p>Code: " +
          ap.uCode +
          "</p></div>";
        return {
          layer: ap.subType,
          id: ap.id,
          lat: parseFloat(ap.latitude),
          lng: parseFloat(ap.longitude),
          focus: false,
          Address: ap.Address,
          area: ap.area,
          subtype: ap.subType,
          ptype: ap.pType,
          uCode: ap.uCode,
          userID: ap.user_id,
          updated_at: ap.updated_at,
          message: "<div ng-include src=\"'views/marker-popup.html'\"></div>",
          draggable: true,
          icon: icon
        };
      });
    };

    angular.extend($scope, {
      center: {
        lat: 23.728783,
        lng: 90.393791,
        zoom: 12
      },
      controls: {
        draw: {}
      },
      events: {
        map: {
          enable: ["moveend", "popupopen", "dblclick"],
          logic: "emit"
        },
        marker: {
          enable: ["click", "dblclick", "dragend"],
          logic: "emit"
        }
      },
      layers: {
        baselayers: {
          bkoi: {
            name: "barikoi",
            url: "http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png",
            type: "xyz",
            layerOptions: {
              attribution: "Barikoi",
              maxZoom: 23
            }
          },

          mapbox_light: {
            name: "Mapbox Streets",
            url: "http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}",
            type: "xyz",
            layerOptions: {
              apikey: "pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w",
              mapid: "mapbox.streets",
              attribution: "barikoi",
              maxZoom: 23
            },
            layerParams: {
              showOnSelector: true
            }
          },

          osm: {
            name: "OpenStreetMap",
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            type: "xyz",
            layerOptions: {
              maxZoom: 23
            }
          },

          googleTerrain: {
            name: "Google Terrain",
            layerType: "TERRAIN",
            type: "google",
            layerOptions: {
              attribution: "barikoi",
              maxZoom: 23
            }
          }
        },
        overlays: {
          draw: {
            name: "draw",
            type: "group",
            visible: true,
            layerParams: {
              showOnSelector: false
            }
          }
        }
      },
      toggleLayer: function (subtype) {
        $scope.layers.overlays[subtype.name].visible = !$scope.layers.overlays[subtype.name].visible;
        const propOwn = Object.getOwnPropertyNames($scope.layers.overlays);
        // console.log(propOwn.length);

        // console.log(propOwn.length);

        // $scope.subtypeFilters['RESIDENTIAL'] = false;
        // $scope.subtypeFilters['NON-RESIDENTIAL'] = false;
      },
      toggleSubtypes: function (ptype) {
        var subtypes = $scope.resPlaces.filter(place => {
          if (ptype.toUpperCase() === 'RESIDENTIAL' && place.pType.toUpperCase() === ptype.toUpperCase()) {
            return place.subType;
          } else if (ptype.toUpperCase() === 'NON-RESIDENTIAL' && place.pType.toUpperCase() !== 'RESIDENTIAL') {
            return place.subType;
          }
        });

        subtypes = subtypes.map(place => place.subType.toUpperCase());
        subtypes = subtypes.filter((place, index, self) => self.indexOf(place) === index);
        // console.log(subtypes);
        subtypes.forEach(place => {
          if ($scope.subtypeFilters[ptype] === true) {
            // $scope.subtypeFilters[place] = !$scope.subtypeFilters[place];
            // $scope.layers.overlays[place].visible = !$scope.layers.overlays[place].visible;
            $scope.subtypeFilters[place] = true;
            $scope.layers.overlays[place].visible = true;
            // console.log('IF');
          } else if ($scope.subtypeFilters[ptype] === false) {
            $scope.subtypeFilters[place] = false;
            $scope.layers.overlays[place].visible = false;
            // console.log('ELSE');
          }

        });
      },
      toggleList: function () {
        var myEl = angular.element(document.querySelector('.dropdown-content'));
        myEl.toggleClass('show-dropdown-content');
      }
    });


    $scope.subtypeFilters = new Object();
    // $scope.subtypeFilters = { RESIDENTIAL: true, NON-RESIDENTIAL: true };

    leafletData.getMap().then(function (map) {
      leafletData.getLayers().then(function (baselayers) {
        var drawnItems = baselayers.overlays.draw;
        map.on("draw:created", function (e) {
          var layer = e.layer;
          drawnItems.addLayer(layer);
          //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
          var array = [];
          layer.toGeoJSON().geometry.coordinates[0].map(function (ary) {
            array.push(ary.join(" "));
          });
          var coordinates = array.reduce(
            (accumulator, currentValue) => accumulator.concat(currentValue),
            []
          );

          // console.log(coordinates.toString());
          Auth.get_with_params(
            urls.POLYGON_CUSTOM + "area=" + coordinates.toString(),
            function (res) {
              $scope.total = res.Total;
              // console.log(res.places)
              $scope.resPlaces = res.places;
              // console.log(res);
              // var ptypes = res.places.map(place => place.pType.toUpperCase() && place.subType.toUpperCase() );
              // // var ptypes = res.places.map(place => { pType: place.pType.toUpperCase(), subType: place.subType.toUpperCase() });

              // console.log(ptypes);
              // // ptypes = ptypes.filter(ptype => ptypes.indexOf(ptype) > -1)
              // ptypes = ptypes.filter((place, index, self) => self.indexOf(place) === index);
              // console.log(ptypes);

              var ptypes = []
              res.places.map(place => ptypes.push({
                [place.pType.toUpperCase()]: place.subType.toUpperCase()
              }));
              // console.log(ptypes);
              // test.filter((place, index, self) => self.indexOf(place) === index);
              // console.log(test);

              var subtypes = res.places.map(place => place.subType.toUpperCase());
              subtypes = subtypes.filter((place, index, self) => self.indexOf(place) === index);
              // console.log(subtypes);
              // console.log(subtypes.length);
              $scope.totalSubtypes = subtypes.length;

              // function capitalizeFirstLetter(string) {
              //   return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
              // }
              // console.log(capitalizeFirstLetter('aluKhosr'))


              // subtypes.map(ptype => (capitalizeFirstLetter(ptype)))
              // subtypes.map(ptype => (ptype:op))
              $scope.ptypeArray = [];
              $scope.array = [];

              // var overlayPtypeObj = ptypes.reduce((obj, item, i) => {
              //   // item = item.toUpperCase();
              //   // $scope.subtypes = item;
              //   // if(item === 'RESIDENTIAL') {
              //   //   $scope.ptypeArray.push({ name: 'RESIDENTIAL', RESIDENTIAL: true, })
              //   // }
              //   $scope.ptypeArray.push({name: item, [item]: true});
              //   // $scope.subtypeFilters[item] = true;
              //   // $scope.array.push({key: i, name: item});
              //   obj[item] = { name: item.toLowerCase(), type: "group", visible: true };

              //   return obj
              // }, {})
              // console.log($scope.ptypeArray);

              var overlayObj = subtypes.reduce((obj, item, i) => {
                // a[c[0]] = c[0]
                item = item.toUpperCase();
                $scope.subtypes = item;
                if ($scope.array.indexOf(item) === -1) {
                  $scope.array.push({
                    name: item,
                    selected: true
                  });
                  $scope.subtypeFilters[item] = true;
                }
                // $scope.array.push({key: i, name: item});
                obj[item] = {
                  name: item.toLowerCase(),
                  type: "group",
                  visible: true
                };

                return obj
              }, {})
              $scope.subtypeFilters['RESIDENTIAL'] = true;
              $scope.subtypeFilters['NON-RESIDENTIAL'] = true;
              // console.log(overlayObj)
              // console.log($scope.array)
              // console.log($scope.subtypeFilters);
              $scope.selectedSubtype = $scope.array[0];

              // console.log(JSON.stringify(overlayObj))
              // // var obj = {...subtypes}
              // console.log(obj)


              //   res.places.filter(function onlyUnique(value, index, self) { 
              //     return self.indexOf(value) === index;
              // })
              angular.extend($scope, {
                center: {
                  lat: res.places[0].latitude,
                  lng: res.places[0].longitude,
                  zoom: 13
                },
                markers: [],
                layers: {

                  overlays: {
                    // subtypes.map(subtype => {
                    //   capitalizeFirstLetter(subtype): {
                    //     name: `${subtype.toLowerCase()}`,
                    //     type: 'group',
                    //     visible: true
                    //   }
                    // }),
                    // 'Bank Branch': {
                    //       name: 'bank branch',
                    //       type: 'group',
                    //       visible: true
                    //   },
                    // Shop: {
                    //     name: 'shop',
                    //     type: 'group',
                    //     visible: true
                    // },
                    ...overlayObj,
                    draw: {
                      name: "draw",
                      type: "group",
                      visible: true,
                      layerParams: {
                        showOnSelector: false
                      }
                    }
                  }
                }
              });
              $scope.markers = addressPointsToMarkers(res.places);
            },
            function () {
              swal("Error");
            }
          );
        });
      });
    });

    // $scope.subtypeFilters = new Object();
    //   $scope.subtypeFilters = {
    //     HOUSE: true,
    //     TAILOR: true
    // };

    // $scope.Filter = new Object();
    // $scope.Filter.name = {
    //   'HOUSE': 'HOUSE'
    // };

    // $scope.showSubtype = function(subtype) {
    //   return subtype.name === $scope.subtype.selected;
    // }

    $scope.set_area = function (area) {
      console.log(area);
      var polyjson = JSON.parse(area["ST_AsGeoJSON(area)"]);
      console.log(polyjson);
      $scope.id = JSON.parse(area["id"]);

      angular.extend($scope, {
        center: {
          lat: polyjson.coordinates[0][0][1],
          lng: polyjson.coordinates[0][0][0],
          zoom: 13
        },
        controls: {
          draw: {}
        },

        events: {
          map: {
            enable: ["moveend", "popupopen", "dblclick"],
            logic: "emit"
          },
          marker: {
            enable: ["click", "dblclick", "dragend"],
            logic: "emit"
          }
        },

        layers: {
          baselayers: {
            bkoi: {
              name: "barikoi",
              url: "http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png",
              type: "xyz",
              layerOptions: {
                attribution: "Barikoi",
                maxZoom: 23
              }
            },

            googleTerrain: {
              name: "Google Terrain",
              layerType: "TERRAIN",
              type: "google"
            },

            osm: {
              name: "OpenStreetMap",
              url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              type: "xyz",
              layerOptions: {
                maxZoom: 23
              }
            }
          },
          overlays: {
            draw: {
              name: "draw",
              type: "group",
              visible: true,
              layerParams: {
                showOnSelector: false
              }
            }
          }
        },
        geojson: {
          data: {
            type: "FeatureCollection",
            features: [{
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: polyjson.coordinates
              }
            }]
          },
          style: {
            weight: 2,
            opacity: 1,
            color: "red",
            dashArray: "3",
            fillOpacity: 0
          }
        }
      });
      $scope.markers = {};
    };

    $scope.set_subType = function (area, subtype) {
      bsLoadingOverlayService.start({
        referenceId: "first"
      });
      if (area == undefined) {
        area = "";
      }
      // if (subtype==undefined) {subtype = '';}

      Auth.get_with_params(
        urls.PLACE_BY_AREA + "area" + "=" + area + "&subType" + "=" + subtype,
        function (res) {
          bsLoadingOverlayService.stop({
            referenceId: "first"
          });
          $scope.total = res.Total;
          $scope.markers = addressPointsToMarkers(res.places);
        },
        function () {
          bsLoadingOverlayService.stop({
            referenceId: "first"
          });
        }
      );
    };

    $scope.$on("leafletDirectiveMarker.click", function (event, args) {
      DataTunnel.set_data(args.model);
    });

    $scope.openSlide = function () {
      $scope.toggle = !$scope.toggle;
    };

    $scope.$watch("mapView", function (value) {
      console.log($scope.mapView);
      if (value === true) {
        leafletData.getMap().then(function (map) {
          $timeout(function () {
            map.invalidateSize();
            //create bounds
            leafletData.getMap().then(function (map) {
              if ($scope.mapBounds.length < 1) {
                $scope.mapBounds.push([
                  $scope.location.coords.longitude,
                  $scope.location.coords.latitude
                ]);
              }
              var bbox = L.latLngBounds($scope.mapBounds);
              $scope.maxBounds.southWest = bbox.getSouthWest();
              $scope.maxBounds.northEast = bbox.getNorthEast();
              map.fitBounds(bbox);
            });
          }, 300);
        });
      }
    });

    $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
      var data = {
        latitude: args.model.lat,
        longitude: args.model.lng
      };

      swal({
          title: "Are you sure?",
          // text: "You will not be able to recover this imaginary file!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, update marker position!",
          closeOnConfirm: false
        },
        function () {
          Auth.updateSomething2(
            urls.DROP_MARKER +
            args.model.id +
            "?longitude=" +
            args.model.lng +
            "&latitude=" +
            args.model.lat,
            function (res) {
              swal("Done", "marker position has been updated");
            },
            function () {
              swal("Error");
            }
          );
        }
      );
    });

    $scope.$on("leafletDirectiveMap.dblclick", function (event, args) {
      console.log(args);
      //   $scope.markers = [];
      //  bsLoadingOverlayService.start({
      //         referenceId: 'first'
      // });
      args.leafletEvent;

      DataTunnel.set_data(args.leafletEvent);

      var modalInstance = $modal.open({
        templateUrl: "../../views/dtool/add-place.html",
        controller: "DtollPlaceAdd",
        size: "lg",
        scope: $scope,
        resolve: {
          loc: function () {
            return $scope.place;
          }
        }
      });
    });

    $scope.changeCenter = function (marker) {
      $scope.center.lat = marker.lat;
      $scope.center.lng = marker.lng;
      DataTunnel.set_data(marker);
      marker.focus = true;
    };

    $scope.edit_address = function (referenceId, address, id) {
      bsLoadingOverlayService.start({
        referenceId: referenceId
      });

      var data = {
        Address: address
      };
      console.log(address);
      console.log(id);

      //Send Data Through Auth Service.......
      //Auth Service IS Responsible for Handling Http Request and Authentication......................
      Auth.updateSomething(
        urls.UPDATE_ADDRESS + id,
        data,
        function (res) {
          bsLoadingOverlayService.stop({
            referenceId: "first"
          });
          swal("Success", res);
        },
        function (error) {
          bsLoadingOverlayService.stop({
            referenceId: "first"
          });
          swal(error);
        }
      );
    };


    // map marker set up for search

    let searchAddressPointsToMarkers = function (points) {
      return points.map(function (ap) {
        return {
          id: ap.id,
          lat: parseFloat(ap.latitude),
          lng: parseFloat(ap.longitude),
          message: ap.Address,
          pType: ap.pType,
          Address: ap.Address,
          subtype: ap.subType,
          uCode: ap.uCode,
          userID: ap.user_id,
          updated_at: ap.updated_at,
          icon: {
            iconUrl: "./assets/img/type/" +
              ap.pType.split(",")[0].toLowerCase() +
              ".png",
          }
        };
      });
    };

    // Address search (polygon)

    $scope.users = function (userName) {
      console.log(userName)
      if (userName.length < 0) {
        return [];
      }
      $scope.loading = true;
      return Auth.getUsers(userName).then(function (data) {

        console.log(data.places);
        // $rootScope.markers = addressPointsToMarkers(data.places);

        $scope.loading = false;
        return data.places;
      }, function (status) {
        $scope.loading = false;
      });
    };


    $scope.onSelect = function (user) {
      // console.log(user);
      $scope.center.lat = parseFloat(user.latitude);
      $scope.center.lng = parseFloat(user.longitude);
      // $scope.active = false;
      leafletData.getMap().then(function (map) {
        $timeout(function () {
          map.invalidateSize();
          //create bounds
        }, 1000);
      });


      var tempary = []
      tempary.push(user)

      $scope.markers = searchAddressPointsToMarkers(tempary)
    }

  }

  // searchFilter.$inject = ["$filter"];

  // function searchFilter() {
  //   return function(items, searchfilter) {
  //     var isSearchFilterEmpty = true;
  //     angular.forEach(searchfilter, function(searchstring) {
  //       if (searchstring != null && searchstring != "") {
  //         isSearchFilterEmpty = false;
  //       }
  //     });
  //     if (!isSearchFilterEmpty) {
  //       var result = [];
  //       angular.forEach(items, function(item) {
  //         var isFound = false;
  //         angular.forEach(item, function(term, key) {
  //           if (term != null && !isFound) {
  //             term = term.toString();
  //             term = term.toLowerCase();
  //             angular.forEach(searchfilter, function(searchstring) {
  //               searchstring = searchstring.toLowerCase();
  //               if (
  //                 searchstring != "" &&
  //                 term.indexOf(searchstring) != -1 &&
  //                 !isFound
  //               ) {
  //                 result.push(item);
  //                 isFound = true;
  //               }
  //             });
  //           }
  //         });
  //       });
  //       return result;
  //     } else {
  //       return items;
  //     }
  //   };
  // }

  function searchFilter() {
    return function (input, subtypes) {
      // console.log(input, subtypes);

      // var isSearchFilterEmpty = true;
      // angular.forEach(subtypes, function(searchstring) {
      //   if (searchstring != null && searchstring != "") {
      //     isSearchFilterEmpty = false;
      //   }
      // });

      if (input !== undefined && subtypes !== undefined) {
        var filteredList = [];

        for (var i = 0; i < input.length; i++) {
          for (var prop in subtypes) {
            if (subtypes[prop]) {
              if (
                (prop === 'RESIDENTIAL' &&
                  input[i].ptype.toUpperCase() === prop) ||
                input[i].subtype.toUpperCase() === prop
              ) {
                filteredList.push(input[i]);
                break;
              } else if (prop === 'NON-RESIDENTIAL' && input[i].ptype.toUpperCase() !== 'RESIDENTIAL') {
                filteredList.push(input[i]);
                break;
              }
            }
          }
        }
        // console.log(filteredList);
        // $scope.total = filteredList.length;
        return filteredList;
      }
      // else {
      //   return input;
      // }
    };
  }

})();