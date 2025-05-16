import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export const MindIcon = ({ size = 80, color = '#0a7ea4' }: IconProps) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M12 3c.34 0 .67.03 1 .08V2h-2v1.08c.33-.05.66-.08 1-.08zm2 18h-4v1h4v-1zm7-15.74V4h-1.25c-.41 0-.75.34-.75.75v1.5h-1.75c-.41 0-.75.34-.75.75v1.75h-1.5c-.41 0-.75.34-.75.75v1.5H9.25c-.41 0-.75.34-.75.75v1.5H6.75c-.41 0-.75.34-.75.75v1.75H4.25c-.41 0-.75.34-.75.75v1.5H2v1.25c0 .41.34.75.75.75h1.5v1.75c0 .41.34.75.75.75h1.75v1.5c0 .41.34.75.75.75h1.5v1.75c0 .41.34.75.75.75h1.75v1.5c0 .41.34.75.75.75h1.5v1.75c0 .41.34.75.75.75h1.75v1.5c0 .41.34.75.75.75H18v-1.25c0-.41-.34-.75-.75-.75h-1.5v-1.75c0-.41-.34-.75-.75-.75h-1.75v-1.5c0-.41-.34-.75-.75-.75h-1.5v-1.75c0-.41-.34-.75-.75-.75H9.25v-1.5c0-.41-.34-.75-.75-.75H6.75v-1.75c0-.41-.34-.75-.75-.75H4.25v-1.5c0-.41-.34-.75-.75-.75H2v-1.25c0-.41.34-.75.75-.75h1.5V9.25c0-.41.34-.75.75-.75h1.75V6.75c0-.41.34-.75.75-.75h1.5V4.25c0-.41.34-.75.75-.75h1.75V1.75c0-.41.34-.75.75-.75H18z'
        fill={color}
      />
    </Svg>
  </View>
);

export const BodyIcon = ({ size = 80, color = '#0a7ea4' }: IconProps) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1.5 20v-6h-2v-2h2V9.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2V14h2v2h-2v6h-2v-6h-2v6h-2z'
        fill={color}
      />
    </Svg>
  </View>
);

export const SpiritIcon = ({ size = 80, color = '#0a7ea4' }: IconProps) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <G fill={color}>
        <Path d='M12 2L8 6h8l-4-4z' />
        <Path d='M12 22l4-4H8l4 4z' />
        <Path d='M12 6v12M8 12h8' />
        <Circle cx='12' cy='12' r='3' />
      </G>
    </Svg>
  </View>
);

const FocusAreaIcons = {
  MindIcon,
  BodyIcon,
  SpiritIcon,
};

export default FocusAreaIcons;
