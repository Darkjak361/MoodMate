/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 * apologies this is being all done, even though it 
 * wasn't explicity mentioned in the certain assessments (i.e. 
 * revised project proposal, and so on), but our group wanted 
 * to add all of these features, so that it can helpful for 
 * all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
 * "CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
