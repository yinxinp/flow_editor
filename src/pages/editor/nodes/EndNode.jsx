import { getClassName } from '../utils/cssNameSpace'
import { EndModel } from '../models'
import baseMixin from './baseNodeMixin'
export default {
  mixins: [baseMixin],
  props: {
    config: EndModel
  },
  render() {
    const c = this.config
    const style = { left: `${c.position[0]}px`, top: `${c.position[1]}px` }
    return (
      <div
        nodeDraggable
        style={style}
        onDblclick={this.remove}
        onMouseup={({ target }) => {
          c.changePosition(target.offsetLeft, target.offsetTop)
        }}
        class={getClassName('end')}
        id={c.id}
      >
        结束
      </div>
    )
  }
}