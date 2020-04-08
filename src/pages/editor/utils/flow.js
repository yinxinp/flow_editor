/* eslint-disable no-debugger */
import { jsPlumb } from 'jsplumb'
import * as jsPlumbUtils from './load'
import { request } from './request'
import { saveJSON, readJson } from './file'
import * as nodesModel from '../models'
import { guid } from '../utils/common'
import { NODE_TYPES_MAP, GRID, CONTAINER_ID } from '../config'
export class Flow {
  models = []
  edges = {}
  config
  jsPlumb
  events = {}
  container
  selected = []
  name = '未命名'
  constructor() {
    this.jsPlumb = jsPlumb.getInstance()
  }
  //加载配置
  async init(path) {
    this.container = document.querySelector(`#${CONTAINER_ID}`)
    const { data } = await request(path)
    this.config = data
    this.models = jsPlumbUtils.createNodesModel(this, this.config)
    await this.mount()
  }
  //挂载dom
  mount() {
    return new Promise(r => {
      //将节点dom挂载到页面
      this.models.forEach(model => {
        this.container.append(model.render())
      })
      //注册基本功能
      this.jsPlumb.ready(() => {
        jsPlumbUtils.registerEvents(this)
        jsPlumbUtils.registerOther(this)
        jsPlumbUtils.initEndpoints(this, this.models)
        jsPlumbUtils.connectNodes(this, this.config)
        r()
      })
    })
  }
  // 本地导入json
  async loadFromJson() {
    const jsonData = await readJson()
    if (jsonData) {
      this.reset()
      this.config = jsonData
      this.models = jsPlumbUtils.createNodesModel(this, this.config)
      await this.mount()
    }
  }
  //导出Json
  exportJson() {
    const { Id, Version, Title } = this.config
    const otherInfo = this.models.reduce(
      (prev, current) => {
        const cat = current.cat
        if (!prev[cat]) {
          prev[cat] = []
        }
        prev[cat].push(current.data.meta)
        prev.Position[current.id] = current.position
        return prev
      },
      { Position: {} }
    )
    const Transitions = Object.values(this.edges)
    const data = { Id, Version, Title, ...otherInfo, Transitions }
    saveJSON(data, `${data.Title}.json`)
    return data
  }
  //创建节点
  createNode(type, { offsetX, offsetY }) {
    switch (type) {
      case 'StartEvent':
        return this.addNode(
          createBaseNode(this, type, [offsetX, offsetY], nodesModel.StartModel)
        )
      case 'EndEvent':
        return this.addNode(
          createBaseNode(this, type, [offsetX, offsetY], nodesModel.EndModel)
        )
      case 'SplitGateway':
        return this.addNode(
          createBaseNode(
            this,
            type,
            [offsetX, offsetY],
            nodesModel.GatewayModel
          )
        )
      case 'JoinGateway':
        return this.addNode(
          createBaseNode(this, type, [offsetX, offsetY], nodesModel.JoinModel)
        )
      case 'UserTask':
        return this.addNode(
          createBaseNode(this, type, [offsetX, offsetY], nodesModel.TaskModel)
        )
      default:
        return null
    }
  }
  //添加新节点
  addNode(model) {
    this.models.push(model)
    this.container.append(model.render())
    this.setEndPoint(model)
    return model
  }
  //添加锚点
  setEndPoint(model) {
    model.setPoint()
    this.jsPlumb.draggable(model.id, {
      containment: CONTAINER_ID,
      grid: GRID
    })
  }
  //注册事件
  registerListenner(obj = {}) {
    this.events = obj
  }
  unSelectAll() {
    this.selected.forEach(model => {
      model.nodeInstance.active(false)
    })
    this.selected = []
  }
  reset() {
    this.models = []
    this.edges = {}
    this.config = undefined
    this.selected = []
    this.jsPlumb.empty(CONTAINER_ID)
  }
}

function createBaseNode(context, type, position, nodeClass) {
  const meta = { id: `${type}_${guid()}`, type }
  const cat = NODE_TYPES_MAP[type].cat
  return new nodeClass({ ...meta, context, type, cat, position }, { meta })
}
