import { TextInput, TextInputProps } from 'react-native';

type SingleLineInputProps = TextInputProps & {
  placeholderText?: string;   // text to show when input is empty
  placeholderColor?: string;  // color of placeholder text
  textColor?: string;         // input text color
  fontWeight?: string;        // Tailwind font weight
  customStyle?: string;       // extra Tailwind classes
};

export function SingleLineInput({
  placeholderText = '',
  placeholderColor = 'text-gray-400',
  textColor = 'text-black',
  fontWeight = 'font-normal',
  customStyle = '',
  ...props
}: SingleLineInputProps) {
  return (
    <TextInput
      className={`border border-gray-400 p-3 mb-3 w-full max-w-xs rounded-lg bg-white ${textColor} ${fontWeight} ${customStyle}`}
      placeholder={placeholderText}
      placeholderTextColor={placeholderColor.replace('text-', '')} // remove "text-" for React Native
      {...props}
    />
  );
}