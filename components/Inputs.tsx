import { Platform, TextInput, TextInputProps } from 'react-native';

type BaseInputProps = TextInputProps & {
  placeholderText?: string;
  placeholderColor?: string;
  textColor?: string;
  fontWeight?: string;
  customStyle?: string;
  
};

/* =========================
   Single Line Input
========================= */
export function SingleLineInput({
  placeholderText = '',
  placeholderColor = 'text-gray-400',
  textColor = 'text-black',
  fontWeight = 'font-normal',
  customStyle = '',
  adjustFontSize = false, // new prop
  minFontSize = 12,       // new prop
  ...props
}: BaseInputProps & { adjustFontSize?: boolean; minFontSize?: number }) {
  return (
  <TextInput
    className={`border border-gray-400 p-3 mb-3 w-full max-w-xl rounded-lg bg-white 
      ${textColor} ${fontWeight} ${customStyle}`}
    placeholder={placeholderText}
    placeholderTextColor={placeholderColor.replace('text-', '')}
    numberOfLines={1}           // single line
    style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} // truncates text
    {...props}
  />
  );
}

/* =========================
   Multi Line Input
========================= */
export function MultiLineInput({
  placeholderText = '',
  placeholderColor = 'text-gray-400',
  textColor = 'text-black',
  fontWeight = 'font-normal',
  customStyle = '',
  ...props
}: BaseInputProps) {
  return (
    <TextInput
      placeholder={placeholderText}
      placeholderTextColor={placeholderColor.replace('text-', '')}
      multiline
      textAlignVertical="top"
      scrollEnabled
      className={`border border-gray-400 p-3 mb-3 w-full max-w-xl rounded-lg bg-white
        ${textColor} ${fontWeight} ${customStyle}`}
      style={[
        { minHeight: 80 }, // default ~3 lines
        Platform.OS === 'web' ? ({ resize: 'vertical', overflow: 'auto' } as any) : {},
        props.style,
      ]}
      {...props}
    />
  );
}