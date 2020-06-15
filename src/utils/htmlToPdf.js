// 导出页面为PDF格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'
import $ from 'jquery'

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(',')
  var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1])
  var n = bstr.length
  var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  // 转换成file对象
  return new File([u8arr], filename, { type: mime })
  // 转换成成blob对象
  // return new Blob([u8arr],{type:mime});
}
export default{
  install(Vue, options) {
    Vue.prototype.getPdf = function(context, callback) {
      var title = context.htmlTitle
      const Dom_height = $('#pdfDom').height() // 获取要截取的dom元素内容高度
      const outer_height = $('#pdfDom').outerHeight() // 获取dom元素的外部高度
      const window_height = window.screen.availHeight // 窗口高度
      html2Canvas(document.querySelector('#pdfDom'), {
        allowTaint: true,
        scale: 2, // 设置 scale 为 2 及以上，即可支持高分屏
        background: '#FFFFFF', // 防止PDF底色为黑
        height: Dom_height < window_height ? window_height : outer_height, // canvas画布的具体高度
        /* 以上这个高度非常重要，如果dom内容高度在窗口高度内的话，那就用窗口高度，
        确保把当前页的内容都截取，如果超过一页，那就用外部高度*/
        windowHeight: document.getElementById('pdfDom').scrollHeight,
        y: window.pageYOffset - 30, // 页面在垂直方向的滚动距离。
        useCORS: true // 图片跨域设置
      }).then(function(canvas) {
        const contentWidth = canvas.width
        const contentHeight = canvas.height
        const pageHeight = contentWidth / 592.28 * 841.89 // 一页pdf显示html页面生成的canvas高度
        let leftHeight = contentHeight // 未生成pdf的html页面高度
        let position = 0 // pdf页面偏移
        const imgWidth = 595.28 // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        const imgHeight = 592.28 / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        const PDF = new JsPDF('', 'pt', 'a4')
        /* 当内容未超过pdf一页显示的范围，无需分页 */
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= pageHeight
            position -= 841.89
            // 避免添加空白页
            if (leftHeight > 0) {
              PDF.addPage()
            }
          }
        }
        const pdftitle = title + new Date().toLocaleString()
        // 导出pdf文件命名，导出到本地
        PDF.save(pdftitle + '.pdf')
        // PDF.save(title + new Date().toLocaleString() + '.pdf')
        // this.sendPDF()
        // console.log('ffff', currenFaultId)
        const pdf_output = PDF.output('datauristring')
        var uplload_pdf = dataURLtoFile(pdf_output, pdftitle + '.pdf')
        if (typeof callback === 'function') {
          callback.call(context, uplload_pdf, pdftitle)
        }
      })
    }
  }
}
