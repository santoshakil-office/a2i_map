(function() {


    'use strict';

    angular.module('barikoi')
        .factory('MapGeo', function() {

             var o = Math.round,
                    r = Math.random,
                    s = 255;

            function get_color() {
               
                return "rgb(" + o(r() * s) + "," + o(r() * s) + "," + o(r() * s) + ")";
                //return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
            }

            function get_task_polygon_color(feat) {
                switch (feat.properties.task_status) {
                    case 1:
                        return 'rgba(150, 0, 0' + r().toFixed(1) + ')'; // status ongoing
                        break;

                    case 2:
                        return 'rgba(0,0, 150' + r().toFixed(1) + ')'; // status Finished
                        break;

                    case 3:
                        return 'rgba(0,150, 0' + r().toFixed(1) + ')'; // status Evaluated
                        break;

                    default:
                        return 'rgba(150,150, 0' + r().toFixed(1) + ')'; // status Initialized
                        break;
                }

            }


            return {


                geo_style_rand: function() {
                    return {
                        fillColor: get_color(),
                        opacity: 2,
                        color: get_color(),
                        dashArray: "3",
                        fillOpacity: 0.1,
                    };
                },

                geo_style_custom_task: function(feat) {
                    return {
                        fillColor: get_task_polygon_color(feat),
                        opacity: 2,
                        color: get_task_polygon_color(feat),
                        dashArray: "3",
                        fillOpacity: 0.4,
                    };
                }
            };
        });

}());