/* eslint-disable no-debugger */
import Vue from 'vue'

export default class BaseModel {
  $createElement = new Vue().$createElement
  position
  data
  id
  endpointsConfig
  endpoints = []
  type
  name
  on //存储节点事件处理方法的
  pointUuids = []

  context
  cat
  constructor(config = {}) {
    this.position = config.position || [300, 300]
    this.data = config.data
    this.endpointsConfig = config.endpoints || []
    this.name = config.name
    this.id = config.id
    this.type = config.type
    this.on = config.on || {}
    this.context = config.context
    this.cat = config.cat
  }
  setPoint() {
    this.endpointsConfig.forEach(({ code, anchor, endpoint }) => {
      let uuid
      if (code) {
        uuid = `${this.id}.${code}`
      } else if (endpoint.isSource) {
        uuid = `${this.id}.from`
      } else if (endpoint.isTarget) {
        uuid = `${this.id}.to`
      }
      const ep = this.context.jsPlumb.addEndpoint(
        this.id,
        { uuid, ...anchor },
        endpoint
      )
      this.endpoints.push(ep)
      this.pointUuids.push(uuid)
    })
  }
  changePosition(x, y) {
    this.position = [x, y]
  }
}