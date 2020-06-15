/** -----------------------------------------------------------
 *  el-dialog对话框可移动缩放的自定义指令
 *  元素上增加属性 v-el-drag-dialog.fullscreen.resizable='[500,500]'
 *  只要有 v-el-drag-dialog 指令本身，就能通过拖动header移动位置
 *  有.fullscreen修饰符才能双击header最大化，再次双击恢复原尺寸，
 *  有.fullscreen时，右上角出现最大化（还原）按钮
 *  有.resizable修饰符才可通过拖动边框的方式缩放
 *  value值[500,500]应为数组,表示缩放时最小宽度和高度
 *  不写value时，且有resizable修饰符，则可缩放范围默认为500,500
 *  author: luanfeng
 *  date : 20191108
 *----------------------------------------------------------*/
export default{
  bind(el, binding, vnode, oldVnode) {
    let minWidth = 500
    let minHeight = 500
    let isFullScreen = false
    let crntWidth = 0
    let crntHeight = 0
    let crntMarginTop = 0
    let resizable = false
    let fullscreen = false
    const borderOffset = 4
    const dialogHeader = el.querySelector('.el-dialog__header')
    if (binding.modifiers) {
      resizable = binding.modifiers.resizable
      fullscreen = binding.modifiers.fullscreen
    }
    if (binding.value && Array.isArray(binding.value)) {
      minWidth = binding.value[0]
      minHeight = binding.value[1]
    }
    const dialog = el.querySelector('.el-dialog')
    dialog.style.overflow = 'auto'
    dialogHeader.style.cursor = 'move'
    const sty = dialog.currentStyle || window.getComputedStyle(dialog, null)
    const moveDown = (e) => {
      const disX = e.clientX - dialogHeader.offsetLeft
      const disY = e.clientY - dialogHeader.offsetTop
      let styL, styT
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }
      document.onmousemove = function(e) {
        const l = e.clientX - disX
        const t = e.clientY - disY
        dialog.style.left = `${l + styL}px`
        dialog.style.top = `${t + styT}px`
      }
      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    const fullsizeWindow = (e) => {
      crntHeight = dialog.clientHeight
      crntWidth = dialog.clientWidth
      crntMarginTop = dialog.style.marginTop
      dialog.style.left = 0
      dialog.style.top = 0
      dialog.style.height = '100VH'
      dialog.style.width = '100VW'
      // dialog.style.marginTop = '0!important' // 对于带important后缀的样式此句无效
      dialog.style.setProperty('margin-top', '0', 'important')
      isFullScreen = true
      dialogHeader.style.cursor = 'initial'
      dialogHeader.onmousedown = null
    }

    const restoreWindow = (e) => {
      dialog.style.height = crntHeight + 'px' // 'auto'
      dialog.style.width = crntWidth + 'px'
      dialog.style.marginTop = crntMarginTop
      isFullScreen = false
      dialogHeader.style.cursor = 'move'
      dialogHeader.onmousedown = moveDown
    }

    dialogHeader.onmousedown = moveDown
    if (fullscreen) {
      const fi = document.createElement('SPAN')
      fi.className = 'el-icon-full-screen'
      fi.style.cursor = 'pointer'
      fi.style.position = 'absolute'
      fi.style.color = '#909399'
      fi.style.top = '20px'
      fi.style.right = '46px'
      fi.style.fontSize = '16px'
      dialogHeader.appendChild(fi)
      fi.setAttribute('title', '最大化')

      const toggleFullsize = (e) => {
        if (!isFullScreen) {
          fullsizeWindow(e)
          fi.className = 'el-icon-copy-document'
          fi.setAttribute('title', '还原')
        } else {
          restoreWindow(e)
          fi.className = 'el-icon-full-screen'
          fi.setAttribute('title', '最大化')
        }
      }

      fi.onmouseover = (e) => {
        fi.style.color = '#409EFF'
      }
      fi.onmouseout = (e) => {
        fi.style.color = '#909399'
      }

      fi.onclick = toggleFullsize
      dialogHeader.ondblclick = toggleFullsize
    }

    if (resizable) {
      dialog.onmousemove = function(e) {
        if (e.clientX > dialog.offsetLeft + dialog.clientWidth - borderOffset ||
          dialog.offsetLeft + borderOffset > e.clientX) {
          dialog.style.cursor = 'w-resize'
        } else if (el.scrollTop + e.clientY > dialog.offsetTop + dialog.clientHeight - borderOffset) {
          dialog.style.cursor = 's-resize'
        } else {
          dialog.style.cursor = 'default'
          dialog.onmousedown = null
        }

        dialog.onmousedown = (e) => {
          const clientX = e.clientX
          const clientY = e.clientY
          const cw = dialog.clientWidth
          const ch = dialog.clientHeight
          const offleft = dialog.offsetLeft
          const offtop = dialog.offsetTop
          dialog.style.userSelect = 'none'
          const scrolltop = el.scrollTop
          if (!(clientX > offleft &&
            clientX < offleft + cw &&
            clientY > offtop &&
            clientY < offtop + 100)) {
            document.onmousemove = function(e) {
              e.preventDefault()
              if (clientX > offleft && clientX < offleft + borderOffset) {
                if (clientX > e.clientX) {
                  dialog.style.width = cw + (clientX - e.clientX) * 2 + 'px'
                }
                if (clientX < e.clientX) {
                  if (dialog.clientWidth >= minWidth) {
                    dialog.style.width = cw - (e.clientX - clientX) * 2 + 'px'
                  }
                }
              }
              if (clientX > offleft + cw - borderOffset && clientX < offleft + cw) {
                if (clientX > e.clientX) {
                  if (dialog.clientWidth >= minWidth) {
                    dialog.style.width = cw - (clientX - e.clientX) * 2 + 'px'
                  }
                }
                if (clientX < e.clientX) {
                  dialog.style.width = cw + (e.clientX - clientX) * 2 + 'px'
                }
              }
              if (scrolltop + clientY > offtop + ch - 20 && scrolltop + clientY < offtop + ch) {
                if (clientY > e.clientY) {
                  if (dialog.clientHeight >= minHeight) {
                    dialog.style.height = ch - (clientY - e.clientY) + 'px'
                  }
                }
                if (clientY < e.clientY) {
                  dialog.style.height = ch + (e.clientY - clientY) + 'px'
                }
              }
            }
            document.onmouseup = function(e) {
              document.onmousemove = null
              document.onmouseup = null
            }
          }
        }
      }
    }
  }
}
