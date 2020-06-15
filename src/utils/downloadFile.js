export default function(mimeType, res, rename) {
  if ('text/csv;application/vnd.ms-excel;application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'.indexOf(mimeType) === -1) {
    throw new Error('MimeType should be csv/xls/xlsx')
  }
  const testBlob = res.data.slice(0)
  const r = new FileReader()
  r.onload = function(evt) {
    try {
      const resData = JSON.parse(this.result)
      if (resData) {
        console.log('download error', resData)
      }
    } catch (err) {
      const blob = new Blob(['\uFEFF' + evt.target.result], { type: mimeType + ';charset=utf-8' })
      let fileName = ''
      if (!rename) {
        // 直接下载,使用服务器文件名
        fileName = res.headers['content-disposition']
        fileName = decodeURIComponent(fileName)
        // 获取文件名
        if (fileName && fileName.length >= 2) {
          fileName = fileName.split('=')[1]
        }
      } else {
        // 使用自定义名称
        fileName = rename
      }
      if (window.navigator.msSaveOrOpenBlob) {
        try {
          window.navigator.msSaveOrOpenBlob(blob, fileName)
        } catch (e) {
          console.log(e)
        }
        return
      }
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = objectUrl
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      URL.revokeObjectURL(objectUrl)
      document.body.removeChild(link)
    }
  }
  r.readAsText(testBlob, 'utf-8')
}
