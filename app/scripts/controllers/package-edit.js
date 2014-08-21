'use strict';

angular.module('toHELL')
    .controller('PackageEditCTRL', function ($scope, $routeParams, $document, ENV, formDataObject, $location, backendService, editService, $timeout, notifyService, accountService) {
        if (!accountService.isLoggedIn()) {
            $location.path('/');
            return;
        }

        $scope.fileRoot = ENV.pkgRoot + $routeParams.pkgId + '/';

        /**
         * 存储当前的编辑状态
         * @var {Object}
         */

        $scope.editStat = {
            selectedScene: null,
            selectedElement: null,
            selectedAction: null,
            gotoSignStyle: {
                top: '',
                right: ''
            },
            gotoLineStyle: {
                width: '264px'
            },
            sceneHasAdded: false // 表示场景列表中是否有后添加的场景。这个变量与新增场景自动聚焦相关。
        };

        /**
         * 获取工程数据，本地存储为 $scope.package
         */

        $scope.package = {};

        backendService.getPackage({
            pkgId: $routeParams.pkgId,
            token: accountService.getLoggedInUser().token
        }, function (result) {
            $scope.package = result[0];
            editService.setPackage($scope.package);
            editService.setStat($scope.editStat);

            $scope.size = $scope.package.appPlatform === 'ios' ? {
                width: 320,
                height: 568
            } : {
                width: 400,
                height: 640
            };

            // 默认选中第一个场景
            var sceneId = editService.findScene('order', 0);
            $scope.selectScene(sceneId);
        });

        editService.setStat($scope.editStat);

        for (var attr in editService) {
            if (editService.hasOwnProperty(attr)) {
                $scope[attr] = editService[attr];
            }
        }

        /**
         * 编辑区空白区域点击时调用此函数，用以清除已选元素、动作
         */

        $scope.onBackgroundClick = function () {
            editService.deselectElement();
        };

        $scope.onActorItemClick = function (element) {
            editService.selectElement(element);
        };

        /**
         * 图标上传和背景图上传
         */

        function uploadDataFormater(postArgs, attrs) {
            postArgs.url = ENV.apiHost + 'uploadImage/';
            postArgs.transformRequest = formDataObject;
            postArgs.data = {
                appid: $scope.package.appID,
                fileName: attrs.current,
                file: postArgs.data.files[0]
            };
            return postArgs;
        }

        $scope.iconUploadHandlers = {
            before: uploadDataFormater,
            after: function (info) {
                $scope.package.icon = info.fileName;
            },
            onError: backendService.errLogger
        };

        $scope.sceneBgUploadHandlers = {
            before: uploadDataFormater,
            after: function (data) {
                $scope.editStat.selectedScene.background = data.fileName;
            },
            onError: backendService.errLogger
        };

        /**
         * 保存编辑好的项目JSON数据
         */

        $scope.$on('package.save', function () {

            backendService.savePackage($scope.package, function () {
                notifyService.notify('已保存！');
            });

        });

        $scope.$on('goview.roadmap', function () {
            var scenes = angular.element('.scenes-list li'),images=[],len=scenes.length;
            scenes.each(function(i,scene){
                html2canvas(scene, {
                    allowTaint: true,
                    onrendered: function(canvas) {
                        images.push(canvas.toDataURL("image/png"));
                        console.log(images[i]);
                        if(i==len-1){
                            $scope.$apply(function () {
                                $location.path('/roadmap/'+$routeParams.pkgId);
                            });
                            localStorage.setItem('dataImgs' + $routeParams.pkgId,images.join('||'));
                        }
                    }
                });
            });

        });

        /**
         * 响应键盘动作
         */

        $scope.$on('keydown', function (onEvent, keyEvent) {

            switch (keyEvent.keyCode) {
                case 8:
                    // 酌情阻止 Backspace 后退
                    if (keyEvent.target.tagName === 'INPUT') {
                        // 如果焦点在输入框内，则阻止冒泡
                        keyEvent.stopPropagation();
                    }
                    else if ($scope.editStat.selectedElement) {
                        // 如果有选中 element
                        keyEvent.preventDefault();
                        keyEvent.stopPropagation();
                        $scope.$apply();
                    } else if (!window.confirm('确认：返回工程列表？\n未保存的修改将会丢失')) {
                        // 确认的话，则后退到列表页
                        keyEvent.preventDefault();
                        keyEvent.stopPropagation();
                    }
            }
        });

        $scope.$on('delete-element', function (ev, el) {
            editService.removeElement($scope.editStat.selectedScene, el);
            ev.stopPropagation();
        });

    });
