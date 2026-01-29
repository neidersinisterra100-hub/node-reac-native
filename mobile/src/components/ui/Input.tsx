import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className,
    ...props
}) => {
    return (
        <StyledView className="mb-4">
            {label && (
                <StyledText className="text-nautic-text font-semibold mb-2 ml-1 text-sm">
                    {label}
                </StyledText>
            )}
            <StyledView className={`flex-row items-center bg-white border rounded-xl px-4 py-3 ${error ? 'border-red-500' : 'border-gray-200'}`}>
                {icon && <StyledView className="mr-3">{icon}</StyledView>}
                <StyledTextInput
                    className={`flex-1 text-nautic-text text-base ${className || ''}`}
                    placeholderTextColor="#94A3B8"
                    {...props}
                />
            </StyledView>
            {error && (
                <StyledText className="text-red-500 text-xs mt-1 ml-1">
                    {error}
                </StyledText>
            )}
        </StyledView>
    );
};
