'use strict';

angular.module('toHELL')
/**
 * RoadMap Drag directive
 */
    .directive('roadmapDrag', function ($document) {

        var targetElem,
            platform,
            startPoint = {
                x : 0,
                y : 0,
                ox : 0,
                oy : 0
            };


        return {
            restrict: 'A',
            link : function(scope, elem){
                if (!platform){
                    platform = scope.package.appPlatform == 'ios' ? 0.5 : 0.4;
                }
                elem.on('mousedown', startDrag);
                $document.on('mouseup', function(){
                    $document.off('mousemove', move);
                });
            }
        };

        // 开始拖动block
        function startDrag(e){
            targetElem = angular.element(e.currentTarget);
            var ofs = targetElem.parent().offset();
            var rc = targetElem[0].getBoundingClientRect();
            $document.on('mousemove', move);
            startPoint.x = e.pageX - rc.left;
            startPoint.y = e.pageY - rc.top;
            startPoint.ox = ofs.left;
            startPoint.oy = ofs.top;
        }

        // 拖动block动作
        function move(e){
            var top = e.pageY - startPoint.y - startPoint.oy,
                left = e.pageX - startPoint.x - startPoint.ox,
                lines = targetElem.attr('data-lines').split(' '),
                id = targetElem.attr('id'),
                curId = id.match(/block-(\d+)/)[1],
                order = targetElem.attr('data-order'),
                height = parseInt(targetElem.height()),
                width = parseInt(targetElem.width());

            top = top.crop(0, 9999);
            left = left.crop(0, 9999);

            // 移动线
            lines.forEach(function(line){
                line = line.split('-');
                var dir = line[0], lid = line[1],lineElem, nextElem=angular.element('#block-'+lid),
                    norder=nextElem.attr('data-order');
                if (dir === 'to'){
                    lineElem = angular.element('#from-'+curId+'-to-'+lid);
                    lineElem.attr({
                        x1 : order > norder ? left : left+width,
                        y1 : top + height * 0.5
                    });
                }else if (dir === 'from'){
                    lineElem = angular.element('#from-'+lid+'-to-'+curId);
                    lineElem.attr({
                        x2 : order > norder ? left : left+width,
                        y2 : top + height * 0.5
                    });
                }
            });

            // 移动block
            targetElem.css({
                top : top + 'px',
                left : left.crop(0, 9999) + 'px'
            });
        }
    })

    // 自定义指令处理svg的attribute报错问题
    .directive('ngBindAttrs', function() {
        return function(scope, element, attrs) {
            scope.$watch(attrs.ngBindAttrs, function(value) {
                angular.forEach(value, function(value, key) {
                    attrs.$set(key, value);
                })
            }, true)
        }
    });