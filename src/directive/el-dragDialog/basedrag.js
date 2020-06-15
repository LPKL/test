
function v_drag(el, binding) {
  let draggor
  if (!binding.value) {
    draggor = el.querySelector('.drag-handle-canberemoved')
    if (draggor) {
      el.style.paddingTop = el.dataset.origpaddingtop || '0' + 'px'
      el.style.bottom = null
      el.style.right = null
      el.style.left = null
      el.style.top = null
      draggor.remove()
    }
    return
  }
  draggor = el.querySelector('.drag-handle')
  if (!draggor) {
    el.style.paddingTop = '30px'
    draggor = document.createElement('div')
    // draggor.classList.add('drag-handle')
    draggor.setAttribute('draggable', true)
    const wEl = el.offsetWidth - 80 + 'px'
    draggor.className = 'drag-handle drag-handle-canberemoved'
    draggor.setAttribute('style', 'cursor:move;height:20px;width:' + wEl +
      ';margin-left:40px;border-radius:0 0 30px 30px; background:#f4f4f4;position:absolute;top:0;left:0;')
    el.appendChild(draggor)
  }
  let isDrag = false
  let hasResetBottom = false

  const drag_position = {}

  // 开始拖拽
  draggor.addEventListener('dragstart', function(e) {
    if (e.target === draggor) {
      isDrag = true
      const { left, top } = el.getBoundingClientRect()
      drag_position.left = e.clientX - left
      drag_position.top = e.clientY - top
    }
  }, false)

  draggor.addEventListener('drag', function(e) {
    debounce(Fn)(e, el, document.documentElement, drag_position)
  }, false)
  // 拖拽结束
  draggor.addEventListener('dragend', function(e) {
    isDrag = false
  }, false)

  function debounce(fn, interval = 50) {
    var t = null
    return function(...args) {
      clearTimeout(t)
      t = setTimeout(() => {
        fn.apply(this, args)
      }, interval)
    }
  }

  // 节流执行的函数
  function Fn(e, el, de, drag_position) {
    e.preventDefault()
    if (isDrag && e.clientX !== 0) {
      let left = e.clientX - drag_position.left
      let top = e.clientY - drag_position.top

      if (left > de.clientWidth - el.offsetWidth) {
        left = de.clientWidth - el.offsetWidth
      }
      if (left < 0) {
        left = 0
      }

      if (top > de.clientHeight - el.offsetHeight) {
        top = de.clientHeight - el.offsetHeight
      }
      if (top < 0) {
        top = 0
      }
      el.style.left = left + 'px'
      el.style.top = top + 'px'
      if (!hasResetBottom) {
        el.style.bottom = 'auto'
        el.style.right = 'auto'
        hasResetBottom = true
      }
    }
  }
}

export default v_drag
