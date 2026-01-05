import TokenGraph from './TokenGraph'

function GraphModal({ isOpen, onClose, asset, historicalData, balanceType, setBalanceType, timeFrame, setTimeFrame }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{asset} - Historical Data</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="graph-controls">
            <div className="graph-toggle">
              <button 
                className={balanceType === 'usdValue' ? 'active' : ''}
                onClick={() => setBalanceType('usdValue')}
              >
                USD Value
              </button>
              <button 
                className={balanceType === 'balance' ? 'active' : ''}
                onClick={() => setBalanceType('balance')}
              >
                Balance
              </button>
            </div>
            <div className="timeframe-selector">
              {['1m', '5m', '15m', '30m', '1h', '4h', '1d', 'all'].map(tf => (
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
          <TokenGraph 
            asset={asset} 
            data={historicalData} 
            balanceType={balanceType}
            timeFrame={timeFrame}
          />
        </div>
      </div>
    </div>
  )
}

export default GraphModal

