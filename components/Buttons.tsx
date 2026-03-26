import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';


type StandardButtonProps = TouchableOpacityProps & {
  title: string;
  bgColor?: string;        // background color (Tailwind class)
  textColor?: string;      // text color (Tailwind class)
  fontWeight?: string;     // font weight (Tailwind class, e.g., "font-bold")
  customStyle?: string;    // additional Tailwind classes
  disabled?: boolean;
};

export function StandardButton({
  title,
  bgColor = 'bg-blue-500',
  textColor = 'text-white',
  fontWeight = 'font-semibold',
  customStyle = '', 
  disabled = false,
  ...props
}: StandardButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      className={`p-3 mb-3 rounded-lg items-center ${bgColor} ${customStyle}`}
      {...props}
    >
      <Text className={`${textColor} ${fontWeight}`}>{title}</Text>
    </TouchableOpacity>
  );
}