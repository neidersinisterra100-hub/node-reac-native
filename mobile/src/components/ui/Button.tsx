import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledButton = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    className = '',
    icon,
}) => {
    const getVariantStyle = () => {
        if (disabled) return 'bg-gray-300 border-gray-300';

        switch (variant) {
            case 'primary':
                return 'bg-nautic-primary border-nautic-primary';
            case 'secondary':
                return 'bg-nautic-accent border-nautic-accent';
            case 'outline':
                return 'bg-transparent border-nautic-primary border-2';
            case 'ghost':
                return 'bg-transparent border-transparent';
            default:
                return 'bg-nautic-primary';
        }
    };

    const getTextStyle = () => {
        if (disabled) return 'text-gray-500';

        switch (variant) {
            case 'primary':
            case 'secondary':
                return 'text-white font-bold';
            case 'outline':
                return 'text-nautic-primary font-bold';
            case 'ghost':
                return 'text-nautic-primary';
            default:
                return 'text-white font-bold';
        }
    };

    return (
        <StyledButton
            onPress={onPress}
            disabled={disabled || loading}
            className={`rounded-xl py-4 px-6 flex-row justify-center items-center ${getVariantStyle()} ${className}`}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0B4F9C' : '#FFF'} />
            ) : (
                <>
                    {icon && <StyledText className="mr-2">{icon}</StyledText>}
                    <StyledText className={`text-base text-center ${getTextStyle()}`}>
                        {title}
                    </StyledText>
                </>
            )}
        </StyledButton>
    );
};
