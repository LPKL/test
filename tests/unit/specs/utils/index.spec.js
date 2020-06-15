import { parseTime } from '@/utils/index.js'
// import { formatTime } from '@/utils/index.js'

describe('Utils/index:parseTime', () => {
  const d = new Date('2019-05-13 17:54:01') // "2019-05-13 17:54:01"
  it('timestamp', () => {
    expect(parseTime(d)).toBe('2019-05-13 17:54:01')
  })
  it('ten digits timestamp', () => {
    expect(parseTime((d / 1000).toFixed(0))).toBe('2019-05-13 17:54:01')
  })
  it('new Date', () => {
    expect(parseTime(new Date(d))).toBe('2019-05-13 17:54:01')
  })
  it('format', () => {
    expect(parseTime(d, '{y}-{m}-{d} {h}:{i}')).toBe('2019-05-13 17:54')
    expect(parseTime(d, '{y}-{m}-{d}')).toBe('2019-05-13')
    expect(parseTime(d, '{y}/{m}/{d} {h}-{i}')).toBe('2019/05/13 17-54')
  })
  it('get the day of the week', () => {
    expect(parseTime(d, '{a}')).toBe('一') // 星期一
  })
  it('get the day of the week', () => {
    expect(parseTime(+d + 1000 * 60 * 60 * 24 * 2, '{a}')).toBe('三') // 星期日
  })
  it('empty argument', () => {
    expect(parseTime()).toBeNull()
  })
})

// describe('Utils/index:formatTime', () => {
//   const d = new Date('2019-05-13 15:13:01') // "2019-05-13 15:13:01"
//   const retrofit = 5 * 1000

//   it('ten digits timestamp', () => {
//     expect(formatTime((d / 1000).toFixed(0))).toBe('5月13日15时13分')
//   })
//   it('test now', () => {
//     expect(formatTime(+new Date() - 1)).toBe('刚刚')
//   })
//   it('less two minute', () => {
//     expect(formatTime(+new Date() - 60 * 2 * 1000 + retrofit)).toBe('2分钟前')
//   })
//   it('less two hour', () => {
//     expect(formatTime(+new Date() - 60 * 60 * 2 * 1000 + retrofit)).toBe('2小时前')
//   })
//   it('less one day', () => {
//     expect(formatTime(+new Date() - 60 * 60 * 24 * 1 * 1000)).toBe('1天前')
//   })
//   it('more than one day', () => {
//     expect(formatTime(d)).toBe('5月13日15时13分')
//   })
//   it('format', () => {
//     expect(formatTime(d, '{y}-{m}-{d} {h}:{i}')).toBe('2019-05-13 15:13')
//     expect(formatTime(d, '{y}-{m}-{d}')).toBe('2019-05-13')
//     expect(formatTime(d, '{y}/{m}/{d} {h}-{i}')).toBe('2019/05/13 15-13')
//   })
// })
