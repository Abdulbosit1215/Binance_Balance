import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function TotalPnLGraph({ data, timeFrame, setTimeFrame }) {
  if (!data || data.length === 0) {
    return (
      <div className="graph-container">
        <h3>Total Portfolio Value</h3>
        <p className="no-data">No historical data yet. Data will appear after a few updates.</p>
      </div>
    )
  }

  // Filter data based on time frame
  const getFilteredData = () => {
    if (!timeFrame || timeFrame === 'all') return data
    
    const now = new Date()
    let cutoffTime
    
    switch(timeFrame) {
      case '1m': cutoffTime = new Date(now - 1 * 60 * 1000); break
      case '5m': cutoffTime = new Date(now - 5 * 60 * 1000); break
      case '15m': cutoffTime = new Date(now - 15 * 60 * 1000); break
      case '30m': cutoffTime = new Date(now - 30 * 60 * 1000); break
      case '1h': cutoffTime = new Date(now - 60 * 60 * 1000); break
      case '4h': cutoffTime = new Date(now - 4 * 60 * 60 * 1000); break
      case '1d': cutoffTime = new Date(now - 24 * 60 * 60 * 1000); break
      default: return data
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffTime)
  }

  const filteredData = getFilteredData()
  const timeFrames = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', 'all']

  // Calculate current and previous values for display
  const currentValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].totalValue : 0
  const previousValue = filteredData.length > 1 ? filteredData[0].totalValue : currentValue
  const change = currentValue - previousValue
  const changePercent = previousValue > 0 ? ((change / previousValue) * 100) : 0

  return (
    <div className="graph-container binance-style">
      <div className="graph-header">
        <div>
          <h3>Total Portfolio Value</h3>
          <div className="graph-value">
            <span className="main-value">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`change-indicator ${change >= 0 ? 'positive' : 'negative'}`}>
              {change >= 0 ? '+' : ''}{change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="timeframe-selector">
          {timeFrames.map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeFrame === tf ? 'active' : ''}`}
              onClick={() => setTimeFrame(tf)}
            >
              {tf === 'all' ? 'All' : tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="totalValueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={{ stroke: '#2a2a2a' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fbbf24',
              padding: '8px 12px'
            }}
            formatter={(value, name) => {
              if (name === 'Total Value') {
                return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]
              }
              return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]
            }}
            labelStyle={{ color: '#fff', marginBottom: '4px' }}
            cursor={{ stroke: '#fbbf24', strokeWidth: 1 }}
          />
          <Line 
            type="monotone" 
            dataKey="totalValue" 
            stroke="#fbbf24" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#fbbf24' }}
            name="Total Value"
          />
          <Line 
            type="monotone" 
            dataKey="pnl" 
            stroke="#fbbf24" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#fbbf24' }}
            name="PnL"
            strokeDasharray="4 4"
            opacity={0.7}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TotalPnLGraph

