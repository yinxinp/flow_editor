import Vue from 'vue'

export default class Node {
  $createElement = new Vue().$createElement
  position
  id
  data
  endpoints
  type
  name
  on //存储节点事件处理方法的
  jsPlumb
  points = []
  constructor(config = {}) {
    this.position = config.position || [0, 0]
    this.data = config.data
    this.endpoints = config.endpoints
    this.name = config.name
    this.type = config.type
    this.on = config.on || {}
  }
  setPoint(jsPlumb) {
    this.jsPlumb = jsPlumb
    this.endpoints.forEach(({ id, anchor, endpoint }) => {
      var point = jsPlumb.addEndpoint(
        this.name,
        { uuid: `${this.name}.${id}`, ...anchor },
        endpoint
      )
      this.points.push(point)
    })
  }
}
