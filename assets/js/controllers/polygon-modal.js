(function () {
  'use strict';

  angular
    .module('barikoi')
    .controller('PolygonModal', PolygonModal);

  PolygonModal.$inject = ['$rootScope', '$scope', '$http', '$location', '$modalInstance', 'Auth', 'urls', 'DataTunnel'];

  function PolygonModal($rootScope, $scope, $http, $location, $modalInstance, Auth, urls, DataTunnel) {

    console.log($location.path() + 'haleluiah')
    $scope.tabpath = $location.path()
    $scope.city_corps = [{
      'cc_name': 'DNCC'
    }, {
      'cc_name': 'DSCC'
    }];



    $scope.set_area = function (area) {
      Auth.getlocations(urls.SUBAREA_BY_AREA + area.id + '?', function (res) {
        $scope.subareas = res;
      }, function (err) {

      });
    };

    Auth.getlocations(urls.CONTRIBUTER_LIST + 'all', function (res) {
        $scope.userlist = res;

      },
      function () {

      });

    $http.get(urls.GET_CATEGORY)
      .success(function (res) {
        $scope.ptypes = res;
        console.log(res);
      })
      .error(function (err) {
        console.log(err);
      })





    $scope.ok = function () {
      $modalInstance.close();
    };


    $scope.create_zone_polygon = function (cc, zone) {

      var data = {
        zone_area: DataTunnel.get_data().toString(),
        city_corp: cc.cc_name,
        zone_number: zone,
      }
      console.log(data)

      Auth.setcategory(urls.POLYGON_ZONE + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "Zone Polygon Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }



    $scope.create_area_polygon = function (area, ward) {

      var data = {
        area_area: DataTunnel.get_data().toString(),
        ward_id: ward.id,
        area_name: area,
      }
      console.log(data)

      Auth.setcategory(urls.POLYGON_AREA + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "Area Polygon Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }


    $scope.create_thana_polygon = function (thana) {

      var data = {
        geom: DataTunnel.get_data().toString(),
        thana: thana,
      }
      console.log(data)

      Auth.setcategory(urls.POLYGON_THANA + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "Thana Polygon Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }


    $scope.create_suparea_polygon = function (subarea, suparea) {
      var data = {
        supersubarea_area: DataTunnel.get_data().toString(),
        subarea_id: subarea.id,
        super_subarea_name: suparea,
      }

      console.log(data)

      Auth.setcategory(urls.POLYGON_SUPAREA + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "Super SubArea Polygon Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }


    $scope.create_subarea_polygon = function (area, subarea) {
      var data = {
        subarea_area: DataTunnel.get_data().toString(),
        area_id: area.id,
        subarea_name: subarea,
      }

      console.log(data)

      Auth.setcategory(urls.POLYGON_SUBAREA + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "SubArea Polygon Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }





    $scope.create_ward_polygon = function (zone, ward_num) {

      var data = {
        ward_area: DataTunnel.get_data().toString(),
        ward_number: ward_num,
        zone_id: zone.id
      }
      console.log(data)

      Auth.setcategory(urls.POLYGON_WARD + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "Ward Polygon Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }




    $scope.data_fix = function (x, y, area_flag) {
      console.log('area flag')
      console.log(area_flag)
      var data = {
        polygon: DataTunnel.get_data().toString(),
      }

      try {
        data.x = x.toString();
      } catch (e) {
        console.log(e);
        data.x = ""
      }

      try {
        data.y = y.toString();
      } catch (e) {
        data.y = ""
      }
      console.log(data);

      if (!area_flag) {
        swal({
            title: "Are you sure?",
            // text: "You will not be able to recover this imaginary file!",   
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, update!",
            closeOnConfirm: false
          },
          function () {
            Auth.get_with_params(urls.POLYGON_DATA_FIX + 'polygon=' + data.polygon + '&x=' + data.x + '&y=' + data.y, function (res) {
              console.log(res);
              $rootScope.$broadcast("action-status");
              console.log('Still propagating ..')
              $modalInstance.close();
              swal("Nice!", "Updated ", "success");
            }, function (err) {
              swal("Error", "error occured ", "error");
            })

          });
      } else {

        swal({
            title: "Are you sure?",
            // text: "You will not be able to recover this imaginary file!",   
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, update!",
            closeOnConfirm: false
          },
          function () {
            Auth.get_with_params(urls.POLYGON_DATA_FIX + 'polygon=' + data.polygon + '&x=' + data.x + '&y=' + data.y + '&area=' +area_flag , function (res) {
              console.log(res);
              $modalInstance.close();
              swal("Nice!", "Updated ", "success");
            }, function (err) {
              swal("Error", "error occured ", "error");
            })

          });
      }


    }

    $scope.data_dlt = function (pType, user) {
      var data = {
        polygon: DataTunnel.get_data().toString(),
      };

      try {
        data.pType = pType.type.toString();
      } catch (e) {
        console.info("Ptype Not selected");
      }
      try {
        data.user_id = user.id.toString();
      } catch (e) {
        console.info("user Not selected");
      }

      console.log(data)

      swal({
          title: "Are you sure?",
          // text: "You will not be able to recover this imaginary file!",   
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, Delete!",
          closeOnConfirm: true
        },
        function () {
          Auth.delete_anything_json(urls.POLYGON_DATA_DLT, data, function (res) {
            console.log(res);
            $rootScope.$broadcast("action-status");
            $modalInstance.close();
            swal("Nice!", "Data Deleted ", "success");
          }, function (err) {
            swal("Error", "error occured ", "error");
          })

        });
    }





    $scope.create_road_polyline = function (area, subarea, road_number, number_of_lanes, speed) {

      var data = {
        road_geometry: DataTunnel.get_data().toString(),
        road_name_number: road_number,
        area_id: area.id,
        // subarea_id : subarea.id,
        road_condition: $scope.road_type.reduce(function (accumulator, currentValue) {
          return accumulator + currentValue.name + ', ';
        }, '').replace(/,\s*$/, ""),
        number_of_lanes: number_of_lanes,
        avg_speed: speed
      }
      try {
        data['subarea_id'] = subarea.id;
      } catch (error) {
        console.log(data);
      }
      // console.log(data)

      Auth.setcategory(urls.POLYLINE_ROAD + '?', data, function (res) {
        console.log(res);
        swal("Nice!", "Road Polyline Inserted ", "success");
        $modalInstance.close();
      }, function () {
        swal('Error');
      })
    }


  }

}());