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
  if (isNaN(startAngle) || isNaN(endAngle)) return '';
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
  if (amt === undefined || amt === null) return 0;
  if (typeof amt === 'number') return isNaN(amt) ? 0 : amt;
  const cleaned = amt.toString().replace(/,/g, '').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

// Helper to parse dates in multiple formats safely
function parseTxnDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    const cleaned = dateStr.toString().split(',')[0].trim();
    const d2 = new Date(cleaned);
    if (!isNaN(d2.getTime())) return d2;

    const match = dateStr.toString().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const d3 = new Date(y, m, day);
      if (!isNaN(d3.getTime())) return d3;
    }
  } catch (e) {
    return null;
  }

  return null;
}

// Helper for formatting Y-axis INR currency cleanly (e.g. ₹50K, ₹10K, ₹500, ₹0)
function formatYAxisINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) {
    const kVal = val / 1000;
    return `₹${kVal % 1 === 0 ? kVal.toFixed(0) : kVal.toFixed(1)}K`;
  }
  if (val <= 0) return '₹0';
  return `₹${Math.round(val)}`;
}

// =========================================================================
// Interactive Donut Chart Component with Live Data, Tooltips & Legend Toggle
// =========================================================================
function InteractiveDonutCard({
  title,
  type = 'value', // 'value' | 'transactions'
  goldRaw = 0,
  silverRaw = 0,
  goldColor = '#cfa024',
  silverColor = '#b0b7c3'
}) {
  const [showGold, setShowGold] = useState(true);
  const [showSilver, setShowSilver] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null); // 'gold' | 'silver' | null

  // Calculate visible values and recalculated percentages
  const visibleGoldVal = showGold ? goldRaw : 0;
  const visibleSilverVal = showSilver ? silverRaw : 0;
  const totalVisible = visibleGoldVal + visibleSilverVal;

  let goldPct = 0;
  let silverPct = 0;

  if (totalVisible > 0) {
    if (showGold && showSilver) {
      goldPct = (visibleGoldVal / totalVisible) * 100;
      silverPct = (visibleSilverVal / totalVisible) * 100;
    } else if (showGold) {
      goldPct = 100;
      silverPct = 0;
    } else if (showSilver) {
      goldPct = 0;
      silverPct = 100;
    }
  }

  // Dimensions
  const cx = 95;
  const cy = 95;
  const baseOuterR = 75;
  const baseInnerR = 42;
  const textR = (baseOuterR + baseInnerR) / 2;

  // Dynamic outer radius on hover for subtle animation
  const isGoldHovered = hoveredCategory === 'gold';
  const isSilverHovered = hoveredCategory === 'silver';

  const goldOuterR = isGoldHovered ? baseOuterR + 4 : baseOuterR;
  const silverOuterR = isSilverHovered ? baseOuterR + 4 : baseOuterR;

  // Angles calculation (Gold from 0° to goldAngle, Silver from goldAngle to 360°)
  const goldAngle = Math.max(0, Math.min(360, (goldPct / 100) * 360));

  let goldPath = '';
  let silverPath = '';
  let goldTextPos = null;
  let silverTextPos = null;

  if (showGold && goldPct > 0) {
    if (goldPct >= 99.9) {
      goldPath = getDonutSegmentPath(cx, cy, goldOuterR, baseInnerR, 0, 359.99);
      goldTextPos = polarToCartesian(cx, cy, textR, 0);
    } else {
      goldPath = getDonutSegmentPath(cx, cy, goldOuterR, baseInnerR, 0, goldAngle);
      goldTextPos = polarToCartesian(cx, cy, textR, goldAngle / 2);
    }
  }

  if (showSilver && silverPct > 0) {
    if (silverPct >= 99.9) {
      silverPath = getDonutSegmentPath(cx, cy, silverOuterR, baseInnerR, 0, 359.99);
      silverTextPos = polarToCartesian(cx, cy, textR, 180);
    } else {
      silverPath = getDonutSegmentPath(cx, cy, silverOuterR, baseInnerR, goldAngle, 360);
      silverTextPos = polarToCartesian(cx, cy, textR, goldAngle + (360 - goldAngle) / 2);
    }
  }

  // Subtext calculation
  let subtext = '';
  if (type === 'value') {
    if (goldRaw >= silverRaw) {
      subtext = `Gold sells more by value (₹${goldRaw.toLocaleString('en-IN', { maximumFractionDigits: 2 })})`;
    } else {
      subtext = `Silver sells more by value (₹${silverRaw.toLocaleString('en-IN', { maximumFractionDigits: 2 })})`;
    }
  } else {
    if (goldRaw >= silverRaw) {
      subtext = `Gold has more orders (${goldRaw})`;
    } else {
      subtext = `Silver has more orders (${silverRaw})`;
    }
  }

  return (
    <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '340px', boxSizing: 'border-box', position: 'relative' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Clock size={16} color="#6b7280" />
        <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--admin-text-main-light)' }}>
          {title}
        </span>
      </div>

      {/* Donut Chart Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '190px'
      }}>
        <svg
          width="190"
          height="190"
          viewBox="0 0 190 190"
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '100%',
            height: 'auto',
            aspectRatio: '1 / 1',
            overflow: 'visible'
          }}
        >
          {/* Empty state background ring if both hidden */}
          {!showGold && !showSilver && (
            <circle
              cx={cx}
              cy={cy}
              r={(baseOuterR + baseInnerR) / 2}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={baseOuterR - baseInnerR}
              opacity="0.6"
            />
          )}

          {/* Silver Donut Segment */}
          {showSilver && silverPath && (
            <path
              d={silverPath}
              fill={silverColor}
              stroke="#ffffff"
              strokeWidth="2"
              onMouseEnter={() => setHoveredCategory('silver')}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isSilverHovered ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.18)) brightness(1.08)' : 'none',
                opacity: hoveredCategory && hoveredCategory !== 'silver' ? 0.45 : 1
              }}
            />
          )}

          {/* Gold Donut Segment */}
          {showGold && goldPath && (
            <path
              d={goldPath}
              fill={goldColor}
              stroke="#ffffff"
              strokeWidth="2"
              onMouseEnter={() => setHoveredCategory('gold')}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isGoldHovered ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.18)) brightness(1.08)' : 'none',
                opacity: hoveredCategory && hoveredCategory !== 'gold' ? 0.45 : 1
              }}
            />
          )}

          {/* Silver Percentage Label */}
          {showSilver && silverPct >= 9 && silverTextPos && (
            <text
              x={silverTextPos.x}
              y={silverTextPos.y}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#ffffff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {silverPct.toFixed(1)}%
            </text>
          )}

          {/* Gold Percentage Label */}
          {showGold && goldPct >= 9 && goldTextPos && (
            <text
              x={goldTextPos.x}
              y={goldTextPos.y}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#ffffff"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {goldPct.toFixed(1)}%
            </text>
          )}

          {/* Empty state label */}
          {!showGold && !showSilver && (
            <text
              x={cx}
              y={cy}
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#9ca3af"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              Hidden
            </text>
          )}
        </svg>

        {/* Interactive Floating Tooltip */}
        {hoveredCategory && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '11.5px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            zIndex: 20,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '700', marginBottom: '2px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: hoveredCategory === 'gold' ? goldColor : silverColor
              }}></span>
              <span style={{ color: '#f8fafc' }}>
                {hoveredCategory === 'gold' ? 'Gold' : 'Silver'}
              </span>
            </div>

            <div style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '12px' }}>
              {type === 'value' ? (
                <>Actual Value: ₹{(hoveredCategory === 'gold' ? goldRaw : silverRaw).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
              ) : (
                <>Transaction Count: {hoveredCategory === 'gold' ? goldRaw : silverRaw} orders</>
              )}
            </div>

            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px', fontWeight: '600' }}>
              Share: {(hoveredCategory === 'gold' ? goldPct : silverPct).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Interactive Legend (Clickable to toggle visibility) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '10px',
        fontSize: '12px',
        userSelect: 'none'
      }}>
        {/* Gold Legend Item */}
        <div
          onClick={() => setShowGold(!showGold)}
          onMouseEnter={() => showGold && setHoveredCategory('gold')}
          onMouseLeave={() => setHoveredCategory(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            opacity: showGold ? 1 : 0.4,
            transition: 'opacity 0.15s ease',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
          title={showGold ? 'Click to hide Gold' : 'Click to show Gold'}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: goldColor,
            border: !showGold ? '1px dashed #9ca3af' : 'none'
          }}></span>
          <span style={{
            color: '#4b5563',
            fontWeight: showGold ? '700' : '400',
            textDecoration: !showGold ? 'line-through' : 'none'
          }}>
            Gold
          </span>
        </div>

        {/* Silver Legend Item */}
        <div
          onClick={() => setShowSilver(!showSilver)}
          onMouseEnter={() => showSilver && setHoveredCategory('silver')}
          onMouseLeave={() => setHoveredCategory(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            opacity: showSilver ? 1 : 0.4,
            transition: 'opacity 0.15s ease',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
          title={showSilver ? 'Click to hide Silver' : 'Click to show Silver'}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: silverColor,
            border: !showSilver ? '1px dashed #9ca3af' : 'none'
          }}></span>
          <span style={{
            color: '#4b5563',
            fontWeight: showSilver ? '700' : '400',
            textDecoration: !showSilver ? 'line-through' : 'none'
          }}>
            Silver
          </span>
        </div>
      </div>

      {/* Subtext */}
      <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#6b7280', marginTop: '6px' }}>
        {subtext}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onSelectTab }) {
  const appContext = useApp();
  const rawGoldRate = appContext?.goldRate;
  const rawSilverRate = appContext?.silverRate;
  const rawTransactions = appContext?.transactions;

  const goldRate = typeof rawGoldRate === 'number' && !isNaN(rawGoldRate) ? rawGoldRate : (parseFloat(rawGoldRate) || 13818.88);
  const silverRate = typeof rawSilverRate === 'number' && !isNaN(rawSilverRate) ? rawSilverRate : (parseFloat(rawSilverRate) || 206.17);
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];

  // Hovered tooltip state for bar charts
  const [hoveredBar, setHoveredBar] = useState(null);

  // Reference date: latest transaction date or current system date
  const referenceDate = useMemo(() => {
    let latest = new Date();
    transactions.forEach((t) => {
      if (!t?.date) return;
      const d = parseTxnDate(t.date);
      if (d && !isNaN(d.getTime()) && d.getTime() > latest.getTime()) {
        latest = d;
      }
    });
    return !isNaN(latest.getTime()) ? latest : new Date();
  }, [transactions]);

  // Dynamic Sales by Metal calculations from actual transactions
  const { 
    goldValue, 
    silverValue, 
    goldTxnCount, 
    silverTxnCount
  } = useMemo(() => {
    let gVal = 0;
    let sVal = 0;
    let gCount = 0;
    let sCount = 0;

    transactions.forEach((t) => {
      const amt = parseTxnAmount(t?.amount);
      const isGold = (t?.asset || t?.assetType || t?.metal || '').toLowerCase().includes('gold');
      if (isGold) {
        gVal += amt;
        gCount += 1;
      } else {
        sVal += amt;
        sCount += 1;
      }
    });

    return {
      goldValue: gVal,
      silverValue: sVal,
      goldTxnCount: gCount,
      silverTxnCount: sCount
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
        fullLabel: `Year ${y}`,
        totalValue: 0,
        goldValue: 0,
        silverValue: 0,
        count: 0,
        goldCount: 0,
        silverCount: 0
      };
    });

    transactions.forEach((t) => {
      if (!t?.date) return;
      const d = parseTxnDate(t.date);
      if (!d) return;
      const y = d.getFullYear();
      if (map[y]) {
        const amt = parseTxnAmount(t.amount);
        const isGold = (t.asset || t.assetType || t.metal || '').toLowerCase().includes('gold');
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
    if (max === 0 || isNaN(max)) max = 50000;
    else if (max < 10000) max = 10000;
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
      const shortLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const fullLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({
        key,
        label: shortLabel,
        fullLabel,
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
      if (!t?.date) return;
      const d = parseTxnDate(t.date);
      if (!d) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      if (map[key]) {
        const amt = parseTxnAmount(t.amount);
        const isGold = (t.asset || t.assetType || t.metal || '').toLowerCase().includes('gold');
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
    if (max === 0 || isNaN(max)) max = 30000;
    else if (max < 5000) max = 5000;
    else if (max < 20000) max = Math.ceil(max / 5000) * 5000;
    else max = Math.ceil(max / 10000) * 10000;

    return { items: months, maxVal: max };
  }, [transactions, referenceDate]);

  // =========================================================================
  // 3. Daily Transactions Aggregation (Last 30 Days)
  // =========================================================================
  const dailyChartData = useMemo(() => {
    const days = [];
    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth();
    const refDay = referenceDate.getDate();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(refYear, refMonth, refDay - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const fullLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      days.push({
        key,
        label: shortLabel,
        fullLabel,
        dayIdx: 29 - i,
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
      if (!t?.date) return;
      const d = parseTxnDate(t.date);
      if (!d) return;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      if (map[key]) {
        const amt = parseTxnAmount(t.amount);
        const isGold = (t.asset || t.assetType || t.metal || '').toLowerCase().includes('gold');
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
    if (max === 0 || isNaN(max)) max = 1000;
    else if (max < 500) max = 500;
    else if (max < 1000) max = 1000;
    else if (max < 5000) max = Math.ceil(max / 1000) * 1000;
    else max = Math.ceil(max / 5000) * 5000;

    return { items: days, maxVal: max };
  }, [transactions, referenceDate]);

  // Reusable Bar Chart Component with spacious 320px height, INR labels and tooltips
  const renderBarChart = ({ 
    title, 
    subtitle, 
    icon, 
    data, 
    maxVal, 
    barMaxWidth = '48px',
    isDaily = false
  }) => {
    const safeData = Array.isArray(data) ? data : [];
    const safeMax = typeof maxVal === 'number' && !isNaN(maxVal) && maxVal > 0 ? maxVal : 1000;

    const yTicks = [
      safeMax,
      safeMax * 0.8,
      safeMax * 0.6,
      safeMax * 0.4,
      safeMax * 0.2,
      0
    ];

    return (
      <div className="admin-card" style={{ textAlign: 'left', overflow: 'visible', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          {icon}
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--admin-text-main-light)' }}>
            {title}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
          {subtitle}
        </div>

        {/* Spacious Chart Drawing Area (320px Height) */}
        <div style={{
          height: '320px',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          paddingLeft: '56px',
          paddingRight: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {/* Y-axis tick labels with INR currency */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: '600',
            color: '#9ca3af',
            userSelect: 'none',
            textAlign: 'right',
            paddingRight: '8px'
          }}>
            {yTicks.map((t, idx) => (
              <span key={idx}>{formatYAxisINR(t)}</span>
            ))}
          </div>

          {/* Background Dashed Grid Lines */}
          <div style={{
            position: 'absolute',
            left: '56px',
            right: '16px',
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
            gap: isDaily ? '3px' : '8px'
          }}>
            {safeData.map((item, idx) => {
              const heightPct = safeMax > 0 ? Math.min(100, Math.max(item.totalValue > 0 ? 3 : 0, (item.totalValue / safeMax) * 100)) : 0;
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
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      backgroundColor: isHovered ? '#4f46e5' : '#6366f1',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.15s ease',
                      opacity: item.totalValue > 0 ? 1 : 0.12,
                      minHeight: item.totalValue > 0 ? '6px' : '0px'
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
              top: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 20,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '3px' }}>
                {hoveredBar.fullLabel || hoveredBar.label}
              </div>
              <div style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '13px' }}>
                Transaction Value: ₹{hoveredBar.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {hoveredBar.count > 0 ? (
                <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {hoveredBar.goldCount > 0 && (
                    <span style={{ color: '#fcd34d' }}>
                      Gold: ₹{hoveredBar.goldValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({hoveredBar.goldCount})
                    </span>
                  )}
                  {hoveredBar.silverCount > 0 && (
                    <span style={{ color: '#e2e8f0' }}>
                      Silver: ₹{hoveredBar.silverValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({hoveredBar.silverCount})
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  No transactions recorded
                </div>
              )}
            </div>
          )}
        </div>

        {/* X-axis Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingLeft: '56px',
          paddingRight: '16px',
          marginTop: '10px',
          fontSize: '11px',
          color: '#9ca3af',
          userSelect: 'none'
        }}>
          {safeData.map((item, idx) => {
            let isVisible = true;
            if (isDaily) {
              isVisible = idx === 0 || idx === 5 || idx === 10 || idx === 15 || idx === 20 || idx === 25 || idx === safeData.length - 1;
            }

            return (
              <div
                key={item.key || idx}
                style={{
                  flex: 1,
                  maxWidth: barMaxWidth,
                  textAlign: 'center',
                  visibility: isVisible ? 'visible' : 'hidden',
                  fontWeight: item.totalValue > 0 ? '700' : '500',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      
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
        gap: '20px'
      }}>
        {/* Gold (24K) Card */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '15px'
            }}>
              $
            </div>
            <TrendingUp size={16} color="var(--admin-green-trend)" />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>
              Gold (24K)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', margin: '2px 0 1px 0', letterSpacing: '-0.2px', color: 'var(--admin-text-main-light)' }}>
              ₹{goldRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>
              per gram · INR
            </div>
          </div>
        </div>

        {/* Silver Card */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '15px'
            }}>
              $
            </div>
            <TrendingUp size={16} color="var(--admin-green-trend)" />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>
              Silver
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', margin: '2px 0 1px 0', letterSpacing: '-0.2px', color: 'var(--admin-text-main-light)' }}>
              ₹{silverRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>
              per gram · INR
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sales By Metal Donut Charts (Interactive, Symmetrical, Live Data Connected) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Sales by metal (value) */}
        <InteractiveDonutCard
          title="Sales by metal (value)"
          type="value"
          goldRaw={goldValue}
          silverRaw={silverValue}
          goldColor="#cfa024"
          silverColor="#b0b7c3"
        />

        {/* Sales by metal (transactions) */}
        <InteractiveDonutCard
          title="Sales by metal (transactions)"
          type="transactions"
          goldRaw={goldTxnCount}
          silverRaw={silverTxnCount}
          goldColor="#cfa024"
          silverColor="#b0b7c3"
        />
      </div>

      {/* 4. A. Annual Transactions (Last 5 Years, 320px Height) */}
      {renderBarChart({
        title: 'Annual transactions (last 5 years)',
        subtitle: 'Annual transaction value (INR)',
        icon: <BarChart2 size={16} color="#6b7280" />,
        data: annualChartData.items,
        maxVal: annualChartData.maxVal,
        barMaxWidth: '64px',
        isDaily: false
      })}

      {/* 5. B. Monthly Transactions (Last 12 Months, 320px Height) */}
      {renderBarChart({
        title: 'Monthly transactions (last 12 months)',
        subtitle: 'Monthly transaction value (INR)',
        icon: <Calendar size={16} color="#6b7280" />,
        data: monthlyChartData.items,
        maxVal: monthlyChartData.maxVal,
        barMaxWidth: '44px',
        isDaily: false
      })}

      {/* 6. C. Daily Transactions (Last 30 Days, 320px Height) */}
      {renderBarChart({
        title: 'Daily transactions (last 30 days)',
        subtitle: 'Daily transaction value (INR)',
        icon: <BarChart2 size={16} color="#6b7280" />,
        data: dailyChartData.items,
        maxVal: dailyChartData.maxVal,
        barMaxWidth: '20px',
        isDaily: true
      })}

      {/* 7. Footer Rates Updated Timestamp */}
      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', textAlign: 'left' }}>
        Rates updated: {updatedTimestamp}
      </div>

    </div>
  );
}
