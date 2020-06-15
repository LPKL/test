import { shallowMount } from '@vue/test-utils'
import mountOption from '~/cores/vueinstance'
// import echarts from 'echarts'
import BaseCharts from '@/components/Charts/BaseCharts.vue'

describe('BaseCharts.vue', () => {
  const chartSettings = {
    metrics: ['设备', '发电量'],
    dimension: ['日期']
  }
  const chartData = {
    columns: ['日期', '设备', '发电量', '发电率'],
    rows: [
      { '日期': '1/1', '设备': 1393, '发电量': 1093, '发电率': 0.32 },
      { '日期': '1/2', '设备': 3530, '发电量': 3230, '发电率': 0.26 },
      { '日期': '1/3', '设备': 2923, '发电量': 2623, '发电率': 0.76 },
      { '日期': '1/4', '设备': 1723, '发电量': 1423, '发电率': 0.49 },
      { '日期': '1/5', '设备': 3792, '发电量': 3492, '发电率': 0.323 },
      { '日期': '1/6', '设备': 4593, '发电量': 4293, '发电率': 0.78 }
    ]
  }
  let wrapper
  beforeAll(() => {
    wrapper = shallowMount(BaseCharts, mountOption({ chartSettings, chartData }, true))
  })
  afterAll(() => {
    wrapper.destroy()
  })
  it('图表实例化', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })
  it('chart图表属性检测', () => {
    const chart = wrapper.vm.$refs.basechart
    // chart是如下对象：
    /**
     * {"$attrs": {}, "$children": [], "$createElement": [Function anonymous], "$el": <ve-line-stub changedelay="0" colors="#c1232b,#27727b,#fcce10,#e87c25,#b5c334,#fe8463,#9bca63,#fad860,#f3a43b,#60c0dd,#d7504b,#c6e579,#f4e001,#f0805a,#26c0c0" data="[object Object]" datazoom="[object Object]" height="400px" initoptions="[object Object]" legendvisible="true" resizeable="true" resizedelay="200" settings="[object Object]" title="[object Object]" tooltipvisible="true" width="400px" widthchangedelay="300" />, "$emit": [Function anonymous], "$listeners": {}, "$options": {"_componentTag": "ve-line", "_parentElm": null, "_parentListeners": undefined, "_parentVnode": [VNode], "_propKeys": [Array], "_refElm": null, "_renderChildren": undefined, "i18n": null, "parent": [VueComponent], "propsData": [Object]}, "$parent": {"$attrs": [Object], "$children": [Array], "$createElement": [Function createElement], "$el": <div … />, "$emit": [Function anonymous], "$listeners": [Object], "$options": [Object], "$parent": [VueComponent], "$refs": [Object], "$root": [VueComponent], "$scopedSlots": [Object], "$slots": [Object], "$store": [Store], "$vnode": [VNode], "__emitted": [Object], "__emittedByOrder": [Array], "_c": [Function createElement], "_data": [Object], "_directInactive": false, "_events": [Object], "_hasHookEvent": false, "_i18n": [VueI18n], "_i18nWatcher": [Function unwatchFn], "_inactive": null, "_isBeingDestroyed": false, "_isDestroyed": false, "_isMounted": true, "_isVue": true, "_props": [Object], "_renderProxy": [VueComponent], "_routerRoot": [VueComponent], "_self": [Circular], "_staticTrees": null, "_subscribing": true, "_uid": 4, "_vnode": [VNode], "_watcher": [Watcher], "_watchers": [Array], "allData": [Object], "colors": [Array], "colors2": [Array], "count": 0, "ctype": false, "loading": false, "setChartAdd": [Function bound setChartAdd], "type": "ve-line"}, "$refs": {}, "$root": {"$attrs": [Object], "$children": [Array], "$createElement": [Function anonymous], "$el": <div … />, "$emit": [Function anonymous], "$listeners": [Object], "$options": [Object], "$parent": undefined, "$refs": [Object], "$root": [Circular], "$scopedSlots": [Object], "$slots": [Object], "$vnode": undefined, "__emitted": [Object], "__emittedByOrder": [Array], "_c": [Function anonymous], "_data": [Object], "_directInactive": false, "_events": [Object], "_hasHookEvent": false, "_inactive": null, "_isBeingDestroyed": false, "_isDestroyed": false, "_isMounted": true, "_isVue": true, "_provided": undefined, "_renderProxy": [VueComponent], "_routerRoot": [Circular], "_self": [Circular], "_staticTrees": null, "_uid": 3, "_vnode": [VNode], "_watcher": [Watcher], "_watchers": [Array]}, "$scopedSlots": {}, "$slots": {}, "$store": {"_actionSubscribers": [Array], "_actions": [Object], "_committing": false, "_modules": [ModuleCollection], "_modulesNamespaceMap": [Object], "_mutations": [Object], "_subscribers": [Array], "_vm": [Vue], "_watcherVM": [Vue], "_wrappedGetters": [Object], "commit": [Function boundCommit], "dispatch": [Function boundDispatch], "getters": [Object], "strict": false}, "$vnode": {"asyncFactory": undefined, "asyncMeta": undefined, "children": undefined, "componentInstance": [Circular], "componentOptions": [Object], "context": [VueComponent], "data": [Object], "elm": <ve-line-stub … />, "fnContext": undefined, "fnOptions": undefined, "fnScopeId": undefined, "isAsyncPlaceholder": false, "isCloned": false, "isComment": false, "isOnce": false, "isRootInsert": false, "isStatic": false, "key": undefined, "ns": undefined, "parent": undefined, "raw": false, "tag": "vue-component-112-VeLine", "text": undefined}, "__emitted": {}, "__emittedByOrder": [], "_c": [Function anonymous], "_data": {}, "_directInactive": false, "_events": {}, "_hasHookEvent": false, "_i18n": {"_dataListeners": [Array], "_dateTimeFormatters": [Object], "_exist": [Function anonymous], "_fallbackRoot": true, "_formatter": [BaseFormatter], "_missing": null, "_numberFormatters": [Object], "_path": [I18nPath], "_root": null, "_silentTranslationWarn": false, "_sync": true, "_vm": [Vue]}, "_inactive": null, "_isBeingDestroyed": false, "_isDestroyed": false, "_isMounted": true, "_isVue": true, "_props": {"afterConfig": undefined, "afterSetOption": undefined, "afterSetOptionOnce": undefined, "animation": null, "axisPointer": undefined, "backgroundColor": undefined, "beforeConfig": undefined, "brush": undefined, "cancelResizeCheck": false, "changeDelay": 0, "colors": [Array], "data": [Object], "dataEmpty": false, "dataZoom": [Array], "events": null, "extend": null, "geo": undefined, "graphic": undefined, "grid": undefined, "height": "400px", "initOptions": [Object], "judgeWidth": false, "legend": undefined, "legendPosition": undefined, "legendVisible": true, "loading": false, "log": false, "markArea": undefined, "markLine": null, "markPoint": null, "notSetUnchange": undefined, "radar": undefined, "resizeDelay": 200, "resizeable": true, "series": undefined, "setOptionOpts": false, "settings": [Object], "textStyle": undefined, "theme": undefined, "themeName": undefined, "timeline": undefined, "title": [Object], "toolbox": null, "tooltip": undefined, "tooltipFormatter": undefined, "tooltipVisible": true, "visualMap": undefined, "width": "400px", "widthChangeDelay": 300, "xAxis": undefined, "yAxis": undefined}, "_renderProxy": {"$attrs": [Object], "$children": [Array], "$createElement": [Function anonymous], "$el": <ve-line-stub … />, "$emit": [Function anonymous], "$listeners": [Object], "$options": [Object], "$parent": [VueComponent], "$refs": [Object], "$root": [VueComponent], "$scopedSlots": [Object], "$slots": [Object], "$store": [Store], "$vnode": [VNode], "__emitted": [Object], "__emittedByOrder": [Array], "_c": [Function anonymous], "_data": [Object], "_directInactive": false, "_events": [Object], "_hasHookEvent": false, "_i18n": [VueI18n], "_inactive": null, "_isBeingDestroyed": false, "_isDestroyed": false, "_isMounted": true, "_isVue": true, "_props": [Object], "_renderProxy": [Circular], "_routerRoot": [VueComponent], "_self": [Circular], "_staticTrees": null, "_subscribing": true, "_uid": 5, "_vnode": [VNode], "_watcher": [Watcher], "_watchers": [Array]}, "_routerRoot": {"$attrs": [Object], "$children": [Array], "$createElement": [Function anonymous], "$el": <div … />, "$emit": [Function anonymous], "$listeners": [Object], "$options": [Object], "$parent": undefined, "$refs": [Object], "$root": [Circular], "$scopedSlots": [Object], "$slots": [Object], "$vnode": undefined, "__emitted": [Object], "__emittedByOrder": [Array], "_c": [Function anonymous], "_data": [Object], "_directInactive": false, "_events": [Object], "_hasHookEvent": false, "_inactive": null, "_isBeingDestroyed": false, "_isDestroyed": false, "_isMounted": true, "_isVue": true, "_provided": undefined, "_renderProxy": [VueComponent], "_routerRoot": [Circular], "_self": [Circular], "_staticTrees": null, "_uid": 3, "_vnode": [VNode], "_watcher": [Watcher], "_watchers": [Array]}, "_self": [Circular], "_staticTrees": null, "_subscribing": true, "_uid": 5, "_vnode": {"asyncFactory": undefined, "asyncMeta": undefined, "children": undefined, "componentInstance": undefined, "componentOptions": undefined, "context": [Circular], "data": [Object], "elm": <ve-line-stub … />, "fnContext": undefined, "fnOptions": undefined, "fnScopeId": undefined, "isAsyncPlaceholder": false, "isCloned": false, "isComment": false, "isOnce": false, "isRootInsert": true, "isStatic": false, "key":
undefined, "ns": undefined, "parent": [VNode], "raw": false, "tag": "ve-line-stub", "text": undefined}, "_watcher": {"active": true, "cb": [Function noop], "deep": false, "depIds": [Set],
"deps": [Array], "dirty": false, "expression": "function () {
          vm._update(vm._render(), hydrating);
        }", "getter": [Function updateComponent], "id": 42, "lazy": false, "newDepIds": [Set], "newDeps": [Array], "sync": false, "user": false, "value": undefined, "vm": [Circular]}, "_watchers": [[Watcher]]}
     *
     */
    expect(wrapper.name()).toBe('BaseCharts')
    expect(chart.$options._componentTag).toBe('ve-line')
    expect(chart.$el.outerHTML).toMatch(/^<ve-line-stub\s.+/)
    expect(chart.height).toBe('400px')
    // expect(chart.series[0].type).toBe('line')
  })
})
