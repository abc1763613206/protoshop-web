'use strict';

angular.module('toHELL')
  .controller('PackageEditCTRL', ['$scope', '$routeParams', '$http', '$document',
    'GLOBAL', 'sceneService', 'elementService', 'actionService',
    function ($scope, $routeParams, $http, $document, GLOBAL, sceneService, elementService, actionService) {
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
        /**
         * 移动hotspot时的临时存储栈
         * @var hotspotStack
         * @private
         */
        hotspotStack: {
          hotspotMovingTarget: null,
          hotspotDom: null,
          hotspotMovingStart: {
            x: 0,
            y: 0
          },
          hotspotMovingOffset: {
            x: 0,
            y: 0
          },
          hotspotOldZindex: null
        },
        expanderStack: {
          expanderMovingTarget: null,
          expanderMovingStart: {
            x: 0,
            y: 0
          },
          expanderMovingOffset: {
            x: 0,
            y: 0
          },
          hotspotPos: {
            x: 0,
            y: 0
          },
          hotspot: {
            width: 0,
            height: 0
          },
          expanderIndex: null
        }
      };

      $scope.package = {};
      /**
       * 存储整个工程的实时状态
       * @var {Object} $scope.package
       */
//      $http.get('/api/package/' + $routeParams.pkgId + '.json')
      $http.get(GLOBAL.apiHost + 'fetchProject/?appid=' + $routeParams.pkgId)
        .success(function (data) {
          $scope.package = data;
          sceneService.setPackage($scope.package);
          elementService.setPackage($scope.package);
          actionService.setPackage($scope.package);
        })
        .error(GLOBAL.errLogger);

      sceneService.setStat($scope.editStat);
      elementService.setStat($scope.editStat);
      actionService.setStat($scope.editStat);

      /**
       * 选中一个场景
       * @func selectScene
       * @param {Scene} scene - 被选中的场景
       */
      $scope.selectScene = function (scene) {
        sceneService.selectScene(scene);
        // 清除掉之前可能有的其他元素、动作选择
        this.selectElement(null);
      };

      $scope.defaults = {
        sceneBackground: 'images/dummy-scene-thumb.png'
      };

      /**
       * 释放选中的场景。连带释放选中的元素。
       * @func deselectScene
       */
      $scope.deselectScene = function () {
        sceneService.deselectScene();
        this.deselectElement();
      };

      /**
       * 增加一个场景。增加的场景将在所有场景之后。
       * @func addScene
       * @return {Scene} 返回新增的场景对象
       */
      $scope.addScene = function () {
        return sceneService.addScene();
      };

      /**
       * 增加一个场景并插入在所给order之后。
       * @func insertScene
       * @param {number} lastOrder - 新场景所要跟随的order
       * @return {Scene} 返回新增的场景对象
       * @todo
       */
      // $scope.insertScene = function (lastOrder) {
      //   // TODO
      // };

      /**
       * 删除一个场景。如果不存在满足条件的场景，则操作无效。
       * @func removeScene
       * @param {Scene} scene - 所要删除的场景对象
       */
      $scope.removeScene = function (scene) {
        return sceneService.removeScene(scene);
      };

      /**
       * 选中一个元素
       * @func selectElement
       * @param {number} elementIndex 该元素的索引值
       * @todo 目前考虑自动选中第一个action，时机成熟时移除
       */
      $scope.selectElement = function (element) {
        elementService.selectElement(element);
        // FIXME: 目前考虑自动选中第一个action，时机成熟时移除
        // TODO: 选择第一个Action。
        if (this.editStat.selectedElement && element.actions.length > 0) {
          this.selectAction(element.actions[0]);
        }
      };

      /**
       * 释放选中的元素。释放时会连带释放动作的选中。
       * @func deselectElement
       */
      $scope.deselectElement = function () {
        elementService.deselectElement();
        // 连带释放Action的选中
        this.deselectAction();
      };

      /**
       * 增加一个hotspot元素
       * @func addHotspotElement
       */
      $scope.addHotspotElement = function () {
        elementService.addHotspotElement();
      };

      /**
       * 选中一个动作
       * @func selectAction
       * @param {Action} action 所要选中的动作对象
       */
      $scope.selectAction = function (action) {
        actionService.selectAction(action);
      };

      /**
       * 释放选中的动作。
       * @func deselectAction
       */
      $scope.deselectAction = function () {
        actionService.deselectAction();
      };

      /**
       * 增加一个动作。该动作会直接增加在当前元素中。
       * @func addAction
       */
      $scope.addAction = function () {
        actionService.addAction();
      };

      /**
       * 编辑区空白区域点击时调用此函数，用以清除已选元素、动作
       * @func onBackgroundClick
       * @private
       */
      $scope.onBackgroundClick = function () {
        this.selectElement(null);
      };

      /**
       * 搜索符合条件的场景
       * @private
       * @func findScene
       * @param {string} key - 要搜索的键
       * @param {string|number} value - 要搜索的值
       * @return {number|null} 如果找到则返回该场景的id，否则返回null
       */
      $scope.findScene = function (key, value) {
        return sceneService.findScene(key, value);
      };

      // 快捷方法
      /**
       * 搜索特定id的场景
       * @func findSceneById
       * @param {number} id - 要搜索的id
       * @return {Scene|null} 如果找到则返回该场景对象，否则返回null
       */
      $scope.findSceneById = function (id) {
        return this.findScene('id', id);
      };

      /**
       * 搜索特定order的场景
       * @func findSceneByOrder
       * @param {number} order - 要搜索的order
       * @return {Scene|null} 如果找到则返回该场景对象，否则返回null
       */
      $scope.findSceneByOrder = function (order) {
        return this.findScene('order', order);
      };

      /**
       * 搜索最大的场景id
       * @func findMaxSceneId
       * @return {number} 返回该id。如果不存在任何一个场景，返回-1。
       */
      function findMaxSceneId() {
        return sceneService.findMaxSceneId();
      }

      /**
       * 搜索最大的场景order
       * @func findSceneByOrder
       * @return {number} 返回找到的最大order，如果不存在任何一个场景则返回-1。
       */
      function findMaxSceneOrder() {
        return sceneService.findMaxSceneOrder();
      }

      /**
       * 将一条Action渲染为文本信息
       * @func renderActionItem
       * @param {Action} action - 要渲染的action
       * @return {string} 文本信息
       */
      $scope.renderActionItem = function (action) {
        return actionService.renderActionItem(action);
      };

      /**
       * 返回一个元素的坐标样式信息
       * @func renderHotspotStyle
       * @param {Element} element - 要处理的元素
       * @return {Object} 样式信息，需包含left、top、width、height
       */
      $scope.renderHotspotStyle = function (element) {
        return actionService.renderHotspotStyle(element);
      };

      /**
       * 返回线框整体的CSS样式。线框整体指的是包裹线框指示器、线段、属性栏等物件的容器。
       * 通常来说，应当保持$scope.editStat.gotoSignStyle与本函数同步。
       * @func renderGotoSignStyle
       * @param {Element} ele - 对应的元素对象
       * @return {Object} 返回样式表对象
       * @todo 处理px以外单位的情况
       */
      $scope.renderGotoSignStyle = function (ele) {
        return actionService.renderGotoSignStyle(ele);
      };

      /**
       * 返回线框中线段的CSS样式。
       * 通常来说，应当保持$scope.editStat.gotoLineStyle与本函数同步。
       * @func renderGotoLineStyle
       * @param {Element} ele - 对应的元素对象
       * @return {Object} 返回样式表对象
       * @todo 处理px以外单位的情况
       */
      $scope.renderGotoLineStyle = function (ele) {
        return actionService.renderGotoLineStyle(ele);
      };

      /**
       * 测试Transition方向是否已禁用
       * @func isTransDirDisabled
       * @param {Action} action - 要测试的Action
       * @return {bool}
       */
      $scope.isTransDirDisabled = function (action) {
        return actionService.isTransDirDisabled(action);
      };

      /**
       * transition的方式发生变化时调用此函数
       * @func onTransitionTypeChanged
       * @param {Action} action - 发生变化的的Action
       * @todo 目前没有transition从无到有的默认值，同时也就意味着没有“记忆”能力
       */
      $scope.onTransitionTypeChanged = function (action) {
        if (action.transitionType === 'none') {
          action.transitionDirection = 'none';
        } else {
          // TODO: 目前没有默认值，同时也就意味着没有“记忆”能力
        }
      };

      /**
       * 将热点平移至指定位置。函数保证热点不会超出屏幕。
       * @func moveHotspotTo
       * @param {Element} ele - 关联的热点对象
       * @param {number|String} x - 横坐标。可携带单位，比如10px
       * @param {number|String} y - 纵坐标。同样可携带单位
       * @todo 屏幕应当可配置
       */
      $scope.moveHotspotTo = function (ele, x, y) {
        return actionService.moveHotspotTo(ele, x, y);
      };

      /**
       * 将热点缩放至特定尺寸。函数保证热点不会超出屏幕。
       * @func resizeHotspotTo
       * @param {Element} ele - 关联的热点对象
       * @param {number|String} w - 宽度。可携带单位，比如10px
       * @param {number|String} h - 高度。同样可携带单位
       * @todo 屏幕应当可配置
       */
      $scope.resizeHotspotTo = function (ele, w, h) {
        return actionService.resizeHotspotTo(ele, w, h);
      };

      /**
       * 场景中鼠标移动时触发此函数。由于热点区域有多个可点击、拖动的对象，这个函数用来将其分发。
       * @func onSceneMoved
       * @param {event} $event - 点击事件
       * @private
       */
      $scope.onSceneMoved = function ($event) {
        var eT = this.editStat;
        var sT = eT.hotspotStack;
        var expT = eT.expanderStack;

        if (sT.hotspotMovingTarget !== null) {
          this.onHotspotMoved($event);
        }
        if (expT.expanderMovingTarget !== null) {
          this.onExpanderMove($event);
        }
      };

      /**
       * 场景中鼠标抬起时触发此函数。由于热点区域有多个可点击、拖动的对象，这个函数用来将其分发。
       * @func onSceneUp
       * @param {event} $event - 点击事件
       * @private
       */
      $scope.onSceneUp = function ($event) {
        this.onHotspotUp($event);
        this.onExpanderUp($event);
      };

      /**
       * 热点被鼠标按下时触发此函数
       * @func onHotspotDown
       * @param {number} index - 被点击的元素的索引值
       * @param {Element} ele - 被点击的元素对象
       * @param {event} $event - 点击事件
       * @private
       */
      $scope.onHotspotDown = function (ele, $event) {
        if ($event.which !== 1) {// 不接受非左键点击
          return;
        }
        var sT = this.editStat.hotspotStack;
        this.selectElement(ele);
        sT.hotspotMovingTarget = ele;
        sT.hotspotMovingStart.x = $event.clientX;
        sT.hotspotMovingStart.y = $event.clientY;
        sT.hotspotMovingOffset.x = parseInt($event.target.style.left, 10); // 小心单位
        sT.hotspotMovingOffset.y = parseInt($event.target.style.top, 10);
        sT.hotspotDom = $event.target;
        sT.hotspotOldZindex = sT.hotspotDom.zIndex;
        sT.hotspotDom.zIndex = 10000;
        $document[0].body.style.cursor = 'move';
      };

      /**
       * 热点在鼠标移动时触发此函数
       * @func onHotspotMoved
       * @param {event} $event - 点击事件
       * @private
       */
      $scope.onHotspotMoved = function ($event) {
        var sT = this.editStat.hotspotStack;
        // 返回范围内的数值
        if (sT.hotspotMovingTarget !== null) {
          var xT = sT.hotspotMovingOffset.x + $event.clientX - sT.hotspotMovingStart.x;
          var yT = sT.hotspotMovingOffset.y + $event.clientY - sT.hotspotMovingStart.y;
          this.moveHotspotTo(sT.hotspotMovingTarget, xT, yT);
          // TODO: 热点移动时颜色可以发生变化
          // TODO: 热点移动时，如果热点移至屏幕另半侧，则应将线框转移
        }
      };

      /**
       * 热点在鼠标抬起时触发此函数
       * @func onHotspotUp
       * @private
       */
      $scope.onHotspotUp = function () {
        var sT = this.editStat.hotspotStack;
        sT.hotspotMovingTarget = null;
        if (!sT.hotspotDom) {
          return;
        }
        sT.hotspotDom.zIndex = sT.hotspotOldZindex;
        // NOTE: 注意这里不要使用auto，以免覆盖CSS中的相应设置
        $document[0].body.style.cursor = '';
      };

      /**
       * 元素缩放触头在鼠标按下时触发此函数
       * @func onExpanderDown
       * @param {number} index - 元素的索引
       * @param {Element} ele - 元素对象
       * @param {number} pos - 触头的索引，用来区分是哪个触头。从左开始顺时针依次为1、2、3、4
       * @param {event} $event - 鼠标事件
       * @private
       */
      $scope.onExpanderDown = function (ele, pos, $event) {
        if ($event.which !== 1) {// 不接受非左键点击
          return;
        }
        var sT = this.editStat.expanderStack;
        this.selectElement(ele);
        sT.expanderIndex = pos;
        sT.expanderMovingTarget = ele;
        sT.expanderMovingStart.x = $event.clientX;
        sT.expanderMovingStart.y = $event.clientY;
        sT.hotspotPos.x = parseInt(ele.posX, 10);
        sT.hotspotPos.y = parseInt(ele.posY, 10);
        sT.hotspot.width = parseInt(ele.width, 10);
        sT.hotspot.height = parseInt(ele.height, 10);
        sT.expanderMovingOffset.y = parseInt(sT.expanderMovingTarget.height, 10); // 小心单位
        sT.expanderMovingOffset.x = parseInt(sT.expanderMovingTarget.width, 10);
        switch (pos) {
        case 1:
          $document[0].body.style.cursor = 'w-resize'; // TODO: 换用更angular的方法
          break;
        case 2:
          $document[0].body.style.cursor = 'n-resize'; // TODO: 换用更angular的方法
          break;
        case 3:
          $document[0].body.style.cursor = 'e-resize'; // TODO: 换用更angular的方法
          break;
        case 4:
          $document[0].body.style.cursor = 's-resize'; // TODO: 换用更angular的方法
          break;
        default:
          break;
        }

      };

      /**
       * 元素缩放触头在鼠标松开时触发此函数
       * @func onExpanderUp
       * @private
       */
      $scope.onExpanderUp = function () {
        var sT = this.editStat.expanderStack;
        sT.expanderMovingTarget = null;
        document.body.style.cursor = ''; // TODO: 这里可能应该将光标之前的状态存储，而不是直接使用auto
      };

      /**
       * 元素缩放触头在鼠标移动时触发此函数
       * @func onExpanderMove
       * @param {event} $event - 鼠标事件
       * @private
       */
      $scope.onExpanderMove = function ($event) {
        var eT = this.editStat.expanderStack;
        if (eT.expanderMovingTarget !== null) {
          var target = eT.expanderMovingTarget;
          // $event.target.style.cursor = 'move';
          var xT = eT.expanderMovingOffset.x + $event.clientX - eT.expanderMovingStart.x;
          var yT = eT.expanderMovingOffset.y + $event.clientY - eT.expanderMovingStart.y;
          // 计算实际的移动距离
          var deltaY = eT.hotspot.height - yT;
          var deltaX = eT.hotspot.width - xT;

          // TODO: 控制线框的长短
          switch (eT.expanderIndex) {
            // 由于元素的定位实际是左上角的定位，因此左边侧和上边侧的变动，需要同时移动元素来保持整体的静止
          case 1:
            // 防止因无法resize而导致的move
            if (eT.hotspotPos.x - deltaX < eT.hotspotPos.x + eT.hotspot.width) {
              this.moveHotspotTo(target, eT.hotspotPos.x - deltaX, eT.hotspotPos.y);
            }
            // 防止因无法move而导致的resize
            // FIXME: 注意，这两种判断都不是精确的，可能因为鼠标事件精确性发生一定的差错
            if (parseInt(target.posX, 10) > 0 || deltaX < 0) {
              this.resizeHotspotTo(target, eT.hotspot.width + deltaX, eT.hotspot.height);
            }
            break;
          case 2:
            if (eT.hotspotPos.y - deltaY < eT.hotspotPos.y + eT.hotspot.height) {
              this.moveHotspotTo(target, eT.hotspotPos.x, eT.hotspotPos.y - deltaY);
            }
            if (parseInt(target.posY, 10) > 0 || deltaY < 0) {
              this.resizeHotspotTo(target, eT.hotspot.width, eT.hotspot.height + deltaY);
            }
            break;
            // 而右边侧与下边侧的移动则不会对整体位置造成影响
          case 3:
            this.resizeHotspotTo(target, eT.hotspot.width - deltaX, eT.hotspot.height);
            break;
          case 4:
            this.resizeHotspotTo(target, eT.hotspot.width, eT.hotspot.height - deltaY);
            break;
          default:
            break;
          }
        }
      };

      $scope.openUploaderWindow = function () {
        window.uploadSuccess = function (imageName) {
          var imgSrc = GLOBAL.host + 'packages/' + $routeParams.pkgId + '/' + imageName + '.png';
          $scope.editStat.selectedScene.background = imgSrc;
        };
        var x = screen.width / 2 - 700 / 2;
        var y = screen.height / 2 - 450 / 2;
        window.open(
          '/api/uploader/#' + $routeParams.pkgId, //test
//          '/api/uploader/success.html#aaa' + $routeParams.pkgId, //test
//          'http://wxddb1.qa.nt.ctripcorp.com/api/uploader/#' + $routeParams.pkgId,
          'DescriptiveWindowName',
          'width=420,height=230,resizable,scrollbars=no,status=1,left=' + x + ',top=' + y
        );
      };

      /**
       * 保存编辑好的项目JSON数据
       */
      $scope.savePackage = function () {
        $http.post(GLOBAL.apiHost + 'saveProject/', {
          context: $scope.package
        })
          .success(function () {
            console.log('Package "' + $scope.package.appID + '" saved!');
          });
      };

    }]);
