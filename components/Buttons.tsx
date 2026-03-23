import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type StandardButtonProps = TouchableOpacityProps & {
  title: string;
  bgColor?: string;        // background color (Tailwind class)
  textColor?: string;      // text color (Tailwind class)
  fontWeight?: string;     // font weight (Tailwind class, e.g., "font-bold")
  customStyle?: string;    // additional Tailwind classes
};

export function StandardButton({
  title,
  bgColor = 'bg-blue-500',
  textColor = 'text-white',
  fontWeight = 'font-semibold',
  customStyle = '',
  ...props
}: StandardButtonProps) {
  return (
    <TouchableOpacity
      className={`p-3 mb-3 w-full rounded-lg items-center ${bgColor} ${customStyle}`}
      {...props}
    >
      <Text className={`${textColor} ${fontWeight}`}>{title}</Text>
    </TouchableOpacity>
  );
}