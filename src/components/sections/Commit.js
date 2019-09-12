import React from 'react'
import PropTypes from 'prop-types'

import { Row, Statistic, Icon, Tag } from 'antd'
// import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as ChartToolTip } from 'recharts'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import COLORS from './Colors'
import OPTIONS from './ChartOptions'


class Commit extends React.Component {
  static formatter = (repo, data) => {
    // commit total data, index 0
    let total = { name: repo, data: [] }
    // commit  daily increment data, index 1
    let increment = { name: repo, data: [] }

    let cumulativeCount = 0

    // traversal backwards
    Array.from(data.entries()).slice().reverse().forEach(
      pair => {
        cumulativeCount += pair[1]
        total.data.push([pair[0], cumulativeCount])
        increment.data.push([pair[0], pair[1]])
      }
    )

    return [total, increment]
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.loading && !Array.from(nextProps.ready.values()).includes(false)
  }

  _renderStatistics = () => {
    const { stats, ready } = this.props

    return (
      <>
      {Array.from(stats.entries()).map((
        (pair, index) => {
          if (ready.get(pair[0])) {
            const { total, maxIncrement, createdAt } = pair[1]
            const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
            const averagePerDay = total / dateSinceCreated
            return (
              <div key={`fork-statistics-${pair[0]}`}>
                <Row>
                  <Tag color={COLORS[index]}>
                    {pair[0]}
                  </Tag>
                  <Row type="flex" align="middle" justify="space-between">
                    <span className="stats-card">
                      <Statistic title="Total commits" value={total} prefix={<Icon type="history" />} />
                    </span>
                    <span className="stats-card">
                      <Statistic title="Avg. commits/day" value={averagePerDay} precision={2} />
                    </span>
                    <span className="stats-card">
                      <Statistic title="Max. commits/day" value={maxIncrement} />
                    </span>
                  </Row>
                </Row>
              </div>
            )
          }
          return false
        }
      ))}
      </>
    )
  }

  _renderCharts = () => {
    const { data, ready } = this.props

    if (!Array.from(ready.values()).includes(true)) return

    return (
      <>
      <HighchartsReact
        highcharts={Highcharts}
        options={{ ...OPTIONS,
          chart: {
            type: 'line',
            zoomType: 'x',
          },
          xAxis: {
            type: 'datetime',
          },
          yAxis: {
            gridLineWidth: 0,
            title: {
              text: 'total commits',
            },
          },
          series: Array.from(data.values()).map(dataArray => dataArray[0]),
        }}
      />
      <HighchartsReact
        highcharts={Highcharts}
        options={{ ...OPTIONS,
          chart: {
            type: 'column',
            zoomType: 'x',
          },
          xAxis: {
            type: 'datetime',
          },
          yAxis: {
            gridLineWidth: 0,
            title: {
              text: 'commit increment/day',
            },
          },
          series: Array.from(data.values()).map(dataArray => dataArray[1]),
        }}
      />
      </>
    )
  }

  render() {
    return (
      <>
      {this._renderStatistics()}
      {this._renderCharts()}
      </>
    )
  }
}

Commit.propTypes = {
  id: PropTypes.string,
  repos: PropTypes.array,
  data: PropTypes.objectOf(Map),
  stats: PropTypes.objectOf(Map),
  ready: PropTypes.objectOf(Map),
  loading: PropTypes.bool,
}


export default Commit