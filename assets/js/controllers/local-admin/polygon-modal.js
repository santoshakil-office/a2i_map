(function() {
  'use strict';

  angular
      .module('barikoi')
      .controller('LocalPolygonModal', LocalPolygonModal);

  LocalPolygonModal.$inject = ['$scope', '$http', '$modalInstance', 'Auth', 'urls', 'DataTunnel'];

  function LocalPolygonModal($scope, $http, $modalInstance, Auth, urls, DataTunnel) {

      
        $scope.city_corps = [{'cc_name': 'DNCC'},{'cc_name': 'DSCC'}];


        


      $scope.set_area = function(area) {
          Auth.getlocations(urls.SUBAREA_BY_AREA+area.id+'?', function(res) {
            $scope.subareas =res;
          },function(err) {

          });
      };

      $scope.road_number = DataTunnel.get_data().name
      



      
      $scope.ok = function() {
          $modalInstance.close();
      };


       $scope.create_zone_polygon = function(cc, zone) {
           
             var data = {
              zone_area: DataTunnel.get_data().toString(),
              city_corp: cc.cc_name,
              zone_number: zone,
            }
            console.log(data)

            Auth.setcategory(urls.POLYGON_ZONE+'?', data, function(res) {
                console.log(res);
                 swal("Nice!", "Zone Polygon Inserted ", "success");
                  $modalInstance.close();
              },function() {
                swal('Error');
            })
          }



        $scope.create_area_polygon = function(area, ward) {
           
             var data = {
              area_area: DataTunnel.get_data().toString(),
              area_name: area,
            }
             try {
              data['ward_id'] = ward.id;
          }
          catch(error) {
             console.log(data); 
          }

            Auth.setcategory(urls.POLYGON_AREA+'?', data, function(res) {
                console.log(res);
                 swal("Nice!", "Area Polygon Inserted ", "success");
                  $modalInstance.close();
              },function() {
                swal('Error');
            })
          }


          $scope.create_suparea_polygon = function(subarea, suparea) {
             var data = {
              supersubarea_area: DataTunnel.get_data().toString(),
              subarea_id: subarea.id,
              super_subarea_name: suparea,
            }

            console.log(data)

            Auth.setcategory(urls.POLYGON_SUPAREA+'?', data, function(res) {
                console.log(res);
                 swal("Nice!", "Super SubArea Polygon Inserted ", "success");
                  $modalInstance.close();
              },function() {
                swal('Error');
            })
          }


          $scope.create_subarea_polygon = function(area, subarea) {
             var data = {
              subarea_area: DataTunnel.get_data().toString(),
              area_id: area.id,
              subarea_name: subarea,
            }

            console.log(data)

            Auth.setcategory(urls.POLYGON_SUBAREA+'?', data, function(res) {
                console.log(res);
                 swal("Nice!", "SubArea Polygon Inserted ", "success");
                  $modalInstance.close();
              },function() {
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





      $scope.create_ward_polygon = function(zone, ward_num) {
           
             var data = {
              ward_area: DataTunnel.get_data().toString(),
              ward_number : ward_num,
              zone_id: zone.id
            }
            console.log(data)

            Auth.setcategory(urls.POLYGON_WARD+'?', data, function(res) {
                console.log(res);
                 swal("Nice!", "Ward Polygon Inserted ", "success");
                  $modalInstance.close();
              },function() {
                swal('Error');
            })
          }

      // $scope.changeFilterTo = function(pr) {
      //     $scope.filter = pr; 
      // }

      // $scope.myFilter = function(item){
      //     return !(item.subType == 'Home')
      // }

      // $scope.getdirection =  function(source) {
      //     if (source) {
      //         console.log(source);
      //         $scope.source = {'lat' : source.latitude, 'lng' : source.longitude}
      //     } else{
      //         $scope.place = this.getPlace().formatted_address;
      //         $scope.source = this.getPlace().geometry.location;
      //     }
      //     $scope.destination = {'lat' : $rootScope.currentlat, 'lng' : $rootScope.currentlng}
      // };

      $scope.create_road_polyline = function(area, subarea, road_number, number_of_lanes, speed) {

            var data = {
              road_geometry: DataTunnel.get_data().toString(),
              road_name_number: road_number,
              area_id: area.id,
              // subarea_id : subarea.id,
              road_condition: $scope.road_type.reduce(function (accumulator, currentValue) {
                  return accumulator + currentValue.name+', ';
              },'').replace(/,\s*$/, ""),
              number_of_lanes: number_of_lanes,
              avg_speed: speed
            }
            try {
              data['subarea_id'] = subarea.id;
          }
          catch(error) {
             console.log(data); 
          }
            // console.log(data)

            Auth.setcategory(urls.POLYLINE_ROAD+'?', data, function(res) {
                console.log(res);
                 swal("Nice!", "Road Polyline Inserted ", "success");
                 $modalInstance.close();
             },function() {
                swal('Error');
             })
     }



     $scope.update_road_polyline = function(road_number, number_of_lanes, speed) {
      console.log(DataTunnel.get_data())
            var id = DataTunnel.get_data().id;
            var poly = DataTunnel.get_data().poly.toString();
            var data = {
              road_geometry: poly,
              road_name_number: road_number,
              // area_id: area.id,
              // subarea_id : subarea.id,
              road_condition: $scope.road_type.reduce(function (accumulator, currentValue) {
                  return accumulator + currentValue.name+', ';
              },'').replace(/,\s*$/, ""),
              number_of_lanes: number_of_lanes,
              avg_speed: speed
            }
             console.log(data)

          Auth.updateSomething(urls.POLYLINE_ROAD+'/'+id, data, function(res) {
              swal("Done", "Polyline updated");
          },function() {
              swal("Error")
          }) 
     }

     $scope.update_name_polyline = function(road_number, number_of_lanes, speed) {
      console.log(DataTunnel.get_data())
            var id = DataTunnel.get_data().id;
            // var poly = DataTunnel.get_data().poly.toString();
            //$scope.road_number = DataTunnel.get_data().name
            var data = {
              // road_geometry: poly,
              road_name_number: road_number,
              // area_id: area.id,
              // subarea_id : subarea.id,
              // road_condition: $scope.road_type.reduce(function (accumulator, currentValue) {
              //     return accumulator + currentValue.name+', ';
              // },'').replace(/,\s*$/, ""),
              // number_of_lanes: number_of_lanes,
              // avg_speed: speed
            }
             console.log(data)

          Auth.updateSomething(urls.POLYLINE_ROAD+'/'+id, data, function(res) {
              swal("Done", "Polyline updated");
          },function() {
              swal("Error")
          }) 
     }
      

  }

}());