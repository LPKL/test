import $ from 'jquery'
import util from './util'
const draggable = (function($) {
  const guides = []; // 没有可用的引导
  let MIN_DISTANCE = 8, zoom = 1, innerOffsetX, innerOffsetY, elmOffsetX, elmOffsetY, absOffsetX, absOffsetY, elm_pos = null, canvasOffsetX
  let _self = null // vue实力
  const draggable = {
    _this: null,
    _init:function(that){
      _self = that
    },
    addRefNode: function () {
      // console.log(_self == that, _self.$data, that.$data)
      const width = $(_self.ref_node_elm_source).outerWidth()+'px'
      const copy_node = $('<div align="center" id="node1" class="pane-node-copy" style="' +
        'position: absolute;' +
        'display:none;' +
        'border: 1px dashed #333;' +
        'border-radius: 5px;' +
        'cursor: move;\n' +
        'line-height: 26px;\n' +
        'overflow: hidden;\n' +
        'min-width: '+width+';\n' +
        'padding: 1px;\n' +
        'padding-right: 0;"><span>&nbsp;</span></div>')
      copy_node.css({
        left: util.getPos(_self.ref_node_elm_source).position().left,
        top: util.getPos(_self.ref_node_elm_source).position().top
      });
      _self.$jsPlumbCanvas.append(copy_node);
      draggable._this = copy_node[0];
      _self.ref_node_elm = copy_node[0];
    },

    start: function (event) {
      try {
        zoom = window.renderer.getZoom();
        if (zoom > 1.2) {
          MIN_DISTANCE = 2;
        } else {
          MIN_DISTANCE = 8;
        }
        var t = _self.ref_node_elm_source;
        elmOffsetX = event.clientX - util.getPos(t).offset().left;
        elmOffsetY = event.clientY - util.getPos(t).offset().top;

        //包含canvasOffset
        innerOffsetX = util.getPos(t).offset().left - util.getPos(t).position().left;
        //包含canvasOffset
        innerOffsetY = util.getPos(t).offset().top - util.getPos(t).position().top;
        canvasOffsetX = util.getPos(_self.$jsPlumbCanvas).position().left;

        absOffsetX = util.getPos(_self.$jsPlumbCanvas).offset().left;
        absOffsetY = util.getPos(_self.$jsPlumbCanvas).offset().top;

        // guides = $.map($(".draggable").not(this), computeGuidesForElement);
      } catch (e) {
        console.log(e)
      }

    },

    /**
     * 参数说明
     * @param event
     * event事件的
     * outerwidth： 属性是一个只读的整数，声明了整个窗口的宽度。
     * outerheight： 属性是一个只读的整数，声明了整个窗口的高度。
     */

    drag: function (event) {
      $(draggable._this).show();
      var $t = $(this._this);
      elm_pos = {
        top: event.pageY - innerOffsetY - elmOffsetY,
        left: event.pageX - innerOffsetX - elmOffsetX
      };

      /**节点范围限制 上左禁止拖动**/
      if(elm_pos.top <= -20){
        elm_pos.top = -20
      }
      if(elm_pos.left <= -20){
        elm_pos.left = -20
      }
      $t.css({top: elm_pos.top});
      $t.css({left: elm_pos.left});
    },

    stop: function (event) {
      if (!_self.ref_node_elm_source || !elm_pos) return;
      _self.jsp.animate(_self.ref_node_elm_source, {
        left: elm_pos.left,
        top: elm_pos.top
      });
      $('.jtk-miniview-canvas').find('div[jtk-node-id="' + _self.ref_node_elm_source.getAttribute("id") + '"]').css({left: elm_pos.left,
        top: elm_pos.top});
      elm_pos = null;
    },

    // 带有辅助线的节点
    // drag: function (event, ui) {
    //   var guideV, guideH, distV = MIN_DISTANCE + 1, distH = MIN_DISTANCE + 1, offsetV, offsetH;
    //   var chosenGuides = {top: {dist: MIN_DISTANCE + 1}, left: {dist: MIN_DISTANCE + 1}};
    //   $(draggable._this).show();
    //   var $t = $(this._this);
    //   var pos = {top: event.pageY - innerOffsetY, left: event.pageX - innerOffsetX};
    //   var w = $t.outerWidth() - 1;
    //   var h = $t.outerHeight() - 1;
    //   var elemGuides = computeGuidesForElement(null, pos, w, h);
    //   $.each(guides, function (i, guide) {
    //     $.each(elemGuides, function (i, elemGuide) {
    //       if (guide.type == elemGuide.type) {
    //         var prop = guide.type == "h" ? "top" : "left";
    //         var d = Math.abs(elemGuide[prop] - guide[prop]);
    //         if (d < chosenGuides[prop].dist) {
    //           chosenGuides[prop].dist = d;
    //           chosenGuides[prop].offset = elemGuide[prop] - pos[prop];
    //           chosenGuides[prop].guide = guide;
    //         }
    //       }
    //     });
    //   });
    //   if (chosenGuides.top.dist <= MIN_DISTANCE) {
    //     $("#guide-h").css("top", chosenGuides.top.guide.top).show();
    //     ui.position.top = chosenGuides.top.guide.top - chosenGuides.top.offset;
    //   } else {
    //     $("#guide-h").hide();
    //     ui.position.top = pos.top;
    //   }
    //   if (chosenGuides.left.dist <= MIN_DISTANCE) {
    //     $("#guide-v").css("left", chosenGuides.left.guide.left).show();
    //     ui.position.left = chosenGuides.left.guide.left - chosenGuides.left.offset;
    //   } else {
    //     $("#guide-v").hide();
    //     ui.position.left = pos.left;
    //   }
    //   elm_pos = {
    //     top: event.pageY - innerOffsetY - elmOffsetY,
    //     left: event.pageX - innerOffsetX - elmOffsetX
    //   };
    //
    //   /**节点范围限制 上左禁止拖动**/
    //   if(elm_pos.top <= -20){
    //     elm_pos.top = -20
    //   }
    //   if(elm_pos.left <= -20){
    //     elm_pos.left = -20
    //   }
    //   $t.css({top: elm_pos.top});
    //   $t.css({left: elm_pos.left});
    // },
    //
    // stop: function (event, ui) {
    //   $("#guide-v, #guide-h").hide();
    //   if (!_self.ref_node_elm_source || !elm_pos) return;
    //   _self.jsp.animate(_self.ref_node_elm_source, {
    //     left: elm_pos.left,
    //     top: elm_pos.top
    //   });
    //   $('.jtk-miniview-canvas').find('div[jtk-node-id="' + _self.ref_node_elm_source.getAttribute("id") + '"]').css({left: elm_pos.left,
    //     top: elm_pos.top});
    //   elm_pos = null;
    // }
  };
  return draggable
})($)

function computeGuidesForElement(elem, pos, w, h) {
  if (elem != null) {
    var $t = $(elem);
    pos = $t.offset();
    w = $t.outerWidth() - 1;
    h = $t.outerHeight() - 1;
  }
  return [
    {type: "h", left: pos.left, top: pos.top},
    {type: "h", left: pos.left, top: pos.top + h},
    {type: "v", left: pos.left, top: pos.top},
    {type: "v", left: pos.left + w, top: pos.top},
    {type: "h", left: pos.left, top: pos.top + h / 2},
    {type: "v", left: pos.left + w / 2, top: pos.top}
  ];
}
export default draggable
