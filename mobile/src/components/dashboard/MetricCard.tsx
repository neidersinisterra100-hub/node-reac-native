import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  value: string;
  icon: string;
  iconColor?: string;
  iconBackgroundColor?: string;
};

export const MetricCard = ({ title, value, icon, iconColor, iconBackgroundColor }: Props) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        <View style={[styles.iconContainer, iconBackgroundColor ? { backgroundColor: iconBackgroundColor } : {}]}>
          <IconButton
            icon={icon}
            iconColor={iconColor || colors.primary}
            size={20}
            style={{ margin: 0 }}
          />

        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  iconContainer: {
    // padding: 4,
    borderRadius: 20,
  }
});
