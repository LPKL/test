import $ from 'jquery'

var context = (function() {
  var $sub = $(this).find('.dropdown-context-sub:first')
  var options = {
    fadeSpeed: 100,
    filter: function($obj) {
      // Modify $obj, Do not return
    },
    above: 'auto',
    preventDoubleContext: true,
    compress: false
  }

  function initialize(opts) {
    options = $.extend({}, options, opts)

    $(document).on('click', 'html', function() {
      contextfadeOut()
    })
    if (options.preventDoubleContext) {
      $(document).on('contextmenu', '.dropdown-context', function(e) {
        e.preventDefault()
      })
    }
    $(document).on('mouseenter', '.dropdown-submenu', function() {
      var subWidth = $sub.width(),
        subLeft = $sub.offset()?$sub.offset().left:0,
        collision = (subWidth + subLeft) > window.innerWidth
      if (collision) {
        $sub.addClass('drop-left')
      }
    })
  }

  function contextfadeOut(){
    $('.dropdown-context').fadeOut(options.fadeSpeed, function() {
      $('.dropdown-context').css({ display: '' }).find('.drop-left').removeClass('drop-left')
    })
  }

  function updateOptions(opts) {
    options = $.extend({}, options, opts)
  }

  function buildMenu(data, id, subMenu) {
    var subClass = (subMenu) ? ' dropdown-context-sub' : ''
    var compressed = options.compress ? ' compressed-context' : ''
    var $menu = $('<ul class="dropdown-menu dropdown-context' + subClass + compressed + '" id="dropdown-' + id + '"></ul>')
    var linkTarget = ''
    for (let i = 0, len = data.length; i < len; i++) {
      if (typeof data[i].divider !== 'undefined') {
        $menu.append('<li class="divider"></li>')
      } else if (typeof data[i].header !== 'undefined') {
        $menu.append('<li class="nav-header">' + data[i].header + '</li>')
      } else {
        if (typeof data[i].href === 'undefined') {
          data[i].href = '#'
        }
        if (typeof data[i].target !== 'undefined') {
          linkTarget = ' target="' + data[i].target + '"'
        }
        if (typeof data[i].subMenu !== 'undefined') {
          $sub = ('<li class="dropdown-submenu"><a tabindex="-1" href="' + data[i].href + '">' + data[i].text + '</a></li>')
        } else {
          $sub = $('<li><a tabindex="-1" href="' + data[i].href + '"' + linkTarget + '>' + data[i].text + '</a></li>')
        }

        if (typeof data[i].action !== 'undefined') {
          var actiond = new Date()
          var actionID = 'event-' + actiond.getTime() * Math.floor(Math.random() * 100000)
          // var eventAction = data[i].action
          if(!data[i].isNone){
            $($sub).find('a').attr('class', "disabled")
          }else{
            $($sub).find('a').attr('id', actionID)
            // $('#' + actionID).addClass('context-event') //元素未插入DOM，无效
            $(document).off('click','#' + actionID) // 防止事件委托重复注册
            $(document).on('click', '#' + actionID, function(e){
              // contextfadeOut()
              data[i].action.call(this,e) // eventAction.call 闭包问题
            })
          }
        }

        $menu.append($sub)

        if (typeof data[i].subMenu !== 'undefined') {
          $menu.off('click','li.dropdown-submenu')
          $menu.on('click','li.dropdown-submenu', function(event){
            //有子菜单的情况下，点击不关闭右键菜单
            if($(event.target).is($(this)) || $(event.target).parent().hasClass('dropdown-submenu')){
              event.stopPropagation()
            }
          })
          var subMenuData = buildMenu(data[i].subMenu, id, true)
          $menu.find('li:last').append(subMenuData)
        }
      }
      if (typeof options.filter === 'function') {
        options.filter($menu.find('li:last'))
      }
    }
    return $menu
  }

  function addContext(selector, data,e) {
    /**把已经存在的menu删除**/
    $('ul.dropdown-menu.dropdown-context').remove()
    var d = new Date(),
      id = d.getTime(),
      $menu = buildMenu(data, id)
    $('body').append($menu)
    const $dd = $('#dropdown-' + id)
    $('.dropdown-context:not(.dropdown-context-sub)').hide()
    if (typeof options.above === 'boolean' && options.above) {
      $dd.addClass('dropdown-context-up').css({
        top: e.pageY - 20 - $('#dropdown-' + id).height(),
        left: e.pageX - 13
      }).fadeIn(options.fadeSpeed)
    } else if (typeof options.above === 'string' && options.above == 'auto') {
      $dd.removeClass('dropdown-context-up')
      var autoH = $dd.height() + 12
      if ((e.pageY + autoH) > $('html').height()) {
        $dd.addClass('dropdown-context-up').css({
          top: e.pageY - 20 - autoH,
          left: e.pageX - 13
        }).fadeIn(options.fadeSpeed)
      } else {
        $dd.css({
          top: e.pageY + 10,
          left: e.pageX - 13
        }).fadeIn(options.fadeSpeed)
      }
    }
    // $(document).on('contextmenu', selector, function(e) {
    //   console.log(1231231)
    //   var a = $(e.target).closest('#work_panel')
    //   if(a.length){
    //     e.preventDefault()
    //     e.stopPropagation()
    //
    //   }
    // })
  }

  function destroyContext(selector) {
    $(document).off('contextmenu', selector).off('click', '.context-event')
  }

  return {
    init: initialize,
    settings: updateOptions,
    attach: addContext,
    destroy: destroyContext
  }
})($)

export default context
