import React from 'react';
import { View, SafeAreaView, ViewStyle, StatusBar } from 'react-native';
import { styled } from 'nativewind';
import { useTheme } from '../../context/ThemeContext';

const StyledView = styled(View);
const StyledSafeAreaView = styled(SafeAreaView);

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withPadding?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
    children,
    style,
    withPadding = true
}) => {
    const { isDark } = useTheme();

    return (
        <StyledSafeAreaView className={`flex-1 ${isDark ? 'bg-dark-bg' : 'bg-nautic-bg'}`}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? "#0f172a" : "#F1F5F9"}
            />
            <StyledView
                className={`flex-1 ${withPadding ? 'px-4' : ''}`}
                style={style}
            >
                {children}
            </StyledView>
        </StyledSafeAreaView>
    );
};
