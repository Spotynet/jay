import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const WIDTH = 200;
const STROKE = 14;
const R = 82;
const CX = WIDTH / 2;
const CY = R + STROKE / 2;
const HEIGHT = R + STROKE;

const ARC_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
const ARC_LENGTH = Math.PI * R;

const formatPct = (balance: number, total: number) => {
  if (total <= 0) return '0%';
  return `${Math.round((balance / total) * 100)}%`;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

interface BudgetFillChartProps {
  spent: number;
  totalBudget: number;
  income?: number;
}

export function BudgetFillChart({ spent, totalBudget, income = 0 }: BudgetFillChartProps) {
  const { colors } = useTheme();
  const over = totalBudget > 0 && spent > totalBudget;
  const pct = totalBudget > 0 ? spent / totalBudget : 0;
  const clamped = Math.max(0, Math.min(pct, 1));
  const dash = ARC_LENGTH * clamped;

  const hasIncome = income > 0;
  const remaining = hasIncome ? income - spent : totalBudget - spent;
  const statusColor = remaining < 0 ? colors.error : colors.subtext;
  const statusLabel = hasIncome
    ? `${formatMoney(Math.abs(remaining))} ${remaining < 0 ? 'over income' : 'free to spend'}`
    : `${formatMoney(Math.abs(remaining))} ${remaining < 0 ? 'over' : 'left'}`;

  const trackColor = colors.surfaceElevated || colors.border;
  const fillColor = over ? colors.error : colors.text;

  return (
    <View style={styles.gauge}>
      <Svg width={WIDTH} height={HEIGHT}>
        <Path
          d={ARC_PATH}
          fill="none"
          stroke={trackColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {clamped > 0 && (
          <Path
            d={ARC_PATH}
            fill="none"
            stroke={fillColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash}, ${ARC_LENGTH}`}
          />
        )}
        <SvgText
          x={CX}
          y={CY - R * 0.32}
          textAnchor="middle"
          fontFamily="Manrope_400Regular"
          fontSize={19}
          fill={fillColor}
        >
          {formatPct(spent, totalBudget)}
        </SvgText>
        <SvgText
          x={CX}
          y={CY - R * 0.10}
          textAnchor="middle"
          fontFamily="Manrope_400Regular"
          fontSize={11}
          fill={statusColor}
        >
          {statusLabel}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  gauge: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});