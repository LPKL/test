import { getMessageStatus, getUnreadNum, getToken } from '@/utils/auth.js'
describe('Utils:auth', () => {
  it('getMessageStatus', () => {
    // 1Y2N3N4Y
    const object = [{ 'key': '1', 'status': 'Y' }, { 'key': '2', 'status': 'N' }, { 'key': '3', 'status': 'N' }, { 'key': '4', 'status': 'Y' }]
    expect(getMessageStatus('1Y2N3N4Y')).toStrictEqual(object)
  })
  it('getUnreadNum', () => {
    expect(getUnreadNum('1Y2N3N4Y5N')).toBe(3)
  })
})
