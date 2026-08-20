import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, BarChart2, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Helper for polar to cartesian coordinates (for Donut SVG)
function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

// Helper to generate a mathematically perfect SVG Donut Segment
function getDonutSegmentPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.99) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 0 ${cx} ${cy + outerR}`,
      `A ${outerR} ${outerR} 0 1 0 ${cx} ${cy - outerR}`,
      `M ${cx} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 1 ${cx} ${cy + innerR}`,
      `A ${innerR} ${innerR} 0 1 1 ${cx} ${cy - innerR}`,
      'Z'
    ].join(' ');
  }

  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = sweep > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
    'Z'
  ].join(' ');
}

// Helper to parse transaction amounts safely
function parseTxnAmount(amt) {
  if (!amt) return 0;
  if (typeof amt === 'number') return amt;
  return parseFloat(amt.toString().replace(/,/g, '')) || 0;
}

// Helper to parse dates in multiple formats safely
function parseTxnDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const cleaned = dateStr.replace(/,/g, '').trim();
  const d2 = new Date(cleaned);
  if (!isNaN(d2.getTime())) return d2;
  return null;
}

// Helper for formatting Y-axis numbers cleanly (e.g. 25.0k, 500, 1.2M)
function formatYAxisLabel(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  if (val === 0) return '0';
  return val.toString();
}

export default function AdminDashboard({ onSelectTab }) {
  const { goldRate, silverRate, transactions } = useApp();

  // Hovered tooltip state for charts
  const [hoveredBar, setHoveredBar] = useState(null);

  // Reference date: latest transaction date or current system date
  const referenceDate = useMemo(() => {
    let latest = new Date();
    transactions.forEach((t) => {
      const d = parseTxnDate(t.date);
      if (d && d.getTime() > latest.getTime()) {
        latest = d;
      }
    });
    return latest;
  }, [transactions]);

  // Dynamic Sales by Metal calculations from actual transactions
  const { 
    goldValue, 
    silverValue, 
    goldTxnCount, 
    silverTxnCount,
    goldPercent,
    silverPercent,
    goldTxnPercent,
    silverTxnPercent
  } = useMemo(() => {
    let gVal = 0;
    let sVal = 0;
    let gCount = 0;
    let sCount = 0;

    transactions.forEach((t) => {
      const amt = parseTxnAmount(t.amount);
      const isGold = (t.asset || t.assetType || '').toLowerCase().includes('gold');
      if (isGold) {
        gVal += amt;
        gCount += 1;
      } else {
        sVal += amt;
        sCount += 1;
      }
    });

    const totalVal = gVal + sVal;
    const totalCount = gCount + sCount;

    return {
      goldValue: gVal,
      silverValue: sVal,
      goldTxnCount: gCount,
      silverTxnCount: sCount,
      goldPercent: totalVal > 0 ? ((gVal / totalVal) * 100).toFixed(1) : '51.4',
      silverPercent: totalVal > 0 ? ((sVal / totalVal) * 100).toFixed(1) : '48.6',
      goldTxnPercent: totalCount > 0 ? ((gCount / totalCount) * 100).toFixed(1) : '50.0',
      silverTxnPercent: totalCount > 0 ? ((sCount / totalCount) * 100).toFixed(1) : '50.0'
    };
  }, [transactions]);

  // =========================================================================
  // 1. Annual Transactions Aggregation (Last 5 Years)
  // =========================================================================
  const annualChartData = useMemo(() => {
    const currentYear = referenceDate.getFullYear();
    const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    const map = {};
    years.forEach((y) => {
      map[y] = {
        key: y.toString(),
        label: y.toString(),
        totalValue: 0,
        goldValue: 0,
        silverValue: 0,
        count: 0,
        goldCount: 0,
        silverCount: 0
      };
    });

    transactions.forEach((t) => {
      const d = parseTxnDate(t.date);
      if (!d) return;
      const y = d.getFullYear();
      if (map[y]) {
        const amt = parseTxnAmount(t.amount);
        const isGold = (t.asset || t.assetType || '').toLowerCase().includes('gold');
        map[y].totalValue += amt;
        map[y].count += 1;
        if (isGold) {
          map[y].goldValue += amt;
          map[y].goldCount += 1;
        } else {
          map[y].silverValue += amt;
          map[y].silverCount += 1;
        }
      }
    });

    const items = years.map((y) => map[y]);
    let max = Math.max(...items.map((i) => i.totalValue), 0);
    if (max === 0) max = 50000;
    else max = Math.ceil(max / 10000) * 10000;

    return { items, maxVal: max };
  }, [transactions, referenceDate]);

  // =========================================================================
  // 2. Monthly Transactions Aggregation (Last 12 Months)
  // =========================================================================
  const monthlyChartData = useMemo(() => {
    const months = [];
    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(refYear, refMonth - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      months.push({
        key,
        label: key,
        shortLabel: d.toLocaleDateString('en-US', { month: 'short' }),
        totalValue: 0,
        goldValue: 0,
        silverValue: 0,
        count: 0,
        goldCount: 0,
        silverCount: 0
      });
    }

    const map = {};
    months.forEach((m) => { map[m.key] = m; });

    transactions.forEach((t) => {
      const d = parseTxnDate(t.date);
      if (!d) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      if (map[key]) {
        const amt = parseTxnAmount(t.amount);
        const isGold = (t.asset || t.assetType || '').toLowerCase().includes('gold');
        map[key].totalValue += amt;
        map[key].count += 1;
        if (isGold) {
          map[key].goldValue += amt;
          map[key].goldCount += 1;
        } else {
          map[key].silverValue += amt;
          map[key].silverCount += 1;
        }
      }
    });

    let max = Math.max(...months.map((i) => i.totalValue), 0);
    if (max === 0) max = 30000;
    else if (max < 5000) max = 5000;
    else max = Math.ceil(max / 5000) * 5000;

    return { items: months, maxVal: max };
  }, [transactions, referenceDate]);

  // =========================================================================
  // 3. Daily Transactions Aggregation (Last 30 Days)
  // =========================================================================
  const dailyChartData = useMemo(() => {
    const days = [];
    const refTime = referenceDate.getTime();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(refTime - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      days.push({
        key,
        label: key,
        shortLabel: `${mm}-${dd}`,
        totalValue: 0,
        goldValue: 0,
        silverValue: 0,
        count: 0,
        goldCount: 0,
        silverCount: 0
      });
    }

    const map = {};
    days.forEach((d) => { map[d.key] = d; });

    transactions.forEach((t) => {
      const d = parseTxnDate(t.date);
      if (!d) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      if (map[key]) {
        const amt = parseTxnAmount(t.amount);
        const isGold = (t.asset || t.assetType || '').toLowerCase().includes('gold');
        map[key].totalValue += amt;
        map[key].count += 1;
        if (isGold) {
          map[key].goldValue += amt;
          map[key].goldCount += 1;
        } else {
          map[key].silverValue += amt;
          map[key].silverCount += 1;
        }
      }
    });

    let max = Math.max(...days.map((i) => i.totalValue), 0);
    if (max === 0) max = 12;
    else if (max < 10) max = 10;
    else if (max < 100) max = Math.ceil(max / 10) * 10;
    else max = Math.ceil(max / 100) * 100;

    return { items: days, maxVal: max };
  }, [transactions, referenceDate]);

  // Donut Chart renderer
  const renderDonutChart = (silverPctStr, goldPctStr) => {
    const silverPct = parseFloat(silverPctStr) || 48.6;
    const goldPct = parseFloat(goldPctStr) || 51.4;

    const cx = 75;
    const cy = 75;
    const outerR = 60;
    const innerR = 34;
    const textR = (outerR + innerR) / 2;

    const goldAngle = Math.max(5, Math.min(355, (goldPct / 100) * 360));
    
    const goldPath = getDonutSegmentPath(cx, cy, outerR, innerR, 0, goldAngle);
    const silverPath = getDonutSegmentPath(cx, cy, outerR, innerR, goldAngle, 360);

    const goldTextAngle = goldAngle / 2;
    const silverTextAngle = goldAngle + (360 - goldAngle) / 2;

    const goldTextPos = polarToCartesian(cx, cy, textR, goldTextAngle);
    const silverTextPos = polarToCartesian(cx, cy, textR, silverTextAngle);

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '160px',
        overflow: 'hidden'
      }}>
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '100%',
            height: 'auto',
            aspectRatio: '1 / 1'
          }}
        >
          <path
            d={silverPath}
            fill="#b0b7c3"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          <path
            d={goldPath}
            fill="#cfa024"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {silverPct >= 8 && (
            <text
              x={silverTextPos.x}
              y={silverTextPos.y}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill="#ffffff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {silverPct.toFixed(1)}%
            </text>
          )}

          {goldPct >= 8 && (
            <text
              x={goldTextPos.x}
              y={goldTextPos.y}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill="#ffffff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {goldPct.toFixed(1)}%
            </text>
          )}
        </svg>
      </div>
    );
  };

  // Reusable Bar Chart Component with clean proportions and tooltips
  const renderBarChart = ({ title, subtitle, icon, data, maxVal, barMaxWidth = '38px', showEveryNthLabel = 1 }) => {
    const yTicks = [
      maxVal,
      maxVal * 0.8,
      maxVal * 0.6,
      maxVal * 0.4,
      maxVal * 0.2,
      0
    ];

    return (
      <div className="admin-card" style={{ textAlign: 'left', overflow: 'visible', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          {icon}
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--admin-text-main-light)' }}>
            {title}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '16px' }}>
          {subtitle}
        </div>

        {/* Chart Drawing Area */}
        <div style={{
          height: '145px',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          paddingLeft: '45px',
          paddingRight: '12px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {/* Y-axis tick labels */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '9.5px',
            color: '#9ca3af',
            userSelect: 'none',
            textAlign: 'right',
            paddingRight: '6px'
          }}>
            {yTicks.map((t, idx) => (
              <span key={idx}>{formatYAxisLabel(t)}</span>
            ))}
          </div>

          {/* Background Dashed Grid Lines */}
          <div style={{
            position: 'absolute',
            left: '45px',
            right: '12px',
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            <div style={{ borderTop: '1px dashed #f3f4f6', width: '100%' }}></div>
            <div style={{ borderTop: '1px dashed #f3f4f6', width: '100%' }}></div>
            <div style={{ borderTop: '1px dashed #f3f4f6', width: '100%' }}></div>
            <div style={{ borderTop: '1px dashed #f3f4f6', width: '100%' }}></div>
            <div style={{ borderTop: '1px dashed #f3f4f6', width: '100%' }}></div>
            <div style={{ borderTop: '1px solid #e5e7eb', width: '100%' }}></div>
          </div>

          {/* Bars Container */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-around',
            height: '100%',
            alignItems: 'flex-end',
            zIndex: 2,
            gap: '4px'
          }}>
            {data.map((item, idx) => {
              const heightPct = maxVal > 0 ? Math.min(100, Math.max(item.totalValue > 0 ? 3 : 0, (item.totalValue / maxVal) * 100)) : 0;
              const isHovered = hoveredBar && hoveredBar.key === item.key;

              return (
                <div
                  key={item.key || idx}
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    flex: 1,
                    maxWidth: barMaxWidth,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    cursor: item.totalValue > 0 ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: isHovered ? '#4f46e5' : '#6366f1',
                      borderRadius: '3px 3px 0 0',
                      transition: 'all 0.15s ease',
                      opacity: item.totalValue > 0 ? 1 : 0
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Floating Tooltip */}
          {hoveredBar && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 20,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '700', color: '#f8fafc' }}>{hoveredBar.label}</div>
              <div style={{ color: '#a5b4fc', fontWeight: '600' }}>
                ₹{hoveredBar.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              {hoveredBar.count > 0 && (
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>
                  {hoveredBar.count} orders (Gold: ₹{hoveredBar.goldValue.toFixed(0)} · Silver: ₹{hoveredBar.silverValue.toFixed(0)})
                </div>
              )}
            </div>
          )}
        </div>

        {/* X-axis Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingLeft: '45px',
          paddingRight: '12px',
          marginTop: '6px',
          fontSize: '10px',
          color: '#9ca3af',
          userSelect: 'none'
        }}>
          {data.map((item, idx) => {
            const showLabel = idx % showEveryNthLabel === 0 || item.totalValue > 0;
            return (
              <div
                key={item.key || idx}
                style={{
                  flex: 1,
                  maxWidth: barMaxWidth,
                  textAlign: 'center',
                  visibility: showLabel ? 'visible' : 'hidden',
                  fontWeight: item.totalValue > 0 ? '700' : '400',
                  color: item.totalValue > 0 ? 'var(--admin-text-main-light)' : '#9ca3af',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const now = new Date();
  const updatedTimestamp = `${now.toLocaleDateString('en-US')}, ${now.toLocaleTimeString('en-US')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header (Left-aligned) */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">
          Live metal rates, transaction analytics, and account verification notifications
        </p>
      </div>

      {/* 2. Top Two Rate Cards (Side by Side) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Gold (24K) Card */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              $
            </div>
            <TrendingUp size={15} color="var(--admin-green-trend)" />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '500', color: '#4b5563' }}>
              Gold (24K)
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', margin: '2px 0 1px 0', letterSpacing: '-0.2px', color: 'var(--admin-text-main-light)' }}>
              ₹{goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              per gram · INR
            </div>
          </div>
        </div>

        {/* Silver Card */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              $
            </div>
            <TrendingUp size={15} color="var(--admin-green-trend)" />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '500', color: '#4b5563' }}>
              Silver
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', margin: '2px 0 1px 0', letterSpacing: '-0.2px', color: 'var(--admin-text-main-light)' }}>
              ₹{silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              per gram · INR
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sales By Metal Donut Charts (Side by Side & 100% Symmetrical) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Sales by metal (value) */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '270px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Clock size={14} color="#6b7280" />
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--admin-text-main-light)' }}>
              Sales by metal (value)
            </span>
          </div>

          {/* Mathematically Exact Donut Chart */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderDonutChart(silverPercent, goldPercent)}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '8px', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#cfa024' }}></span>
              <span style={{ color: '#4b5563', fontWeight: '500' }}>Gold</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#b0b7c3' }}></span>
              <span style={{ color: '#4b5563', fontWeight: '500' }}>Silver</span>
            </div>
          </div>

          {/* Subtext */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            {goldValue >= silverValue
              ? `Gold sells more by value (₹${goldValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
              : `Silver sells more by value (₹${silverValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
            }
          </div>
        </div>

        {/* Sales by metal (transactions) */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '270px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Clock size={14} color="#6b7280" />
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--admin-text-main-light)' }}>
              Sales by metal (transactions)
            </span>
          </div>

          {/* Mathematically Exact Donut Chart */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderDonutChart(silverTxnPercent, goldTxnPercent)}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '8px', fontSize: '11.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#cfa024' }}></span>
              <span style={{ color: '#4b5563', fontWeight: '500' }}>Gold</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#b0b7c3' }}></span>
              <span style={{ color: '#4b5563', fontWeight: '500' }}>Silver</span>
            </div>
          </div>

          {/* Subtext */}
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
            {goldTxnCount >= silverTxnCount
              ? `Gold has more orders (${goldTxnCount})`
              : `Silver has more orders (${silverTxnCount})`
            }
          </div>
        </div>
      </div>

      {/* 4. A. Annual Transactions (Last 5 Years) */}
      {renderBarChart({
        title: 'Annual transactions (last 5 years)',
        subtitle: 'Annual transaction value (INR)',
        icon: <BarChart2 size={14} color="#6b7280" />,
        data: annualChartData.items,
        maxVal: annualChartData.maxVal,
        barMaxWidth: '56px',
        showEveryNthLabel: 1
      })}

      {/* 5. B. Monthly Transactions (Last 12 Months) */}
      {renderBarChart({
        title: 'Monthly transactions (last 12 months)',
        subtitle: 'Monthly transaction value (INR)',
        icon: <Calendar size={14} color="#6b7280" />,
        data: monthlyChartData.items,
        maxVal: monthlyChartData.maxVal,
        barMaxWidth: '40px',
        showEveryNthLabel: 1
      })}

      {/* 6. C. Daily Transactions (Last 30 Days) */}
      {renderBarChart({
        title: 'Daily transactions (last 30 days)',
        subtitle: 'Daily transaction value (INR)',
        icon: <BarChart2 size={14} color="#6b7280" />,
        data: dailyChartData.items,
        maxVal: dailyChartData.maxVal,
        barMaxWidth: '16px',
        showEveryNthLabel: 3
      })}

      {/* 7. Footer Rates Updated Timestamp */}
      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', textAlign: 'left' }}>
        Rates updated: {updatedTimestamp}
      </div>

    </div>
  );
}
